# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file, no-build interactive data visualization — a **Radial Network Diagram** for SK Shieldus Physical Security (BCG engagement). 39 strategic initiatives rendered as nodes on concentric rings, connected by 50 cross-initiative dependency links. The entire app is `index.html`; all data and logic live inline.

## Commands

```bash
bash build.sh        # re-syncs skill/assets/radial_template.html and both CSVs from index.html
vercel --prod        # deploy to Vercel (static)
```

No install, no lint, no test commands — this is a zero-dependency static HTML file.

**Visual check** (optional, requires `pip install playwright && playwright install chromium`):
```python
from playwright.sync_api import sync_playwright; import pathlib
url = "file://" + str(pathlib.Path("index.html").resolve())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1400,"height":1000})
    pg.goto(url); pg.wait_for_timeout(1500); pg.screenshot(path="check.png"); b.close()
```

## Architecture

`index.html` is the **single source of truth** — do not edit `skill/assets/radial_template.html` or the CSVs directly; run `build.sh` to regenerate them from `index.html`.

### Data model (top of the `<script>` block in `index.html`)

| Array/Object | Shape | Purpose |
|---|---|---|
| `NODES` | `["code", "label"][]` | 39 initiatives; leading char of code = category |
| `HZ` | `{ code: "short" \| "mid" \| "long" }` | Time horizon → ring radius + fill color |
| `DEPS` | `["source", "target"][]` | 50 directed dependency pairs |

### Layout constants

| Constant | Value | Notes |
|---|---|---|
| `HZR` | `{short: 260, mid: 440, long: 620}` | Ring radii in px |
| `NODE_R` | 24 | Node circle radius |
| `GAP` | 14 | Label offset from node edge |
| Colors | short `#22A3DF` / mid `#C3CDD4` / long `#5B6B76` | Sky blue / light grey / dark grey |

### Category prefixes (1–6)

1 = Value creation model, 2 = Customer management, 3 = Sales & channel, 4 = Technology & platform, 5 = Data & intelligence, 6 = Organization & people

## Invariants — do not change without explicit instruction

- **`6e–6i` org initiative dependency links were deliberately removed** — do not re-add them.
- **`5a` (CLTV)** connects to all CLTV-related initiatives.
- **`5f` (data governance)** connects to CLTV + pricing initiatives.
- Long-term nodes are exactly: `4f, 4g, 5f, 5e`.

## Skill

`skill/SKILL.md` defines an installable Claude Code skill with all design rules and default constants. After any data or layout change in `index.html`, run `build.sh` to keep the skill template in sync.
