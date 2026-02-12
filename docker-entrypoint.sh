#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Add a PostgreSQL plugin to your Railway project."
  exit 1
fi

echo "DATABASE_URL is set, running migrations..."
node scripts/migrate.mjs

echo "Starting server..."
exec node server.js
