#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEED_FILE="$ROOT_DIR/database/005_final_testing_dataset.sql"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-new_gen_palcepro}"
DB_USERNAME="${DB_USERNAME:-postgres}"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql was not found. Install PostgreSQL client tools and make sure psql is available in PATH." >&2
  exit 1
fi

echo "Resetting PlacePro QA data in database '$DB_NAME' on $DB_HOST:$DB_PORT..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$SEED_FILE"
echo "Final QA test data loaded successfully."
