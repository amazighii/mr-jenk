#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT_DIR/certs"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"
TRAEFIK_CONFIG_FILE="$ROOT_DIR/local-traefik-config.yml"
COMPOSE_OVERRIDE_FILE="$ROOT_DIR/docker-compose.override.yml"

CERT_FILE="$CERT_DIR/localhost.pem"
KEY_FILE="$CERT_DIR/localhost-key.pem"

DETACHED=false
FORCE_CERTS=false

usage() {
  cat <<'EOF'
Usage: ./scripts/run-https.sh [options]

Generate local HTTPS certificates, prepare .env, and run the full Docker Compose app.

Options:
  -d, --detached     Run docker compose in the background
  --force-certs      Regenerate local certificate files
  -h, --help         Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--detached)
      DETACHED=true
      shift
      ;;
    --force-certs)
      FORCE_CERTS=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

generate_certs() {
  mkdir -p "$CERT_DIR"

  if [[ "$FORCE_CERTS" == false && -f "$CERT_FILE" && -f "$KEY_FILE" ]]; then
    echo "Using existing certificates in $CERT_DIR"
    return
  fi

  echo "Generating local HTTPS certificates in $CERT_DIR"

  if command -v mkcert >/dev/null 2>&1; then
    mkcert -install
    mkcert \
      -cert-file "$CERT_FILE" \
      -key-file "$KEY_FILE" \
      localhost 127.0.0.1 ::1
  else
    echo "mkcert not found; using a self-signed OpenSSL certificate."
    echo "Your browser will ask you to accept the certificate for local development."

    openssl req -x509 \
      -newkey rsa:2048 \
      -sha256 \
      -days 825 \
      -nodes \
      -keyout "$KEY_FILE" \
      -out "$CERT_FILE" \
      -subj "/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"
  fi
}

prepare_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    if [[ ! -f "$ENV_EXAMPLE_FILE" ]]; then
      echo "Missing $ENV_EXAMPLE_FILE; cannot create .env" >&2
      exit 1
    fi

    cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
    echo "Created .env from .env.example"
  fi

  upsert_env "CORS_ALLOWED_ORIGINS" "https://localhost:8443"
  upsert_env "FRONTEND_API_BASE_URL" "https://localhost:8443"
}

prepare_traefik_override() {
  cat > "$TRAEFIK_CONFIG_FILE" <<'EOF'
tls:
  certificates:
    - certFile: /etc/traefik/certs/localhost.pem
      keyFile: /etc/traefik/certs/localhost-key.pem
EOF

  cat > "$COMPOSE_OVERRIDE_FILE" <<'EOF'
services:
  traefik:
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.file.filename=/etc/traefik/dynamic/local.yml"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.websecure.http.tls={}"
    volumes:
      - ./certs:/etc/traefik/certs:ro
      - ./local-traefik-config.yml:/etc/traefik/dynamic/local.yml:ro
EOF
}

ensure_shared_network() {
  docker network inspect shared-net >/dev/null 2>&1 || docker network create shared-net >/dev/null
}

run_compose() {
  local compose_args=(compose up --build)

  if [[ "$DETACHED" == true ]]; then
    compose_args+=(-d)
  fi

  echo "Starting HTTPS stack..."
  echo "App:     https://localhost:8443"
  echo "Gateway: https://localhost:8443/api"

  cd "$ROOT_DIR"
  docker "${compose_args[@]}"
}

require_command openssl
require_command docker

generate_certs
prepare_env
prepare_traefik_override
ensure_shared_network
run_compose
