#!/usr/bin/env bash
# Start the full local stack: migrations, seed data, API server.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

echo "Running migrations..."
alembic upgrade head

echo "Seeding development data..."
python scripts/seed_dev_data.py

echo "Starting API server on http://localhost:8000 (docs at /docs)..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
