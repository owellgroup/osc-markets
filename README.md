# OSC Markets: product catalogue and quotation system

Customers browse products and solutions (no prices), fill a quote basket and request a quote.
OSC admins price the request and the system emails a formal quotation with a PDF attached.

- `backend/`: Spring Boot 3 (Java 21), PostgreSQL, MinIO, JWT security. Deployed on its own, port **8286**.
- `frontend/`: React 18 + TypeScript + Vite. Deployed on its own, port **5173**. It calls the live API at `http://92.4.136.176:8286`.

The two apps do not share a Docker Compose file. Each directory has its own `Dockerfile`, `docker-compose.yml`, and `.env`.

## Deploy

Backend and frontend are separate. Start each one from its own directory.

**API** (port 8286). Fill `backend/.env` first (database, mail, MinIO):

```
cd backend
docker compose up -d --build
```

Live API: http://92.4.136.176:8286

**Site** (port 5173). `frontend/.env` already points at that API:

```
cd frontend
docker compose up -d --build
```

Live site: http://92.4.136.176:5173
Admin panel: http://92.4.136.176:5173/admin

## Run locally

1. Start the API (needs Java 21; Maven is downloaded by the wrapper). Docker Compose loads `backend/.env`; a local Maven run uses the same variable names from the shell:

   ```
   cd backend
   ./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
   ```

2. Start the site:

   ```
   cd frontend
   npm install
   npm run dev
   ```

- Site: http://localhost:5173
- Admin panel: http://localhost:5173/admin
- API: http://localhost:8286 (the dev server still calls the live API unless you change `frontend/.env`)

On an empty database the API creates the super admin and a small sample catalogue.
If the frontend cannot reach the API, or the catalogue is empty, the storefront shows that same sample catalogue so the site is never blank. Live data replaces it as soon as the API is connected and has products.

**Super admin:** `joel@wayaspot.com` / `Admin@123`. This account cannot be edited or deleted.
It is the only account that can add, edit or delete other admins (Admins page).

## Frontend configuration

`frontend/.env` (baked in at `npm run build` / Docker build):

```
VITE_API_URL=http://92.4.136.176:8286
```

## Backend configuration (environment variables)

Set these in `backend/.env`. Docker Compose passes that file into the API container.

| Variable | Purpose |
| --- | --- |
| `SERVER_PORT` | `8286` |
| `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` | PostgreSQL |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_FROM` | SMTP |
| `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PUBLIC_URL` | file storage |
| `CORS_ORIGINS` | `http://92.4.136.176:5173,http://localhost:5173` |
| `SITE_URL` | `http://92.4.136.176:5173` (printed on quotes and emails) |

Before going live, set `JWT_SECRET` (64+ characters), `CORS_ORIGINS` to your site URL, real SMTP
settings and real MinIO credentials.

Tables are created and updated automatically (`ddl-auto=update`).
Uploaded images go to a private MinIO bucket and are served through `/api/files/images/{name}`.

## Notes

- The bank details printed on quotes (FNB, account 62000000000, branch 250655) are **demo values**.
  Edit them under `app.bank` in `backend/src/main/resources/application.properties`.
- Prices are in ZAR and VAT defaults to 15% (editable per quote).
- Quote references look like `OSC-Q-2026-00001`.
- Tests: `cd backend && ./mvnw test` (uses an in-memory H2 database and a mocked mail sender).
