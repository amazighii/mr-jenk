# buy-01

`buy-01` is a small e-commerce platform built as a microservices project. It includes:

- An Angular frontend for browsing products and managing seller workflows
- A Spring Cloud Gateway entrypoint for API traffic
- A Eureka server for service discovery
- Separate Spring Boot services for users, products, and media
- MongoDB for service data
- MinIO for image storage
- Kafka for product/media event flow

The current app supports authentication, seller product management, product browsing, and media upload for product images and avatars.

## Architecture

Services in this repository:

- `frontend`
  Angular application
- `gateway`
  Public API entrypoint, JWT validation, CORS, service routing
- `eureka-server`
  Service registry
- `user-service`
  Registration, login, profile, public seller profile
- `product-service`
  Product CRUD and seller ownership checks
- `media-service`
  Image upload, update, delete, MinIO integration

Infrastructure used by Docker Compose:

- `mongodb_users`
- `mongodb_products`
- `mongodb_media`
- `kafka`
- `minio`

## Main Flow

The frontend talks to the gateway, not directly to backend services.

- Frontend -> Gateway
- Gateway -> User/Product/Media services
- Services register in Eureka
- Media files are stored in MinIO
- Product/media events are exchanged through Kafka

## Prerequisites

For the Docker HTTPS path:

- Docker
- Docker Compose
- `openssl`

Optional for a trusted local certificate:

- `mkcert`

For local non-Docker service development:

- Java 17
- Maven wrapper support
- Node.js 20+
- npm

## Environment

Copy the example file first:

```bash
cp .env.example .env
```

Important values to review in `.env`:

- `JWT_SECRET`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `MINIO_ACCESS_NAME`
- `MINIO_ACCESS_SECRET`

The repository includes HTTPS-related defaults for local development. The helper script will also patch the required HTTPS values into `.env` if needed.

## Run With Docker and HTTPS

The simplest way to run the whole stack is:

```bash
./scripts/run-https.sh
```

This script:

- creates `certs/localhost.pem`
- creates `certs/localhost-key.pem`
- uses `mkcert` when available, otherwise falls back to self-signed OpenSSL certs
- prepares `.env`
- runs `docker compose up --build`

Useful options:

```bash
./scripts/run-https.sh -d
./scripts/run-https.sh --force-certs
./scripts/run-https.sh --help
```

After startup:

- App: `https://localhost:8443`
- Gateway API: `https://localhost:8443/api`
- Eureka: `http://localhost:8761`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

If the script uses self-signed certificates, your browser will show a local security warning until you trust the cert.

## Run With Docker Compose Directly

If you want to manage startup yourself:

```bash
docker compose up --build
```

For HTTPS to work in that mode, make sure:

- `.env` contains `CORS_ALLOWED_ORIGINS=https://localhost:8443`
- `.env` contains `FRONTEND_API_BASE_URL=https://localhost:8443`
- `certs/localhost.pem` exists
- `certs/localhost-key.pem` exists

The helper script is still the recommended path because it generates those files for you.

## Run Services Without Docker Images

There is also a local service runner:

```bash
./run-all.sh
```

That script:

- starts infrastructure with Docker Compose
- starts the Spring Boot services with each service's Maven wrapper

This path is useful if you want backend code hot reload from local source, but it is separate from the HTTPS Docker frontend flow and is less polished.

## Frontend Development

To run only the Angular app locally:

```bash
cd frontend
npm install
npm start
```

The frontend is configured to talk to the gateway. If you are using the current HTTPS setup, the expected API base is:

```text
https://localhost:8443
```

## Common Ports

- `8443` Traefik HTTPS entrypoint
- `8000` Traefik HTTP entrypoint
- `4200` frontend direct container port
- `8080` gateway internal/direct port
- `8081` user-service
- `8082` product-service
- `8083` media-service
- `8761` eureka-server
- `9000` minio api
- `9001` minio console
- `9092` kafka

## Useful Files

- [docker-compose.yml](/home/oamyay/Desktop/buy-01/docker-compose.yml)
- [scripts/run-https.sh](/home/oamyay/Desktop/buy-01/scripts/run-https.sh)
- [.env.example](/home/oamyay/Desktop/buy-01/.env.example)
- [frontend/API_MAPPING.md](/home/oamyay/Desktop/buy-01/frontend/API_MAPPING.md)

## Troubleshooting

- If the frontend cannot reach the backend, check that the gateway API is up on `https://localhost:8443/api`.
- If Docker HTTPS startup fails, run `./scripts/run-https.sh --force-certs`.
- If the browser warns about certificates, either trust the local cert or install `mkcert` and rerun the HTTPS script.
- If uploads fail, check MinIO credentials in `.env`.
- If service-to-service behavior looks wrong, check that Eureka, Kafka, and the three Mongo containers are healthy.
