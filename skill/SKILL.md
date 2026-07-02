---
name: radial-network-diagram
description: "Builds a self-contained, interactive radial network diagram (D3, single HTML file) from coded initiatives plus optional dependency links, and outputs a matching data table. Use when a user wants a strategy 'house' / framework / initiative map / dependency chart as a radial (concentric-ring) interactive graphic — e.g. 'radial network diagram', 'flourish-style radial', 'make this deck a radial map', '과제들을 방사형 네트워크로', '이니셔티브 의존관계 다이어그램', '방사형으로 그려줘'. Each node has a code (e.g. 1a…6i) and a time horizon (short/mid/long); nodes sit on THREE concentric rings by horizon (short inner/small → long outer/large), colored by horizon (short=light blue, mid=light grey, long=dark grey), labels rotated to each node's radial angle. Dependency links connect initiatives only. Ships an always-visible data table, an editable panel, and Flourish-ready CSV export. Feeding NODES + horizons + DEPS reproduces the chart exactly. Read this whole file before generating."
---

# Radial Network Diagram (Interactive, Horizon Rings, + Data Table)

Produce ONE self-contained `.html` (D3 from cdnjs, no build, no browser storage) rendering
(a) an interactive radial network on concentric horizon rings and (b) a data table beneath it.
Reference: `assets/radial_template.html`. Start from it, replace `NODES`, `HZ`, `DEPS`, adjust
only requested constants, then screenshot-verify.

## Data model
1. **NODES** — `[code, label]`. Leading char of code = category, used ONLY for angular ordering.
2. **HZ** — `{code:"short"|"mid"|"long"}`. Horizon drives color AND ring. `NODES.forEach(n=>n.h=HZ[n.id])`.
3. **DEPS** — `[source,target]` directed, initiative-to-initiative only.

Reading horizon from a slide: colored/blue = short, light grey = mid, dark grey = long.

## Ring / layout
- Three rings, nearer=smaller: `HZR={short:260,mid:440,long:620}`; node radius = `HZR[n.h]`.
- Angle preserved over ALL nodes: order by category then code, `angle=-π/2+2π·(i/N)`. Changing a
  node's horizon changes only its radius, not its angle. Wide ring spacing prevents cross-ring collision.
- Faint guide circle per ring (`#eef3f6`). No center hub, no grey spokes, no drawn category anchors.
- Auto-fit: `viewBox=root.getBBox()+~24px` via `requestAnimationFrame`; re-`draw()` on resize.

## Color — by horizon (not category)
`short #22A3DF · mid #C3CDD4 (dark code text #1a2b38) · long #5B6B76`. Legend = Short/Mid/Long.

## Node
`NODE_R=24`, fill `HZCOL[n.h]`, white stroke. Code text centered `dy:.32em`, bold ~16px (dark on mid).

## Labels (do not regress)
Two lines (balanced by word count; 1 word→1 line), rotated to radial angle:
- `rotate(deg)`, deg=angle·180/π. Left half (`deg>90||deg<-90`): add `rotate(180)`, `text-anchor:end`; else `start`.
- **Always outward**: `rotate(deg) translate(OFF,0) [rotate(180) if flip]` — single **positive** translate for both halves (never `-OFF`).
- `OFF=NODE_R+GAP`, `GAP=14`. Block centered on radial line: `y0=-(lines-1)*lh/2`, `lh=20`, font 19px.

## Links
Quadratic bowing to center `M sx,sy Q (sx+tx)*.3,(sy+ty)*.3 tx,ty`. Width 2.6px / 4px hover,
`#7fb8dd` ~.55 opacity. Only if both endpoints exist. Toggle to hide.

## Tooltip
Hover/click dims non-adjacent, highlights links. **Single merged line** `Dependency: <codes>`
(incoming+outgoing, deduped) — no separate enables/depends lines. Font ~17px.

## Data table (always output)
1. Always-visible `#dataSection` below the diagram: Code (color badge) · Initiative · Horizon ·
   Dependency (merged). Re-renders each `draw()` via `renderDataTable()`. Hide/Show toggle.
2. Editable panel ("Edit data ▸"): contenteditable Code/Initiative/Horizon; edits redraw and re-ring.
   `source,target` textarea + Apply rebuilds DEPS. Edits are session-only.
3. Export CSV: `initiatives_nodes.csv (code,initiative,horizon)` + `initiatives_deps.csv (source,target)`.

## Interaction
`d3.zoom` scroll/drag ~[.4,4]. Click node = pin isolate; click empty = clear.

## Flourish
Feed exported nodes/links to Flourish **Network graph** (Points+Links). Radial-tree/Hierarchy
templates lose convergent (many-to-one) dependencies — use Network graph.

## Build procedure
1. Extract initiatives + codes; preserve scheme. 2. Set each horizon → HZ. 3. Extract/interpret
short+mid+long dependencies → DEPS. 4. Copy template, replace NODES/HZ/DEPS. 5. Screenshot-verify
(no text-node overlap, three rings separated, table renders). 6. Write to outputs, present, mention
table + CSV.

```python
from playwright.sync_api import sync_playwright; import pathlib
url="file://"+str(pathlib.Path("<output>.html").resolve())
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1400,"height":1000})
    pg.goto(url); pg.wait_for_timeout(1500); pg.screenshot(path="check.png"); b.close()
```
(Install once: `pip install playwright --break-system-packages && playwright install chromium`.)

## Defaults (change only on request)
| Constant | Value |
|---|---|
| HZR | short 260 / mid 440 / long 620 |
| NODE_R | 24 |
| code font | 16px (dark on mid) |
| label font / lh | 19 / 20 |
| GAP | 14 |
| link width | 2.6 / 4px |
| tooltip font | 17px, merged `Dependency:` |
| palette | short #22A3DF / mid #C3CDD4 / long #5B6B76 |
| hub / spokes | none |
| data table | always below + editable panel |
