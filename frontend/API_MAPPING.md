# Frontend → Gateway API mapping

This Angular SPA talks to the backend **only through the API Gateway**.

## Gateway base URL

- `http://localhost:8080`

## Public (no auth)

- `GET /api/products` → `ProductResponse[]`
- `GET /api/products/{id}` → `ProductResponse`

## Auth

- `POST /api/auth/register` → `AuthResponse`
  - body: `{ email, password, firstName, lastName, role }`
- `POST /api/auth/login` → `AuthResponse`
  - body: `{ email, password }`

`AuthResponse`:

- `{ token, role, userId }`

JWT claims used by frontend:

- `sub` = userId
- `role` = `CLIENT | SELLER`

## Profile (auth required)

- `GET /api/users/me` → `UserProfileResponse`
- `PUT /api/users/me` → `{ avatarUrl }` (updates `avatarUrl` only)

## Seller product writes (SELLER only)

- `POST /api/products` → create product
- `PUT /api/products/{id}` → update product
- `DELETE /api/products/{id}` → delete product (204)

`ProductRequest` (required fields per backend validation):

- `{ name, description, price, quantity, imageUrls }`

## Media (SELLER only)

All media requests are sent to the **Gateway** with `Authorization: Bearer <token>`.
The gateway injects `X-User-Id` / `X-User-Role` for the Media Service.

- `POST /api/media/images` (multipart)
  - field: `file` (repeatable)
  - response: `{ response: [{ id, filename, contentType, url, addedAt }] }`
- `POST /api/media/images/profile` (multipart)
  - field: `file` (single)
- `PUT /api/media/images/{productId}` (multipart)
  - fields: `newFiles` (repeatable), `oldUrls` (repeatable)
  - response: `{ message, response: { response: [...] } }`
- `DELETE /api/media/images/{mediaId}`

## Error shapes observed

- User service: `{ timestamp, status, error, message, errors? }`
- Product service: `{ error }` (validation often: `"missing fields or invalid data"`)
- Media service: `{ error }`

## Frontend assumptions / workarounds

- There is **no dedicated “my products” endpoint**; seller pages filter `GET /api/products` client-side by `sellerId === currentUserId`.
- Product image association relies on backend behavior:
  - images uploaded via `POST /api/media/images` are initially “orphan”
  - when a product is created, the Product Service emits a Kafka `PRODUCT_CREATED` event containing `imageUrls`
  - the Media Service listens and attaches those URLs to the product
- Because the Media Service cleans up old orphan media quickly (defaults ~60s), the frontend uploads product images **at save time** for new products.

