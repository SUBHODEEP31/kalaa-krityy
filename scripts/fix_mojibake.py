#!/usr/bin/env python3
"""Recursively fix common UTF-8 mojibake sequences in source files."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCAN_DIRS = ["src", "data", "public", "scripts"]
EXTS = {".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".mjs", ".cjs"}

# Order matters: longer / more-specific replacements first.
REPLACEMENTS: list[tuple[str, str]] = [
    # Triple / double-encoded fragments
    ("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢", "'"),
    ("ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ", '"'),
    ("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â", '"'),
    ("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â", "—"),
    ("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“", '"'),
    ("ÃƒÂ¢Ã¢â€šÂ¬", ""),
    ("ÃƒÂ", ""),
    # Common cp1252-as-utf8 sequences
    ("Ã¢â‚¬Å“", '"'),
    ("Ã¢â‚¬Â", '"'),
    ("Ã¢â‚¬Ëœ", "'"),
    ("Ã¢â‚¬â„¢", "'"),
    ("Ã¢â‚¬â€", "—"),
    ("Ã¢â‚¬â€œ", "–"),
    ("Ã¢â‚¬â€", "—"),
    ("Ã¢â€šÂ¹", "₹"),
    ("Ã¢â€ â€™", "→"),
    ("Ã¢â€žÂ¢", "™"),
    ("Ã‚Â·", "·"),
    ("Ã‚Â", ""),
    ("Ã©", "é"),
    ("Ã¨", "è"),
    ("Ã ", "à"),
    ("Ã¡", "á"),
    ("Ã­", "í"),
    ("Ã³", "ó"),
    ("Ãº", "ú"),
    ("Ã±", "ñ"),
    ("Ã§", "ç"),
    ("Ã¼", "ü"),
    ("Ã¶", "ö"),
    ("Ã¤", "ä"),
    ("Ã©cor", "décor"),  # partial safety if leftover
    # Direct mojibake glyphs often seen in this repo
    ("â€œ", '"'),
    ("â€", '"'),
    ("â€˜", "'"),
    ("â€™", "'"),
    ("â€”", "—"),
    ("â€“", "–"),
    ("â€¦", "…"),
    ("â‚¹", "₹"),
    ("Â·", "·"),
    ("Â ", " "),
    ("Â", ""),
    ("â†’", "→"),
    ("â†", "←"),
    ("â™¥", "♥"),
    ("âœ“", "✓"),
    ("âœ”", "✔"),
    ("âœ•", "✕"),
    ("âœ˜", "✘"),
    ("â€¢", "•"),
    ("â€", ""),  # leftover after partial replacements
]


def fix_text(text: str) -> str:
    out = text
    # Strip UTF-8 BOM
    if out.startswith("\ufeff"):
        out = out.lstrip("\ufeff")
    for bad, good in REPLACEMENTS:
        if bad in out:
            out = out.replace(bad, good)
    # Fix common leftover "dcor" from dÃ©cor mishaps
    out = out.replace("Artisanal dcor", "Artisanal décor")
    out = out.replace("Artisanal dÃcor", "Artisanal décor")
    out = out.replace("dcor &", "décor &")
    return out


def main() -> int:
    changed: list[str] = []
    scanned = 0
    for dirname in SCAN_DIRS:
        base = ROOT / dirname
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in EXTS:
                continue
            if "node_modules" in path.parts:
                continue
            scanned += 1
            try:
                raw = path.read_bytes()
            except OSError as e:
                print(f"skip read {path}: {e}", file=sys.stderr)
                continue
            # Prefer utf-8; fall back to latin-1 for salvage
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                text = raw.decode("latin-1")
            fixed = fix_text(text)
            if fixed != text or not raw.startswith(fixed.encode("utf-8")[: min(40, len(raw))]):
                new_bytes = fixed.encode("utf-8")
                if new_bytes != raw:
                    path.write_bytes(new_bytes)
                    changed.append(str(path.relative_to(ROOT)))
            elif fixed != text:
                path.write_text(fixed, encoding="utf-8", newline="\n")
                changed.append(str(path.relative_to(ROOT)))

    print(f"Scanned {scanned} files")
    print(f"Updated {len(changed)} files")
    for c in changed:
        print(f"  - {c}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
