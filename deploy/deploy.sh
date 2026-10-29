#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run with sudo: sudo $0" >&2
  exit 1
fi

SITE_DIR="$(cd -- "$(dirname -- "$0")/.." && pwd)"
WEBROOT="/var/www/talos-ai.org"
AVAILABLE="/etc/nginx/sites-available/talos-ai.org.conf"
ENABLED="/etc/nginx/sites-enabled/talos-ai.org.conf"

install -d -o root -g root -m 0755 "$WEBROOT" "$WEBROOT/fonts" "$WEBROOT/workflows" \
  "$WEBROOT/workflows/claude-x" "$WEBROOT/workflows/talos-sky" "$WEBROOT/workflows/easy-harbor" \
  "$WEBROOT/vendor/three/addons/utils" "$WEBROOT/vendor/three/addons/math"
for item in index.html workflows/index.html workflows/workflows.css workflows/workflows.js \
  workflows/claude-x/index.html workflows/talos-sky/index.html workflows/easy-harbor/index.html \
  vendor/three/three.module.min.js vendor/three/addons/utils/BufferGeometryUtils.js \
  vendor/three/addons/math/MeshSurfaceSampler.js vendor/three/LICENSE \
  favicon.ico favicon.svg apple-touch-icon.png icon-192.png icon-512.png og-image.png site.webmanifest; do
  install -o root -g root -m 0644 "$SITE_DIR/$item" "$WEBROOT/$item"
done
install -o root -g root -m 0644 "$SITE_DIR/fonts/archivo-variable.woff2" "$WEBROOT/fonts/archivo-variable.woff2"
install -o root -g root -m 0644 "$SITE_DIR/fonts/OFL.txt" "$WEBROOT/fonts/OFL.txt"

if [[ -e "$AVAILABLE" && ! -L "$AVAILABLE" ]]; then
  cp -a "$AVAILABLE" "$AVAILABLE.bak.$(date -u +%Y%m%dT%H%M%SZ)"
fi
install -o root -g root -m 0644 "$(dirname -- "$0")/gzip.conf" /etc/nginx/conf.d/talos-gzip.conf
install -o root -g root -m 0644 "$(dirname -- "$0")/talos-ai.org.nginx.conf" "$AVAILABLE"
ln -sfn "$AVAILABLE" "$ENABLED"

nginx -t
systemctl reload nginx

if ! command -v certbot >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
fi

certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect \
  -d talos-ai.org -d www.talos-ai.org

nginx -t
systemctl reload nginx
echo "Talos deployed at https://talos-ai.org"
