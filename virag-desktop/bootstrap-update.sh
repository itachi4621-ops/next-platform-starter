#!/bin/bash
set -euo pipefail
TARGET="$HOME/Documents/virag-ai"
MANIFEST="https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/virag-desktop/manifest.json"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

printf '\n=== VIRAG UPDATE REPAIR ===\n'
if [ ! -f "$TARGET/package.json" ]; then
  echo "Virag was not found at $TARGET"
  exit 1
fi

PIDS="$(pgrep -f "$TARGET/node_modules/electron" 2>/dev/null || true)"
if [ -n "$PIDS" ]; then
  kill $PIDS 2>/dev/null || true
  sleep 1
fi

BACKUP="$HOME/Documents/virag-ai-code-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp "$TARGET/package.json" "$BACKUP/package.json" 2>/dev/null || true
cp -R "$TARGET/src" "$BACKUP/src" 2>/dev/null || true

/usr/bin/python3 - "$TARGET" "$MANIFEST" <<'PY'
import json, pathlib, sys, urllib.request
root, manifest_url = sys.argv[1:3]
def get(url):
    req = urllib.request.Request(url, headers={'Cache-Control':'no-cache','User-Agent':'Virag-Updater'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()
m = json.loads(get(manifest_url + '?t=repair').decode())
base = m['baseUrl'].rstrip('/') + '/'
for ent in m.get('files', []):
    rel = ent['path'] if isinstance(ent, dict) else ent
    rel = rel.replace('\\','/').lstrip('/')
    if not rel or '..' in rel.split('/'):
        raise RuntimeError('Unsafe update path: ' + rel)
    dest = pathlib.Path(root, *rel.split('/'))
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(get(base + rel + '?t=repair'))
print('Updated Virag to', m['version'])
PY

cd "$TARGET"
if command -v npm >/dev/null 2>&1; then
  npm install >/tmp/virag-update-install.log 2>&1 || true
fi

if [ -x "$TARGET/node_modules/.bin/electron" ]; then
  nohup "$TARGET/node_modules/.bin/electron" "$TARGET" >/tmp/virag-start.log 2>&1 &
elif command -v npm >/dev/null 2>&1; then
  nohup npm start >/tmp/virag-start.log 2>&1 &
else
  echo "Update installed, but Virag could not restart automatically."
  exit 2
fi

echo "✓ Virag repaired, updated, and restarted."
