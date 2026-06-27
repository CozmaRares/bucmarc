#!/usr/bin/env bash
set -euo pipefail

echo "==> Pulling latest changes..."
git pull

echo "==> Rebuilding and restarting services..."
docker compose down
docker compose up --build -d

echo "==> Done. Logs (ctrl+c to exit):"
docker compose logs -f migrate server nginx
