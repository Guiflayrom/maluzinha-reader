#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-$(pwd)}"
DATA_DIR="${DATA_DIR:-$APP_DIR/data}"
APP_UID="${APP_UID:-1001}"
APP_GID="${APP_GID:-1001}"

mkdir -p "$DATA_DIR"
chown -R "$APP_UID:$APP_GID" "$DATA_DIR"
chmod 775 "$DATA_DIR"

docker compose pull
docker compose build --pull
docker compose up -d
