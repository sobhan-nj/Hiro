# Deploy Guide — Resume Analyzer

Step-by-step guide to deploy the Resume Analyzer to a VPS.

## Prerequisites

- A VPS (Hetzner CX22 recommended — €5/month, 2 vCPU, 4GB RAM)
- A domain name pointed to the server's IP
- Ubuntu 24.04 LTS (fresh install)

## Quick Start

### 1. Set up DNS

Create an A record pointing your domain to the server's public IP:

```
your-domain.com  →  A  →  123.45.67.89
www.your-domain.com  →  A  →  123.45.67.89
```

Wait for DNS propagation (usually 5-30 minutes).

### 2. SSH into your server

```bash
ssh root@your-server-ip
```

### 3. Upload your project (if not using Git)

If your code is on GitHub, skip to step 4 (setup.sh will clone it).

If you need to upload manually from your local machine:

```bash
# On your local machine:
scp -r C:\Users\pc\resume-analyzer root@your-server-ip:/opt/resume-analyzer
```

### 4. Run the setup script

```bash
# Clone the setup script or copy it to the server, then:
chmod +x setup.sh
sudo ./setup.sh your-domain.com https://github.com/you/resume-analyzer.git
```

If you already uploaded files (no git), omit the repo URL:
```bash
sudo ./setup.sh your-domain.com
```

### 5. Configure environment variables

```bash
sudo nano /opt/resume-analyzer/.env
```

Fill in:
- `OPENAI_API_KEY` (or whichever provider you use)
- `ADMIN_API_KEY` (a secure random string — this is your admin password)
- `ANALYSIS_API_KEY` (optional — leave empty for open access)
- `CORS_ALLOWED_ORIGINS` (your domain, e.g. `https://your-domain.com`)
- `SENTRY_DSN` (optional)

Save and exit (Ctrl+X, Y, Enter).

### 6. Start the service

```bash
sudo systemctl start resume-analyzer
```

### 7. Get SSL certificate

After DNS has propagated:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot auto-renews via a systemd timer.

### 8. Verify

```bash
# Health check
curl https://your-domain.com/health

# Service status
sudo systemctl status resume-analyzer

# Tail logs
sudo journalctl -u resume-analyzer -f
```

Open `https://your-domain.com` in your browser — you should see the upload form.

## Day-to-Day Operations

### Edit the system prompt

The prompt is a plain text file — no restart needed:

```bash
sudo nano /opt/resume-analyzer/backend/system_prompt.txt
```

Changes take effect on the next analysis request (hot-reloaded in dev mode, cached in production — restart to pick up changes in prod):

```bash
sudo systemctl restart resume-analyzer
```

### Deploy code updates

After pushing changes to git:

```bash
cd /opt/resume-analyzer
sudo ./deploy/deploy.sh
```

This pulls latest code, reinstalls deps if needed, rebuilds the frontend, and restarts the backend.

### View logs

```bash
# Real-time logs
sudo journalctl -u resume-analyzer -f

# Last 100 lines
sudo journalctl -u resume-analyzer -n 100

# App-specific logs
tail -f /opt/resume-analyzer/backend/logs/*.log
```

### Restart the service

```bash
sudo systemctl restart resume-analyzer
```

### Check database

```bash
cd /opt/resume-analyzer
sqlite3 talent_pool.db "SELECT id, full_name, tier, created_at FROM talent_pool ORDER BY created_at DESC LIMIT 10;"
```

## Troubleshooting

### Service won't start

```bash
sudo journalctl -u resume-analyzer -n 50
```

Common causes:
- Missing `.env` file or invalid env vars
- Port 8000 already in use
- Python venv not set up (run setup.sh again)

### Frontend shows blank page

1. Check that `frontend/dist/` exists: `ls /opt/resume-analyzer/frontend/dist/`
2. Check nginx config: `sudo nginx -t`
3. Check nginx is running: `sudo systemctl status nginx`

### API returns CORS errors

Update `CORS_ALLOWED_ORIGINS` in `.env` to include your domain:
```
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```
Then restart: `sudo systemctl restart resume-analyzer`

### SSL certificate issues

```bash
sudo certbot renew --dry-run
sudo systemctl reload nginx
```

## Architecture

```
Internet → your-domain.com (HTTPS)
         ↓
    Nginx (port 443/80)
    ├── /           → frontend/dist/ (static React app)
    ├── /admin      → frontend/dist/ (SPA route)
    └── /api/*      → localhost:8000 (FastAPI, 4 workers)
                       ├── talent_pool.db (SQLite)
                       └── talent-pool/ (CV files)
```

## File Locations on Server

```
/opt/resume-analyzer/
├── .env                          # Environment config (EDIT THIS)
├── talent_pool.db                # SQLite database
├── talent-pool/                  # Saved CV files
├── backend/
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Config loader
│   ├── system_prompt.txt         # Analysis prompt (EDIT THIS)
│   ├── requirements.txt          # Python deps
│   ├── venv/                     # Python virtual environment
│   ├── core/                     # Analysis logic
│   ├── db/                       # Database models
│   ├── utils/                    # Utilities
│   └── logs/                     # Runtime logs
├── frontend/
│   ├── dist/                     # Built React app (served by nginx)
│   └── src/                      # Source code
└── deploy/
    ├── setup.sh                  # Initial server setup
    ├── deploy.sh                 # Code update script
    ├── nginx.conf                # Nginx config template
    ├── resume-analyzer.service   # Systemd service unit
    ├── env.production            # Production env template
    └── README.md                 # This file
```
