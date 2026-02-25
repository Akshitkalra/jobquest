#!/bin/bash
# ==================================================
# Job Portal — Local Development Startup
# ==================================================
# Usage: ./start-dev.sh
# Stop:  Ctrl+C (kills all three services)
# ==================================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS=()

cleanup() {
    echo ""
    echo "Stopping all services..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null
    done
    wait 2>/dev/null
    echo "All services stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "=========================================="
echo "  Starting Job Portal (dev mode)"
echo "=========================================="

# 1. ML Service (port 8000)
echo "[1/3] Starting ML Service on :8000..."
cd "$ROOT_DIR/ml-service"
source venv/bin/activate 2>/dev/null
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
PIDS+=($!)
cd "$ROOT_DIR"

# 2. Spring Boot API (port 8080)
echo "[2/3] Starting Spring Boot API on :8080..."
cd "$ROOT_DIR/api"
mvn spring-boot:run -q &
PIDS+=($!)
cd "$ROOT_DIR"

# 3. Next.js Frontend (port 3000)
echo "[3/3] Starting Next.js Frontend on :3000..."
cd "$ROOT_DIR/web"
npm run dev &
PIDS+=($!)
cd "$ROOT_DIR"

echo ""
echo "=========================================="
echo "  All services starting..."
echo "  Frontend:    http://localhost:3000"
echo "  API:         http://localhost:8080"
echo "  ML Service:  http://localhost:8000"
echo "  Press Ctrl+C to stop all"
echo "=========================================="

wait
