# Inventory & Order Management System — Backend (Flask)

A production-ready REST API for managing products, customers, orders, and inventory.
Built with **Flask**, **PostgreSQL**, and **Docker**.

## Tech Stack

- **Python 3.12** / **Flask 3**
- **PostgreSQL 16**
- **Flask-SQLAlchemy** (ORM) + **Flask-Migrate**
- **Marshmallow** (request validation)
- **Gunicorn** (production WSGI server)
- **Docker** + **Docker Compose**

## Project Structure

```
.
├── app/
│   ├── __init__.py          # App factory, CORS, error handlers
│   ├── config.py            # Env-driven configuration
│   ├── extensions.py        # db, migrate instances
│   ├── errors.py            # Centralized error handling
│   ├── models/              # Product, Customer, Order, OrderItem
│   ├── schemas/             # Marshmallow validation schemas
│   └── routes/              # products, customers, orders, dashboard
├── wsgi.py                  # Gunicorn entrypoint
├── seed.py                  # Sample data loader
├── entrypoint.sh            # Waits for DB, then starts the server
├── Dockerfile               # Slim, non-root, production image
├── docker-compose.yml       # backend + postgres services
├── .dockerignore
├── .env.example
└── render.yaml              # One-click Render deploy blueprint
```

## Quick Start (Docker Compose)

```bash
cp .env.example .env          # adjust credentials if you like
docker compose up --build
```

The API is then available at **http://localhost:5000**.

Load sample data (optional):

```bash
docker compose exec backend python seed.py
```

## Run Locally Without Docker

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Point at a local Postgres, or use SQLite for a quick demo:
export DATABASE_URL=sqlite:///dev.db

python wsgi.py                # dev server on :5000
# or: gunicorn --bind 0.0.0.0:5000 wsgi:app
```

## API Reference

Base URL: `http://localhost:5000`

### Products

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| POST   | `/products`       | Create a product         |
| GET    | `/products`       | List all products        |
| GET    | `/products/{id}`  | Get one product          |
| PUT    | `/products/{id}`  | Update a product         |
| DELETE | `/products/{id}`  | Delete a product         |

```jsonc
// POST /products
{ "name": "Wireless Mouse", "sku": "WM-001", "price": 19.99, "quantity": 50 }
```

### Customers

| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| POST   | `/customers`       | Create a customer     |
| GET    | `/customers`       | List all customers    |
| GET    | `/customers/{id}`  | Get one customer      |
| DELETE | `/customers/{id}`  | Delete a customer     |

```jsonc
// POST /customers
{ "full_name": "Alice Johnson", "email": "alice@example.com", "phone": "555-0101" }
```

### Orders

| Method | Endpoint         | Description                    |
|--------|------------------|--------------------------------|
| POST   | `/orders`        | Create an order                |
| GET    | `/orders`        | List all orders                |
| GET    | `/orders/{id}`   | Get one order (with items)     |
| DELETE | `/orders/{id}`   | Cancel order (restores stock)  |

```jsonc
// POST /orders  — total_amount is computed server-side
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

### Dashboard

| Method | Endpoint      | Description                                              |
|--------|---------------|---------------------------------------------------------|
| GET    | `/dashboard`  | Totals (products, customers, orders) + low-stock list   |

### Health

`GET /health` → `{ "status": "healthy" }`

## Business Rules Enforced

- Product **SKU** is unique; customer **email** is unique.
- Product **quantity cannot be negative** (validated + DB CHECK constraint).
- Orders are **rejected when stock is insufficient** (HTTP 409).
- Creating an order **automatically reduces stock**; cancelling **restores** it.
- **Total amount is computed by the backend** from a price snapshot per line item.
- All inputs validated (Marshmallow); consistent JSON errors with correct status codes
  (`201`, `200`, `404`, `409`, `422`, `500`).

## Environment Variables

| Variable              | Description                                              | Default     |
|-----------------------|----------------------------------------------------------|-------------|
| `DATABASE_URL`        | Full DB URL (overrides the parts below). Auto-fixes `postgres://`. | —   |
| `POSTGRES_USER`       | DB user                                                   | `postgres`  |
| `POSTGRES_PASSWORD`   | DB password                                              | `postgres`  |
| `POSTGRES_DB`         | DB name                                                  | `inventory` |
| `POSTGRES_HOST`       | DB host (`db` inside compose)                            | `localhost` |
| `POSTGRES_PORT`       | DB port                                                  | `5432`      |
| `SECRET_KEY`          | Flask secret                                            | —           |
| `CORS_ORIGINS`        | Allowed origins, comma-separated or `*`                 | `*`         |
| `LOW_STOCK_THRESHOLD` | Stock level considered "low" on the dashboard           | `10`        |
| `PORT`                | Port the server binds to                                | `5000`      |

No credentials are hardcoded — all are supplied via environment variables.

## Deployment

### Backend on Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, select the repo (uses `render.yaml`).
   This provisions a free PostgreSQL DB and wires `DATABASE_URL` automatically.
3. Once live, your API is at `https://<your-app>.onrender.com`.

> Railway / Fly.io work too — just provide a `DATABASE_URL` and the Dockerfile builds as-is.

### Docker Hub (backend image)

```bash
docker build -t <your-dockerhub-user>/inventory-backend:latest .
docker push <your-dockerhub-user>/inventory-backend:latest
```

### Frontend (Vercel/Netlify)

Point the frontend's API base URL at your deployed backend, and set `CORS_ORIGINS`
on the backend to the frontend's URL.

## Notes

- Tables are auto-created on startup (`db.create_all()`) for zero-config demos.
  `Flask-Migrate` is included if you prefer managed migrations (`flask db init/migrate/upgrade`).
- The container runs as a **non-root** user on a **slim** base image.
# inventory-management-backend
# inventory-management-backend
