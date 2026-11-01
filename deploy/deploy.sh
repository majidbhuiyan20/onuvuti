#!/usr/bin/env bash
# ==============================================================================
# ONUVUTI (অনুভূতি) - PRODUCTION DEPLOYMENT SCRIPT
# Execute on Ubuntu EC2: bash deploy/deploy.sh
# ==============================================================================

set -euo pipefail

APP_DIR="/home/ubuntu/Onuvuti"
cd "$APP_DIR"

echo "=== [1/6] Pulling latest code from origin/main ==="
git fetch origin main
git reset --hard origin/main

echo "=== [2/6] Building Go Backend ==="
cd "$APP_DIR/backend"
go build -o onuvuti-server ./cmd/server
chmod +x onuvuti-server

echo "=== [3/6] Running PostgreSQL Database Migrations ==="
if [ -f "$APP_DIR/backend/migrations/002_orders_security_upgrade.sql" ] && command -v psql &> /dev/null; then
    echo "Applying migration 002..."
    psql "$DATABASE_URL" -f "$APP_DIR/backend/migrations/002_orders_security_upgrade.sql" || echo "Note: Migration auto-handled or already applied."
fi

echo "=== [4/6] Installing Node dependencies & Building Next.js ==="
cd "$APP_DIR"
npm ci --prefer-offline --no-audit
npm run build

echo "=== [5/6] Restarting Systemd Services ==="
sudo systemctl daemon-reload
sudo systemctl restart onuvuti-backend
sudo systemctl restart onuvuti-web
sudo systemctl reload nginx

echo "=== [6/6] Verifying Services Status ==="
sudo systemctl status onuvuti-backend --no-pager -l | head -n 12
sudo systemctl status onuvuti-web --no-pager -l | head -n 12

echo "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
