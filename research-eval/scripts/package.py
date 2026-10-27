#!/usr/bin/env python3
"""Build portable archives from an explicit allowlist; never collect drafts."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SKILLS = {
    "review-paper": (
        "SKILL.md",
        "references/rubric.md",
        "references/report-format.md",
    ),
    "review-proposal": (
        "SKILL.md",
        "references/literature-search.md",
        "references/assessment.md",
        "references/report-format.md",
    ),
}


def write_archive(destination, entries):
    # Read and validate all inputs before replacing an existing release archive.
    payloads = [(name, source.read_bytes()) for name, source in entries]
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as archive:
        for name, content in payloads:
            info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, content)
    print(destination.relative_to(ROOT))


def main():
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    plugin_files = [".claude-plugin/plugin.json", "README.md"]
    for skill_name, filenames in SKILLS.items():
        skill = ROOT / "skills" / skill_name
        write_archive(
            output / f"{skill_name}.zip",
            [(f"{skill_name}/{name}", skill / name) for name in filenames],
        )
        plugin_files.extend(f"skills/{skill_name}/{name}" for name in filenames)
    write_archive(
        output / "research-eval-plugin.zip",
        [(f"research-eval/{name}", ROOT / name) for name in plugin_files],
    )


if __name__ == "__main__":
    main()
