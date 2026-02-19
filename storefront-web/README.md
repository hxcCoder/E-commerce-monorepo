# Storefront Web (V1)

Stable, standard, and adaptable white-label ecommerce base.

## What this template includes

- Real ecommerce structure (`Home`, `Store`, `Highlights`, `About`).
- Search + category filters.
- Cart, totals, and backend checkout orchestration.
- Secure session UX (login/logout + role-aware employer panel access).
- Employer panel with product CRUD (add, edit, delete, reset).
- Theme/brand configuration via `src/config.js` for easy client styling.

## Run

```bash
npx serve storefront-web
```

Or:

```bash
python -m http.server 8080
```

Open `http://localhost:3000` (serve) or `http://localhost:8080/storefront-web`.

## Demo login

- Any valid email + password length >= 8 can sign in.
- Role `employer`: unlocks product CRUD panel.
- Role `customer`: storefront and checkout only.

## Adapt for any company

1. Edit `src/config.js` (brand names, hero copy, highlights, colors).
2. Replace product seed data in `src/catalog.js`.
3. Wire real auth + real catalog CRUD APIs in backend.
4. Add tenant isolation + RBAC in production.

## Technical notes

- Session, catalog, API base, and JWT token use `localStorage` for fast demos.
- Checkout calls:
  - `POST /api/processes`
  - `POST /api/processes/start-execution`
