# OSC Markets: product catalogue and quotation system

Customers browse products and solutions (no prices), fill a quote basket and request a quote.
OSC admins price the request and the system emails a formal quotation with a PDF attached.

- `backend/`: Spring Boot 3 (Java 21), PostgreSQL, MinIO, JWT security
- `frontend/`: React 18 + TypeScript + Vite. It only needs the API URL.

## Run locally

1. Start Postgres, MinIO and a mail catcher:

   ```
   docker compose up -d
   ```

2. Start the API (needs Java 21; Maven is downloaded by the wrapper):

   ```
   cd backend
   ./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
   ```

3. Start the site:

   ```
   cd frontend
   npm install
   npm run dev
   ```

- Site: http://localhost:5173
- Admin panel: http://localhost:5173/admin
- Sent emails (MailHog): http://localhost:8025
- MinIO console: http://localhost:9001 (minioadmin / minioadmin)

On an empty database the API creates the super admin and a small sample catalogue.
If the frontend cannot reach the API, or the catalogue is empty, the storefront shows that same sample catalogue so the site is never blank. Live data replaces it as soon as the API is connected and has products.

**Super admin:** `joel@wayaspot.com` / `Admin@123`. This account cannot be edited or deleted.
It is the only account that can add, edit or delete other admins (Admins page).

## Frontend configuration

`frontend/.env`:

```
VITE_API_URL=http://localhost:8080
```

## Backend configuration (environment variables)

| Variable | Default |
| --- | --- |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | `jdbc:postgresql://localhost:5432/osc_store`, `postgres`, `postgres` |
| `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` | `http://localhost:9000`, `minioadmin`, `minioadmin`, `osc-store` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_AUTH`, `MAIL_STARTTLS` | `localhost`, `1025`, empty, empty, `false`, `false` |
| `MAIL_FROM`, `MAIL_FROM_NAME`, `OSC_NOTIFY_EMAIL` | `quotes@osc-markets.com`, `OSC Markets`, extra inbox also told about new requests (every admin is emailed automatically) |
| `JWT_SECRET`, `JWT_EXPIRATION_HOURS` | placeholder, `12` |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000,http://localhost:4173` |
| `OSC_EMAIL`, `OSC_PHONE`, `SITE_URL`, `LOGO_URL` | shown in the quote footer and emails |

Before going live, set `JWT_SECRET` (64+ characters), `CORS_ORIGINS` to your site URL, real SMTP
settings and real MinIO credentials.

Tables are created and updated automatically (`ddl-auto=update`).
Uploaded images go to a private MinIO bucket and are served through `/api/files/images/{name}`.

## Notes

- The bank details printed on quotes (FNB, account 62000000000, branch 250655) are **demo values**.
  Edit them under `app.bank` in `backend/src/main/resources/application.yml`.
- Prices are in ZAR and VAT defaults to 15% (editable per quote).
- Quote references look like `OSC-Q-2026-00001`.
- Tests: `cd backend && ./mvnw test` (uses an in-memory H2 database and a mocked mail sender).
