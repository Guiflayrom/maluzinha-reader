#!/bin/sh
set -eu

APP_USER="${APP_USER:-nextjs}"
APP_GROUP="${APP_GROUP:-nodejs}"
SQLITE_DB_PATH="${SQLITE_DB_PATH:-/app/data/lektor.sqlite}"
DB_DIR="$(dirname "$SQLITE_DB_PATH")"

mkdir -p "$DB_DIR"

if [ "$(id -u)" = "0" ]; then
  chown -R "$APP_USER:$APP_GROUP" "$DB_DIR"
  chmod 775 "$DB_DIR"
  exec runuser -u "$APP_USER" -- "$@"
fi

exec "$@"
