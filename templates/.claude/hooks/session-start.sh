#!/bin/bash
# SessionStart hook — prepares Claude Code on the web sessions so the dev
# loop (migrations, tests) works out of the box.
#
# What this guarantees (adjust for your stack — this template assumes Postgres):
#   1. PostgreSQL is running on localhost:5432.
#   2. The `postgres` superuser has password `postgres`.
#   3. A `$APP_DB_NAME` database exists.
#   4. DATABASE_URL is exported for the session, pointing at it.
#   5. node_modules is installed and up to date with package.json.
#
# Local sessions short-circuit out — devs configure their own environment.
#
# Every step is tee'd to $LOG so that a silent boot-time failure (sudo
# refusing, the postgres service unit missing, etc.) leaves a paper trail.
# Inspect with `cat $LOG`.
#
# ⚠️ When editing this file, do NOT re-introduce `|| true` on critical
# setup paths — silent failures here cause every downstream `npm test`
# or migration command to explode with confusing errors. See hooks/README.md.
set -euo pipefail

# --- Customize per repo --------------------------------------------------
APP_DB_NAME="app_dev"
LOG="/tmp/session-start.log"
# -------------------------------------------------------------------------

exec > >(tee -a "$LOG") 2>&1
echo "[$(date -Iseconds)] session-start hook starting (CLAUDE_CODE_REMOTE=${CLAUDE_CODE_REMOTE:-unset})"

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  echo "Not a remote session — skipping."
  exit 0
fi

# 1. Ensure Postgres is running. The remote container ships with
#    postgresql preinstalled but the service is not auto-started. Try the
#    service manager first; fall back to pg_ctlcluster (the service unit
#    is missing in some container images). Either way the pg_isready
#    gate below is the source of truth.
if ! pg_isready -q 2>/dev/null; then
  echo "Postgres not running, attempting to start it..."
  if sudo service postgresql start 2>&1; then
    echo "  sudo service postgresql start: ok"
  else
    echo "  sudo service postgresql start failed, trying pg_ctlcluster..."
    # Pick whatever major version is installed instead of hardcoding one.
    PG_VER=$(ls /etc/postgresql 2>/dev/null | sort -n | tail -1 || echo "")
    if [ -n "$PG_VER" ]; then
      sudo pg_ctlcluster "$PG_VER" main start 2>&1 || true
    fi
  fi
  # service / pg_ctlcluster can return before the socket is up. Poll.
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    pg_isready -q 2>/dev/null && break
    sleep 1
  done
fi

# Hard gate — if Postgres still isn't up, fail loudly so the rest of the
# session knows the dev loop is broken. Without this, downstream steps
# silently no-op and the user only finds out when `npm test` blows up
# with ECONNREFUSED.
if ! pg_isready -q; then
  echo "ERROR: Postgres failed to start. See $LOG for details." >&2
  exit 1
fi
echo "Postgres is up."

# 2. Ensure the `postgres` superuser has a known password. The default
#    install uses peer auth on the unix socket but apps connect over TCP
#    with scram-sha-256, which requires a password. Idempotent — ALTER
#    USER on an already-correct password is a no-op.
if ! PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  echo "Setting postgres user password..."
  sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" >/dev/null
  # Re-check — if this still fails, the next steps will all 500 anyway,
  # so surface it now.
  if ! PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1; then
    echo "ERROR: Could not authenticate to postgres after ALTER USER. See $LOG." >&2
    exit 1
  fi
fi

# 3. Ensure the dev database exists. Idempotent — checks first.
if ! PGPASSWORD=postgres psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw "$APP_DB_NAME"; then
  echo "Creating $APP_DB_NAME database..."
  PGPASSWORD=postgres createdb -h localhost -U postgres "$APP_DB_NAME"
fi

# 4. Export session env vars so migrations, dev, and tests can connect
#    without a .env.local file. CLAUDE_ENV_FILE is set by the Claude Code
#    harness when running this hook. Add any app-specific secrets here
#    (JWT_SECRET, API keys for sandboxed third-party services, etc.).
if [ -z "${CLAUDE_ENV_FILE:-}" ]; then
  echo "WARNING: CLAUDE_ENV_FILE not set — session will not pick up DATABASE_URL." >&2
else
  echo "export DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/${APP_DB_NAME}?sslmode=disable\"" >> "$CLAUDE_ENV_FILE"
  # Example app-specific secret — uncomment and adapt:
  # echo 'export JWT_SECRET="dev-secret-not-for-production"' >> "$CLAUDE_ENV_FILE"
fi

# 5. Install npm deps if missing or stale (package.json newer than the
#    installed tree). Skips the network round-trip on warm container
#    starts where node_modules is cached.
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  echo "Installing npm dependencies..."
  npm install --silent --no-audit --no-fund
fi

echo "[$(date -Iseconds)] session-start hook completed successfully"
