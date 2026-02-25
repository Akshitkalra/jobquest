#!/bin/bash
# ==================================================
# Job Portal — VPS Production Deployment Script
# ==================================================
# Run this script ONCE on your VPS after cloning the repo.
# Usage: chmod +x deploy.sh && ./deploy.sh
#
# Prerequisites on VPS:
#   - Ubuntu 22.04+ (or Debian-based)
#   - SSH access as root or a sudo user
# ==================================================

set -e  # Exit immediately on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "=========================================="
echo "  Job Portal — Production Deployment"
echo "=========================================="
echo ""

# --------------------------------------------------
# 1. Install Docker (if not present)
# --------------------------------------------------
if ! command -v docker &> /dev/null; then
    warn "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "$USER" || true
    log "Docker installed."
else
    log "Docker already installed: $(docker --version)"
fi

# --------------------------------------------------
# 2. Install Docker Compose plugin (if not present)
# --------------------------------------------------
if ! docker compose version &> /dev/null; then
    warn "Docker Compose plugin not found. Installing..."
    apt-get update -qq
    apt-get install -y docker-compose-plugin
    log "Docker Compose installed."
else
    log "Docker Compose already installed: $(docker compose version)"
fi

# --------------------------------------------------
# 3. Ensure .env.prod exists
# --------------------------------------------------
if [ ! -f ".env.prod" ]; then
    err ".env.prod not found! Copy .env.example to .env.prod and fill in your secrets."
fi
log ".env.prod found."

# --------------------------------------------------
# 4. Open firewall ports (UFW)
# --------------------------------------------------
if command -v ufw &> /dev/null; then
    log "Configuring firewall (UFW)..."
    ufw allow 22/tcp   comment "SSH"        2>/dev/null || true
    ufw allow 80/tcp   comment "HTTP"       2>/dev/null || true
    ufw allow 8080/tcp comment "API direct" 2>/dev/null || true
    ufw allow 3001/tcp comment "Frontend direct" 2>/dev/null || true
    ufw --force enable 2>/dev/null || true
    log "Firewall rules applied."
else
    warn "UFW not installed — skipping firewall config. Make sure port 80, 8080, 3001 are open in your VPS provider's firewall panel."
fi

# --------------------------------------------------
# 5. Stop existing containers (graceful)
# --------------------------------------------------
if docker compose ps -q 2>/dev/null | grep -q .; then
    warn "Stopping existing containers..."
    docker compose down --remove-orphans
fi

# --------------------------------------------------
# 6. Build and start all services
# --------------------------------------------------
log "Building and starting all containers (this may take several minutes on first run)..."
docker compose up -d --build

# --------------------------------------------------
# 8. Wait for services to be healthy
# --------------------------------------------------
log "Waiting for services to initialise (30s)..."
sleep 30

# --------------------------------------------------
# 9. Verify everything is running
# --------------------------------------------------
echo ""
echo "=========================================="
echo "  Container Status"
echo "=========================================="
docker compose ps

echo ""
echo "=========================================="
echo "  Health Checks"
echo "=========================================="

VPS_IP=$(curl -s https://api.ipify.org 2>/dev/null || echo "YOUR_VPS_IP")

# Frontend check (via Nginx)
if curl -sf -o /dev/null http://localhost:80; then
    log "Frontend (via Nginx :80) is UP"
else
    warn "Frontend via Nginx not responding yet — it may still be starting up."
fi

# API check (direct)
if curl -sf -o /dev/null http://localhost:8080; then
    log "API (:8080) is UP"
else
    warn "API not responding yet — check logs: docker compose logs api"
fi

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "  🌐  Frontend : http://${VPS_IP}"
echo "  🔌  API      : http://${VPS_IP}/api/v1"
echo "  📦  Frontend (direct): http://${VPS_IP}:3001"
echo "  📦  API (direct)     : http://${VPS_IP}:8080"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f          # live logs (all services)"
echo "    docker compose logs -f web      # frontend logs only"
echo "    docker compose logs -f api      # API logs only"
echo "    docker compose logs -f ml-service  # ML service logs"
echo "    docker compose restart web      # restart one service"
echo "    docker compose down             # stop everything"
echo "    docker compose up -d --build    # rebuild & redeploy"
echo ""
