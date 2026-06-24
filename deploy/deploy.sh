#!/usr/bin/env bash
# ===========================================
# Resume Analyzer — Deploy/Update Script
# ===========================================
# Run after initial setup to pull new code and restart.
# Safe to run repeatedly (idempotent).

set -euo pipefail

APP_DIR="/opt/resume-analyzer"
DEPLOY_USER="deploy"

echo "=========================================="
echo " Resume Analyzer — Deploying Update"
echo "=========================================="

# --- Pull latest code ---
echo "[1/4] Pulling latest code..."
cd "$APP_DIR"
sudo -u "$DEPLOY_USER" git pull --ff-only

# --- Check if requirements changed ---
echo "[2/4] Checking Python dependencies..."
REQ_HASH=$(sudo -u "$DEPLOY_USER" md5sum "$APP_DIR/backend/requirements.txt" | cut -d' ' -f1)
CACHED_HASH=""
if [[ -f "$APP_DIR/.deploy_req_hash" ]]; then
    CACHED_HASH=$(cat "$APP_DIR/.deploy_req_hash")
fi

if [[ "$REQ_HASH" != "$CACHED_HASH" ]]; then
    echo "  requirements.txt changed — reinstalling..."
    sudo -u "$DEPLOY_USER" "$APP_DIR/backend/venv/bin/pip" install -q -r "$APP_DIR/backend/requirements.txt"
    echo "$REQ_HASH" > "$APP_DIR/.deploy_req_hash"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.deploy_req_hash"
else
    echo "  No changes to requirements.txt"
fi

# --- Rebuild frontend ---
echo "[3/4] Building frontend..."
cd "$APP_DIR/frontend"
sudo -u "$DEPLOY_USER" npm ci --silent 2>/dev/null
sudo -u "$DEPLOY_USER" npm run build
echo "  Frontend built"

# --- Restart backend ---
echo "[4/4] Restarting backend service..."
systemctl restart resume-analyzer
sleep 2

if systemctl is-active --quiet resume-analyzer; then
    echo ""
    echo "=========================================="
    echo " Deploy Complete!"
    echo "=========================================="
    echo ""
    echo "Service status: $(systemctl is-active resume-analyzer)"
    echo "Logs: sudo journalctl -u resume-analyzer -f"
else
    echo ""
    echo "ERROR: Service failed to start!"
    echo "Check logs: sudo journalctl -u resume-analyzer -n 50"
    exit 1
fi
