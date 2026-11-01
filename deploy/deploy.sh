#!/usr/bin/env bash
# ==============================================================================
# ONUVUTI (অনুভূতি) - SAFE PRODUCTION UPDATE SCRIPT
# Execute on Ubuntu EC2: bash deploy/deploy.sh
# ==============================================================================

set -euo pipefail

APP_DIR="/home/ubuntu/Onuvuti"
BACKUP_DIR="/home/ubuntu/onuvuti-backup-$(date +%Y%m%d_%H%M%S)"

echo "=== [1/6] Safety Backup of orders.json & Environment files ==="
mkdir -p "$BACKUP_DIR"
if [ -f "$APP_DIR/storage/orders.json" ]; then
    cp "$APP_DIR/storage/orders.json" "$BACKUP_DIR/orders.json"
    echo "Backed up orders.json to $BACKUP_DIR/orders.json"
fi
if [ -f "$APP_DIR/.env.production" ]; then
    cp "$APP_DIR/.env.production" "$BACKUP_DIR/.env.production"
fi
if [ -f "$APP_DIR/backend/.env" ]; then
    cp "$APP_DIR/backend/.env" "$BACKUP_DIR/backend.env"
fi

echo "=== [2/6] Fetching latest production code from origin/main ==="
cd "$APP_DIR"
git fetch origin main
# Safe pull without destructive reset
git merge --ff-only origin/main || {
    echo "⚠️ Note: Local changes detected. Stashing non-destructive changes..."
    git stash push -m "pre-deploy-stash-$(date +%s)"
    git merge origin/main
}

echo "=== [3/6] Building Go Backend ==="
cd "$APP_DIR/backend"
go build -o onuvuti-server ./cmd/server
chmod +x onuvuti-server

echo "=== [4/6] Installing Node dependencies & Building Next.js ==="
cd "$APP_DIR"
npm install --prefer-offline --no-audit
npm run build

echo "=== [5/6] Safely Reloading Services ==="
sudo systemctl daemon-reload

# Restart onuvuti-backend if configured
if systemctl is-active --quiet onuvuti-backend; then
    sudo systemctl restart onuvuti-backend
elif [ -f /etc/systemd/system/onuvuti-backend.service ]; then
    sudo systemctl enable --now onuvuti-backend
fi

# Restart existing onuvuti-frontend service (preserving running configuration)
if systemctl is-active --quiet onuvuti-frontend; then
    sudo systemctl restart onuvuti-frontend
elif systemctl is-active --quiet onuvuti-web; then
    sudo systemctl restart onuvuti-web
fi

# Reload Nginx if test passes
if sudo nginx -t; then
    sudo systemctl reload nginx
fi

echo "=== [6/6] Verifying Services Status ==="
systemctl is-active onuvuti-frontend || systemctl is-active onuvuti-web || true
systemctl is-active onuvuti-backend || true

echo "=== DEPLOYMENT COMPLETED SAFELY ==="
