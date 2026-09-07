#!/usr/bin/env python3
"""Check that internal links and asset references in HTML files resolve.

Scans every .html file in the repository, extracts href/src attributes,
and verifies that relative references point at files that exist. External
URLs (http/https), mailto:, tel:, data:, and pure fragments are skipped.

Exits nonzero and prints one line per broken reference, so it works both
locally (python3 scripts/check_links.py) and in CI.
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", ".github", ".claude", "node_modules", "scripts"}
SKIP_SCHEMES = ("http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:")


class RefCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []  # (line, attr, value)

    def handle_starttag(self, tag, attrs):
        for attr, value in attrs:
            if attr in ("href", "src") and value:
                self.refs.append((self.getpos()[0], attr, value))


def iter_html_files():
    for path in sorted(REPO_ROOT.rglob("*.html")):
        if not any(part in SKIP_DIRS for part in path.relative_to(REPO_ROOT).parts):
            yield path


def check_ref(html_file: Path, ref: str) -> bool:
    """Return True if the reference resolves to an existing file."""
    ref = ref.split("#", 1)[0].split("?", 1)[0]
    if not ref:  # pure fragment or query
        return True
    if ref.startswith("/"):
        target = REPO_ROOT / ref.lstrip("/")
    else:
        target = html_file.parent / ref
    try:
        target = target.resolve()
        target.relative_to(REPO_ROOT)
    except (OSError, ValueError):
        return False
    if target.is_dir():
        target = target / "index.html"
    return target.is_file()


def main() -> int:
    broken = []
    for html_file in iter_html_files():
        collector = RefCollector()
        try:
            collector.feed(html_file.read_text(encoding="utf-8"))
        except UnicodeDecodeError:
            broken.append((html_file, 0, "file", "not valid UTF-8"))
            continue
        for line, attr, value in collector.refs:
            if value.startswith(SKIP_SCHEMES) or value.startswith("#"):
                continue
            if not check_ref(html_file, value):
                broken.append((html_file, line, attr, value))

    for html_file, line, attr, value in broken:
        rel = html_file.relative_to(REPO_ROOT)
        print(f"{rel}:{line}: broken {attr}: {value}")

    if broken:
        print(f"\n{len(broken)} broken reference(s) found.")
        return 1
    print("All internal links and assets resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
