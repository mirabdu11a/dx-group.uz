#!/usr/bin/env bash
# DX-GROUP frontend deploy script.
#
# Lives on the server at /usr/local/bin/dx-front-deploy and is invoked by
# GitHub Actions through a forced SSH command — see
# .github/workflows/deploy.yml and the
# `command="/usr/local/bin/dx-front-deploy"` entry in root's
# authorized_keys. Because it is pinned as a forced command, the CI job
# cannot run anything else on the server no matter what it sends.
#
# It reads a gzipped tar of the built site on stdin. The build happens in
# CI, not here: the server's Node is 22.8 and Vite 7 needs >=22.12, and a
# production box has no business carrying a build toolchain anyway.
#
# This copy is the version-controlled source of truth. It is NOT synced
# automatically — a running bash script that rewrites itself behaves
# unpredictably. After changing it, install it manually:
#
#   scp deploy/dx-front-deploy.sh root@<host>:/usr/local/bin/dx-front-deploy
#   ssh root@<host> chmod 755 /usr/local/bin/dx-front-deploy
set -euo pipefail

ROOT=/var/www/dx-group-front
KEEP=5

log() { printf "\n[deploy] %s\n" "$*"; }

stamp=$(date +%Y%m%d-%H%M%S)
target="$ROOT/releases/$stamp"

log "yangi reliz: $stamp"
mkdir -p "$target"

# Unpack whatever CI piped in. A truncated or empty upload fails here,
# before anything touches the live symlink.
tar -xzf - -C "$target"

log "tekshiruv"
if [ ! -f "$target/index.html" ]; then
  echo "XATO: index.html yo'q — yuklangan arxiv buzuq. Reliz bekor qilindi."
  rm -rf "$target"
  exit 1
fi
assets=$(find "$target/assets" -name '*.js' 2>/dev/null | wc -l)
if [ "$assets" -eq 0 ]; then
  echo "XATO: assets/ ichida bitta ham js yo'q. Reliz bekor qilindi."
  rm -rf "$target"
  exit 1
fi
echo "  index.html + $assets ta js fayl"

log "egalik"
chown -R www-data:www-data "$target"

# Symlink swap is the actual deploy. ln -sfn over a temporary name and
# mv is atomic, so a visitor mid-request never sees a half-swapped tree.
log "faollashtirish"
ln -sfn "$target" "$ROOT/current.new"
mv -T "$ROOT/current.new" "$ROOT/current"
echo "  current -> $stamp"

log "eski relizlarni tozalash (oxirgi $KEEP saqlanadi)"
cd "$ROOT/releases"
ls -1dt */ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -rf "$old"
  echo "  o'chirildi: ${old%/}"
done

log "sog'liq tekshiruvi"
code=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: dx-group.uz" http://127.0.0.1/)
echo "  / -> $code"
[ "$code" = "200" ] || { echo "XATO: sayt javob bermayapti"; exit 1; }

log "tayyor: $stamp"
