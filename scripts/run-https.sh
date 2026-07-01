#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT_DIR/certs"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"

CERT_FILE="$CERT_DIR/localhost.pem"
KEY_FILE="$CERT_DIR/localhost-key.pem"
KEYSTORE_FILE="$CERT_DIR/localhost.p12"
KEYSTORE_PASSWORD="${GATEWAY_SSL_KEY_STORE_PASSWORD:-changeit}"

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

  if [[ "$FORCE_CERTS" == false && -f "$CERT_FILE" && -f "$KEY_FILE" && -f "$KEYSTORE_FILE" ]]; then
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

  openssl pkcs12 -export \
    -in "$CERT_FILE" \
    -inkey "$KEY_FILE" \
    -out "$KEYSTORE_FILE" \
    -name localhost \
    -passout "pass:$KEYSTORE_PASSWORD"
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

  upsert_env "GATEWAY_SSL_ENABLED" "true"
  upsert_env "GATEWAY_SSL_KEY_STORE_HOST_PATH" "./certs/localhost.p12"
  upsert_env "GATEWAY_SSL_KEY_STORE" "/certs/localhost.p12"
  upsert_env "GATEWAY_SSL_KEY_STORE_PASSWORD" "$KEYSTORE_PASSWORD"
  upsert_env "GATEWAY_SSL_KEY_STORE_TYPE" "PKCS12"
  upsert_env "GATEWAY_SSL_KEY_ALIAS" "localhost"

  upsert_env "FRONTEND_SSL_CERTIFICATE_HOST_PATH" "./certs/localhost.pem"
  upsert_env "FRONTEND_SSL_CERTIFICATE" "/certs/localhost.pem"
  upsert_env "FRONTEND_SSL_CERTIFICATE_KEY_HOST_PATH" "./certs/localhost-key.pem"
  upsert_env "FRONTEND_SSL_CERTIFICATE_KEY" "/certs/localhost-key.pem"

  upsert_env "CORS_ALLOWED_ORIGINS" "https://localhost:4200"
  upsert_env "FRONTEND_API_BASE_URL" "https://localhost:8080"
}

run_compose() {
  local compose_args=(compose up --build)

  if [[ "$DETACHED" == true ]]; then
    compose_args+=(-d)
  fi

  echo "Starting HTTPS stack..."
  echo "Frontend: https://localhost:4200"
  echo "Gateway:  https://localhost:8080"

  cd "$ROOT_DIR"
  docker "${compose_args[@]}"
}

require_command openssl
require_command docker

generate_certs
prepare_env
run_compose