#!/usr/bin/env bash
# Single-source build. The ONLY source of truth is index.html (root).
# The whole folder IS the deployable site (GitHub Pages / Vercel). This script only
# re-syncs the skill template and the reference CSVs from the master. Run after editing index.html.
set -euo pipefail
cd "$(dirname "$0")"

MASTER="index.html"
[ -f "$MASTER" ] || { echo "master $MASTER not found"; exit 1; }

# skill template = master
mkdir -p skill/assets
cp "$MASTER" skill/assets/radial_template.html

# regenerate reference CSVs from the master's NODES/HZ/DEPS arrays
python3 - "$MASTER" <<'PY'
import re, sys
h=open(sys.argv[1]).read()
nodes=re.findall(r'\["([0-9][a-z])","([^"]+)"\]',re.search(r'let NODES = \[(.*?)\]\.map',h,re.S).group(1))
hz=dict(re.findall(r'"([0-9][a-z])":"(short|mid|long)"',re.search(r'const HZ=\{(.*?)\};',h,re.S).group(1)))
deps=re.findall(r'\["([0-9][a-z])","([0-9][a-z])"\]',re.search(r'let DEPS = \[(.*?)\];',h,re.S).group(1))
open("initiatives_nodes.csv","w").write("code,initiative,horizon\n"+"".join(f'{c},"{l}",{hz.get(c,"short")}\n' for c,l in nodes))
open("initiatives_deps.csv","w").write("source,target\n"+"".join(f'{s},{t}\n' for s,t in deps))
from collections import Counter
print(f"synced: {len(nodes)} nodes, {len(deps)} deps, horizons {dict(Counter(hz.values()))}")
PY

echo "build complete."
