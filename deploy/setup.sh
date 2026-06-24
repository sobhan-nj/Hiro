#!/usr/bin/env bash
# ===========================================
# Resume Analyzer — One-time server setup
# ===========================================
# Run as root on a fresh Ubuntu 24.04 server:
#   curl -sL https://raw.githubusercontent.com/you/repo/main/deploy/setup.sh | bash
# Or copy to server and run:
#   chmod +x setup.sh && sudo ./setup.sh

set -euo pipefail

APP_DIR="/opt/resume-analyzer"
DEPLOY_USER="deploy"
DOMAIN="${1:-}"
REPO_URL="${2:-}"

echo "=========================================="
echo " Resume Analyzer — Server Setup"
echo "=========================================="

# --- Pre-flight checks ---
if [[ $EUID -ne 0 ]]; then
    echo "ERROR: Run as root (sudo ./setup.sh)"
    exit 1
fi

if [[ -z "$DOMAIN" ]]; then
    echo "Usage: sudo ./setup.sh <your-domain.com> [git-repo-url]"
    echo "Example: sudo ./setup.sh resume-analyzer.com https://github.com/you/resume-analyzer.git"
    exit 1
fi

echo ""
echo "Domain: $DOMAIN"
echo "App dir: $APP_DIR"
echo ""

# --- 1. System packages ---
echo "[1/9] Installing system packages..."
apt-get update -qq
apt-get install -y -qq \
    python3.12 python3.12-venv python3-pip \
    nginx certbot python3-certbot-nginx \
    git curl ufw \
    > /dev/null 2>&1

# Node.js 20 (for frontend build)
if ! command -v node &> /dev/null; then
    echo "  Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null 2>&1
fi

echo "  Python: $(python3.12 --version)"
echo "  Node: $(node --version)"

# --- 2. Create deploy user ---
echo "[2/9] Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    echo "  Created user: $DEPLOY_USER"
else
    echo "  User $DEPLOY_USER already exists"
fi

# --- 3. Clone or copy app ---
echo "[3/9] Setting up application directory..."
mkdir -p "$APP_DIR"

if [[ -n "$REPO_URL" ]]; then
    if [[ ! -d "$APP_DIR/.git" ]]; then
        echo "  Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
    else
        echo "  Repository already cloned, pulling latest..."
        cd "$APP_DIR" && git pull --ff-only
    fi
else
    echo "  No repo URL provided. Assuming files are already in $APP_DIR"
    echo "  If not, copy your project files to $APP_DIR and re-run this script."
fi

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# --- 4. Python virtual environment ---
echo "[4/9] Setting up Python environment..."
if [[ ! -d "$APP_DIR/backend/venv" ]]; then
    sudo -u "$DEPLOY_USER" python3.12 -m venv "$APP_DIR/backend/venv"
fi
sudo -u "$DEPLOY_USER" "$APP_DIR/backend/venv/bin/pip" install -q --upgrade pip
sudo -u "$DEPLOY_USER" "$APP_DIR/backend/venv/bin/pip" install -q -r "$APP_DIR/backend/requirements.txt"
echo "  Python deps installed"

# --- 5. Build frontend ---
echo "[5/9] Building frontend..."
cd "$APP_DIR/frontend"
if [[ ! -d "node_modules" ]]; then
    sudo -u "$DEPLOY_USER" npm ci --silent
fi
sudo -u "$DEPLOY_USER" npm run build
echo "  Frontend built to $APP_DIR/frontend/dist/"

# --- 6. Create directories ---
echo "[6/9] Creating data directories..."
sudo -u "$DEPLOY_USER" mkdir -p "$APP_DIR/talent-pool"
sudo -u "$DEPLOY_USER" mkdir -p "$APP_DIR/backend/logs"
touch "$APP_DIR/talent_pool.db"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/talent_pool.db" "$APP_DIR/talent-pool" "$APP_DIR/backend/logs"

# --- 7. Environment file ---
echo "[7/9] Setting up environment..."
if [[ ! -f "$APP_DIR/.env" ]]; then
    if [[ -f "$APP_DIR/deploy/env.production" ]]; then
        cp "$APP_DIR/deploy/env.production" "$APP_DIR/.env"
        echo "  Copied env.production to .env — EDIT IT with real values!"
        echo "  Run: nano $APP_DIR/.env"
    else
        echo "  WARNING: No env.production found. Create $APP_DIR/.env manually."
    fi
else
    echo "  .env already exists"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# --- 8. Systemd service ---
echo "[8/9] Configuring systemd service..."
if [[ -f "$APP_DIR/deploy/resume-analyzer.service" ]]; then
    cp "$APP_DIR/deploy/resume-analyzer.service" /etc/systemd/system/resume-analyzer.service
    systemctl daemon-reload
    systemctl enable resume-analyzer
    echo "  Service installed and enabled"
else
    echo "  WARNING: resume-analyzer.service not found in deploy/"
fi

# --- 9. Nginx ---
echo "[9/9] Configuring Nginx..."
if [[ -f "$APP_DIR/deploy/nginx.conf" ]]; then
    # Replace placeholder domain with actual domain
    sed "s/your-domain.com/$DOMAIN/g" "$APP_DIR/deploy/nginx.conf" > /etc/nginx/sites-available/resume-analyzer
    ln -sf /etc/nginx/sites-available/resume-analyzer /etc/nginx/sites-enabled/resume-analyzer

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default

    # Test nginx config
    if nginx -t 2>&1 | grep -q "successful"; then
        systemctl reload nginx
        echo "  Nginx configured and reloaded"
    else
        echo "  ERROR: Nginx config test failed. Check /etc/nginx/sites-available/resume-analyzer"
        nginx -t
    fi
else
    echo "  WARNING: nginx.conf not found in deploy/"
fi

# --- Firewall ---
echo ""
echo "Configuring firewall..."
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo "  UFW: SSH (22), HTTP (80), HTTPS (443) allowed"

# --- SSL ---
echo ""
echo "=========================================="
echo " Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Point your domain's DNS A record to this server's IP"
echo ""
echo "  2. Edit the environment file:"
echo "     sudo nano $APP_DIR/.env"
echo ""
echo "  3. Start the service:"
echo "     sudo systemctl start resume-analyzer"
echo ""
echo "  4. Get SSL certificate (after DNS propagates):"
echo "     sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "  5. Verify:"
echo "     curl http://localhost/health"
echo "     sudo systemctl status resume-analyzer"
echo ""
echo "Useful commands:"
echo "  sudo systemctl restart resume-analyzer   # restart backend"
echo "  sudo journalctl -u resume-analyzer -f     # tail logs"
echo "  sudo nano $APP_DIR/backend/system_prompt.txt  # edit prompt"
echo ""
