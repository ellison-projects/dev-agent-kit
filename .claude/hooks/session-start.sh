#!/bin/bash
# SessionStart hook — prepares Claude Code on the web sessions so `npm test`
# (and the rest of the dev loop) works out of the box.
#
# Three things this script guarantees:
#   1. PostgreSQL is running on localhost:5432.
#   2. The `postgres` superuser has password `postgres` (matches the default
#      DATABASE_URL most test setups assume).
#   3. node_modules is installed and up to date with package.json.
#
# Local sessions short-circuit out — devs already have their environment
# configured the way they want it. The guard is `CLAUDE_CODE_REMOTE=true`,
# which the web runner sets automatically.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# 1. Ensure Postgres is running. The remote container ships with
#    postgresql-16 preinstalled but the service is not auto-started.
if ! pg_isready -q 2>/dev/null; then
  sudo service postgresql start >/dev/null 2>&1 || true
fi

# 2. Ensure the `postgres` superuser has a known password. The default
#    install uses peer auth on the unix socket but tests connect over TCP
#    with scram-sha-256, which requires a password. Idempotent — ALTER
#    USER on an already-correct password is a no-op.
if ! PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" >/dev/null 2>&1 || true
fi

# 3. Install npm deps if missing or stale (package.json newer than the
#    installed tree). Skips the network round-trip on warm container
#    starts where node_modules is cached.
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  npm install --silent --no-audit --no-fund
fi
