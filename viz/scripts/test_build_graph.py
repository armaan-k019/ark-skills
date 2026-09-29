"""Tests for build_graph.py. Run: python3 -m unittest discover viz/scripts

Fixture skills are named SKILL.fixture.md, not SKILL.md, so that the phase 1
acceptance command (`find . -name SKILL.md`) still counts only the repo's real
skills. The extractor takes the filename as a parameter, so the same code runs.
"""

import contextlib
import io
import json
import shutil
import tempfile
import unittest
from pathlib import Path

import build_graph as bg

HERE = Path(__file__).resolve().parent
FIXTURE = HERE / "fixtures" / "repo"
BROKEN = HERE / "fixtures" / "broken-no-settings"
REPO = HERE.parent.parent
FIXTURE_NAME = "SKILL.fixture.md"


def build(root):
    return bg.build_graph(root, skill_filename=FIXTURE_NAME, families_path=Path(root) / "families.json")


class FixtureGraph(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.graph = build(FIXTURE)
        cls.nodes = {n["id"]: n for n in cls.graph["nodes"]}
        cls.edges = {(e["source"], e["target"], e["kind"]): e for e in cls.graph["edges"]}

    def edge(self, source, target, kind="skill-skill"):
        return self.edges.get((source, target, kind))

    # Frontmatter parsing

    def test_frontmatter_folded_block_scalar(self):
        self.assertEqual(
            self.nodes["skill:alpha"]["description"],
            "Alpha folds this description across two lines.",
        )

    def test_frontmatter_quoted_scalar_keeps_colon(self):
        self.assertEqual(
            self.nodes["skill:gamma"]["description"],
            "Gamma has a quoted description: with a colon.",
        )

    def test_frontmatter_literal_block_and_body_start(self):
        fields, body_start = bg.parse_frontmatter(
            "---\nname: x\ndescription: |\n  line one\n  line two\n---\nbody\n"
        )
        self.assertEqual(fields, {"name": "x", "description": "line one\nline two"})
        self.assertEqual(body_start, 6)

    def test_no_frontmatter(self):
        self.assertEqual(bg.parse_frontmatter("# Title\ntext\n"), ({}, 0))

    def test_unterminated_frontmatter_fails_loudly(self):
        with self.assertRaises(bg.GraphError):
            bg.parse_frontmatter("---\nname: x\n# never closed\n")

    # A skill with no description

    def test_skill_without_description_omits_field(self):
        beta = self.nodes["skill:beta"]
        self.assertEqual(beta["name"], "beta")
        self.assertNotIn("description", beta)

    # Defer edges

    def test_defer_edge_carries_file_and_line(self):
        edge = self.edge("skill:alpha", "skill:beta")
        self.assertIsNotNone(edge)
        self.assertEqual(edge["file"], "alpha/SKILL.fixture.md")
        source_lines = (FIXTURE / edge["file"]).read_text(encoding="utf-8").split("\n")
        for line in edge["lines"]:
            self.assertIn("beta", source_lines[line - 1])
        self.assertEqual(edge["line"], edge["lines"][0])

    def test_suite_skills_reference_each_other(self):
        self.assertIsNotNone(self.edge("skill:one", "skill:two"))

    # False positives excluded by the token rule

    def test_hyphenated_longer_token_is_not_a_reference(self):
        # beta's body says "gamma-plus" and "gamma_old", neither of which names gamma.
        self.assertIsNone(self.edge("skill:beta", "skill:gamma"))

    def test_capitalized_word_is_not_a_reference(self):
        # beta's body starts a sentence with "Alpha"; names match case-sensitively.
        self.assertIsNone(self.edge("skill:beta", "skill:alpha"))

    def test_token_pattern_boundaries(self):
        pat = bg.token_pattern("ponytail")
        self.assertTrue(pat.search("run `/ponytail` now"))
        self.assertTrue(pat.search("the ponytail: marker"))
        self.assertFalse(pat.search("see ponytail-review"))
        self.assertFalse(pat.search("see my-ponytail"))
        self.assertFalse(pat.search("ponytail_old"))

    def test_frontmatter_mentions_do_not_create_edges(self):
        # helper's description names alpha; its body also does, on a body line.
        edge = self.edge("agent:helper", "skill:alpha", "agent-skill")
        self.assertIsNotNone(edge)
        fields, body_start = bg.parse_frontmatter(
            (FIXTURE / "agents" / "helper.md").read_text(encoding="utf-8")
        )
        self.assertTrue(all(line > body_start for line in edge["lines"]))

    def test_no_self_edges(self):
        self.assertFalse(any(e["source"] == e["target"] for e in self.graph["edges"]))

    # Hook and agent edges

    def test_skill_names_hook_file(self):
        edge = self.edge("skill:alpha", "hook:guard", "skill-hook")
        self.assertIsNotNone(edge)

    def test_skill_names_agent(self):
        edge = self.edge("skill:gamma", "agent:helper", "skill-agent")
        self.assertIsNotNone(edge)
        self.assertEqual(edge["file"], "gamma/SKILL.fixture.md")

    def test_agent_names_agent(self):
        edge = self.edge("agent:reviewer", "agent:helper", "agent-agent")
        self.assertIsNotNone(edge)
        self.assertEqual(edge["file"], "agents/reviewer.md")

    def test_edge_kind_is_source_kind_and_target_kind(self):
        kinds = {n["id"]: n["kind"] for n in self.graph["nodes"]}
        for e in self.graph["edges"]:
            self.assertEqual(e["kind"], f"{kinds[e['source']]}-{kinds[e['target']]}", e["id"])

    def test_unregistered_script_is_not_a_hook(self):
        self.assertIn("hook:guard", self.nodes)
        self.assertNotIn("hook:_input", self.nodes)
        self.assertEqual(
            self.nodes["hook:guard"]["coverage"],
            [
                {"event": "PreToolUse", "file": "hooks/settings.example.json", "matcher": "Bash", "line": 7},
                {"event": "PostToolUse", "file": "hooks/settings.example.json", "matcher": "Edit", "line": 15},
            ],
        )

    def test_each_hook_registration_cites_its_own_line(self):
        text = (FIXTURE / "hooks" / "settings.example.json").read_text(encoding="utf-8").split("\n")
        lines = [c["line"] for c in self.nodes["hook:guard"]["coverage"]]
        self.assertEqual(len(set(lines)), len(lines))
        for line in lines:
            self.assertIn("hooks/guard.js", text[line - 1])

    # Eval status present and absent

    def test_eval_status_present(self):
        alpha = self.nodes["skill:alpha"]
        self.assertEqual(alpha["eval_status"], "measured: 8/8")
        line = (FIXTURE / alpha["path"]).read_text(encoding="utf-8").split("\n")[alpha["eval_line"] - 1]
        self.assertIn("pass rate 8/8", line)

    def test_eval_status_absent(self):
        beta = self.nodes["skill:beta"]
        self.assertEqual(beta["eval_status"], "unmeasured")
        self.assertNotIn("eval_line", beta)

    def test_eval_ignores_fenced_templates_and_scoring_instructions(self):
        # gamma has "pass rate 5/5" inside a code fence and "scored 1 to 10" in prose.
        self.assertEqual(self.nodes["skill:gamma"]["eval_status"], "unmeasured")

    # Origin and license

    def test_origin_from_body_line(self):
        origin = self.nodes["skill:gamma"]["origin"]
        self.assertEqual(origin["from"], "body")
        self.assertEqual(origin["license"], "MIT")
        self.assertTrue(origin["text"].startswith("Adapted from"))

    def test_origin_from_frontmatter_license(self):
        self.assertEqual(
            self.nodes["skill:one"]["origin"], {"from": "frontmatter", "license": "Apache 2.0"}
        )

    def test_origin_omitted_when_not_stated(self):
        self.assertNotIn("origin", self.nodes["skill:beta"])

    def test_hook_origin_from_comment(self):
        origin = self.nodes["hook:guard"]["origin"]
        self.assertEqual(origin["license"], "MIT")
        self.assertTrue(origin["text"].startswith("Adapted from"))

    def test_license_notice(self):
        self.assertEqual(self.nodes["skill:alpha"]["license_notice"]["license"], "MIT")
        self.assertIn("license_notice", self.nodes["agent:helper"])
        self.assertIn("license_notice", self.nodes["hook:guard"])
        self.assertNotIn("license_notice", self.nodes["skill:beta"])

    # Families

    def test_families_come_from_families_json_in_file_order(self):
        self.assertEqual([f["id"] for f in self.graph["families"]], ["core", "extra", "agents", "hooks"])
        fam = {f["id"]: f for f in self.graph["families"]}
        self.assertEqual(fam["core"], {"id": "core", "label": "Core", "vendored": False, "rule": "families.json", "file": "families.json", "line": 3})
        self.assertTrue(fam["extra"]["vendored"])
        self.assertEqual(self.nodes["skill:alpha"]["family"], "core")
        self.assertEqual(self.nodes["skill:one"]["family"], "extra")
        self.assertEqual(self.nodes["agent:helper"]["family"], "agents")
        self.assertEqual(self.nodes["hook:guard"]["family"], "hooks")

    def test_vendored_flag_comes_from_the_family(self):
        for node_id in ("skill:delta", "skill:one", "skill:two"):
            self.assertIs(self.nodes[node_id]["vendored"], True, node_id)
        for node_id in ("skill:alpha", "agent:helper", "hook:guard"):
            self.assertIs(self.nodes[node_id]["vendored"], False, node_id)

    # Validation and failure paths

    def test_counts(self):
        kinds = [n["kind"] for n in self.graph["nodes"]]
        self.assertEqual(kinds.count("skill"), 6)
        self.assertEqual(kinds.count("agent"), 2)
        self.assertEqual(kinds.count("hook"), 1)

    def test_validate_rejects_missing_endpoint(self):
        broken = json.loads(json.dumps(self.graph))
        broken["edges"].append({"id": "x", "source": "skill:alpha", "target": "skill:nope"})
        with self.assertRaises(bg.GraphError):
            bg.validate(broken)

    def test_validate_rejects_unknown_family(self):
        broken = json.loads(json.dumps(self.graph))
        broken["nodes"][0]["family"] = "readme:nope"
        with self.assertRaises(bg.GraphError):
            bg.validate(broken)

    def test_validate_rejects_node_count_mismatch(self):
        with self.assertRaises(bg.GraphError):
            bg.validate(self.graph, expected_nodes=len(self.graph["nodes"]) + 1)

    def test_main_exits_nonzero_and_writes_nothing_on_error(self):
        out = BROKEN / "should-not-exist.json"
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            code = bg.main(["--root", str(BROKEN), "--out", str(out)])
        self.assertEqual(code, 1)
        self.assertIn("settings.example.json not found", err.getvalue())
        self.assertFalse(out.exists())


class FailsLoudly(unittest.TestCase):
    """Inputs that used to give a wrong graph with exit 0 (review gate 1)."""

    def mutated(self, rel_path, transform):
        tmp = tempfile.TemporaryDirectory(dir=HERE)
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name) / "repo"
        shutil.copytree(FIXTURE, root)
        target = root / rel_path
        target.write_text(transform(target.read_text(encoding="utf-8")), encoding="utf-8")
        return root

    def assertBuildFails(self, root, fragment):
        with self.assertRaises(bg.GraphError) as ctx, contextlib.redirect_stderr(io.StringIO()):
            build(root)
        self.assertIn(fragment, str(ctx.exception))

    def test_node_not_listed_in_families_json(self):
        root = self.mutated("families.json", lambda t: t.replace('"delta", ', ''))
        self.assertBuildFails(root, "nodes not listed in any family")

    def test_families_json_names_a_node_that_does_not_exist(self):
        root = self.mutated("families.json", lambda t: t.replace('"guard"', '"guard", "renamed-hook"'))
        self.assertBuildFails(root, "lists names that are not nodes")

    def test_node_listed_in_two_families(self):
        root = self.mutated("families.json", lambda t: t.replace('["guard"]', '["guard", "alpha"]'))
        self.assertBuildFails(root, "listed in both")

    def test_malformed_families_json(self):
        cases = [
            ("{}", "non-empty"),
            ('{"families": []}', "non-empty"),
            ('{"families": ["core"]}', "must be an object"),
            ('{"families": [{"id": "Core", "label": "x", "members": ["alpha"]}]}', "lowercase"),
            ('{"families": [{"id": "core", "members": ["alpha"]}]}', "needs a label"),
            ('{"families": [{"id": "core", "label": "Core", "members": []}]}', "non-empty list of member"),
            ('{"families": [{"id": "a", "label": "A", "members": ["alpha"]}, {"id": "a", "label": "B", "members": ["beta"]}]}', "duplicate family id"),
            ("not json", "not valid JSON"),
            ('{"families": [{"id": "core", "label": "Core", "vendored": "yes", "members": ["alpha"]}]}', "vendored must be true or false"),
        ]
        for text, fragment in cases:
            with self.subTest(families=text):
                root = self.mutated("families.json", lambda t, text=text: text)
                self.assertBuildFails(root, fragment)

    def test_missing_families_json(self):
        root = self.mutated("families.json", lambda t: t)
        (root / "families.json").unlink()
        self.assertBuildFails(root, "families.json not found")

    def test_skill_without_frontmatter(self):
        root = self.mutated("beta/SKILL.fixture.md", lambda t: t.split("---\n", 2)[2])
        self.assertBuildFails(root, "no frontmatter")

    def test_skill_without_name(self):
        root = self.mutated("beta/SKILL.fixture.md", lambda t: t.replace("name: beta\n", "title: beta\n"))
        self.assertBuildFails(root, "frontmatter has no name")

    def test_bom_does_not_hide_frontmatter(self):
        root = self.mutated("beta/SKILL.fixture.md", lambda t: "\ufeff" + t)
        graph = build(root)
        beta = next(n for n in graph["nodes"] if n["path"] == "beta/SKILL.fixture.md")
        self.assertEqual(beta.get("name"), "beta")
        self.assertIsNotNone(next((e for e in graph["edges"] if e["source"] == "skill:alpha" and e["target"] == "skill:beta"), None))

    def test_settings_without_hooks_object(self):
        for bad in ('{"nothooks": 1}', '{"hooks": []}', '{"hooks": {}}', '{"hooks": {"PreToolUse": {"a": 1}}}'):
            with self.subTest(settings=bad):
                root = self.mutated("hooks/settings.example.json", lambda t, bad=bad: bad)
                with self.assertRaises(bg.GraphError):
                    build(root)

    def test_command_that_names_no_hook_script(self):
        root = self.mutated(
            "hooks/settings.example.json",
            lambda t: t.replace('"node \\"$HOME/dev/fixture/hooks/guard.js\\""', '"echo hello"'),
        )
        self.assertBuildFails(root, "names no script under hooks/")

    def test_name_shared_by_a_skill_and_an_agent_is_ambiguous(self):
        root = self.mutated("agents/reviewer.md", lambda t: t.replace("name: reviewer", "name: alpha"))
        self.assertBuildFails(root, "ambiguous")

    def test_registered_script_that_does_not_exist(self):
        root = self.mutated("hooks/settings.example.json", lambda t: t.replace("hooks/guard.js", "hooks/extra.sh"))
        self.assertBuildFails(root, "not found: hooks/extra.sh")

    def test_node_count_check_is_independent(self):
        # A hooks/ reference outside the "hooks" object is counted from the raw
        # text but not by the JSON walk, so the counts disagree and the build fails.
        root = self.mutated(
            "hooks/settings.example.json",
            lambda t: t.replace('{\n  "hooks"', '{\n  "disabled": "node hooks/old.js",\n  "hooks"', 1),
        )
        self.assertBuildFails(root, "node count")


class DiscoveryMatchesFind(unittest.TestCase):
    """Discovery must agree with the acceptance commands (review gate 1, H1)."""

    def tree(self):
        tmp = tempfile.TemporaryDirectory(dir=HERE)
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name) / "repo"
        shutil.copytree(FIXTURE, root)
        return root

    def test_lowercase_skill_file_is_not_a_skill(self):
        root = self.tree()
        (root / "lower").mkdir()
        (root / "lower" / FIXTURE_NAME.lower()).write_text("---\nname: lower\n---\n", encoding="utf-8")
        graph = build(root)
        self.assertNotIn("skill:lower", {n["id"] for n in graph["nodes"]})

    def test_skill_files_inside_node_modules_are_not_skills(self):
        root = self.tree()
        dep = root / "viz" / "node_modules" / "somedep" / "skills" / "bundled"
        dep.mkdir(parents=True)
        (dep / FIXTURE_NAME).write_text("---\nname: bundled\n---\n", encoding="utf-8")
        graph = build(root)
        self.assertNotIn("skill:bundled", {n["id"] for n in graph["nodes"]})

    def test_nested_agent_file_is_an_agent(self):
        root = self.tree()
        (root / "agents" / "extra").mkdir()
        (root / "agents" / "extra" / "nested.md").write_text(
            "---\nname: nested\ndescription: nested agent\n---\nbody\n", encoding="utf-8"
        )
        families = root / "families.json"
        families.write_text(families.read_text(encoding="utf-8").replace('"reviewer"', '"reviewer", "nested"'), encoding="utf-8")
        graph = build(root)
        self.assertIn("agent:nested", {n["id"] for n in graph["nodes"]})

    def test_non_js_hook_is_registered(self):
        root = self.tree()
        (root / "hooks" / "lint-guard.sh").write_text("#!/bin/sh\nexit 0\n", encoding="utf-8")
        settings = root / "hooks" / "settings.example.json"
        settings.write_text(
            settings.read_text(encoding="utf-8").replace(
                '{ "type": "command", "command": "node \\"$HOME/dev/fixture/hooks/guard.js\\"" }',
                '{ "type": "command", "command": "node \\"$HOME/dev/fixture/hooks/guard.js\\"" },\n'
                '          { "type": "command", "command": "bash \\"$HOME/dev/fixture/hooks/lint-guard.sh\\"" }',
            ),
            encoding="utf-8",
        )
        families = root / "families.json"
        families.write_text(families.read_text(encoding="utf-8").replace('["guard"]', '["guard", "lint-guard"]'), encoding="utf-8")
        graph = build(root)
        self.assertIn("hook:lint-guard", {n["id"] for n in graph["nodes"]})

    def test_unregistered_script_is_reported(self):
        root = self.tree()
        (root / "hooks" / "forgotten.js").write_text("process.exit(0);\n", encoding="utf-8")
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            graph = build(root)
        self.assertIn("not registered", err.getvalue())
        self.assertIn("forgotten.js", err.getvalue())
        self.assertNotIn("_input.js", err.getvalue())
        self.assertNotIn("hook:forgotten", {n["id"] for n in graph["nodes"]})


class RealRepo(unittest.TestCase):
    def test_committed_graph_is_current(self):
        committed = json.loads((REPO / "viz" / "data" / "graph.json").read_text(encoding="utf-8"))
        self.assertEqual(committed, bg.build_graph(REPO))


if __name__ == "__main__":
    unittest.main()
