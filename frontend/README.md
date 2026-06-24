# Inventory & Order Management — Frontend (React + Vite)

Responsive React UI for the Inventory & Order Management System.
Built with **Vite**, **Redux Toolkit (RTK Query)**, **React Router**, **Tailwind CSS**, and **shadcn/ui** components.

## Tech Stack

- **React 18** + **Vite** (JavaScript)
- **Redux Toolkit / RTK Query** — state management + data fetching/caching
- **React Router** — client-side routing
- **Tailwind CSS** + **shadcn/ui** — styling & accessible components
- **sonner** — toast notifications
- **lucide-react** — icons

## Features

- **Dashboard** — total products, customers, orders + low-stock list
- **Products** — add, list, update, delete (with validation)
- **Customers** — add, list, delete
- **Orders** — create (multi-item, live total), view details, cancel (restores stock)
- Responsive (desktop + mobile drawer nav)
- Form validation, success/error toasts, loading & empty states

## Project Structure

```
src/
├── app/store.js              # Redux store
├── features/api/apiSlice.js  # RTK Query — all backend endpoints
├── components/
│   ├── ui/                   # shadcn/ui primitives (button, card, dialog, table…)
│   ├── Layout.jsx            # Sidebar + responsive shell
│   ├── StatCard.jsx
│   └── ConfirmDialog.jsx
├── pages/                    # Dashboard, Products, Customers, Orders
├── lib/utils.js              # cn(), formatters, API error parsing
├── App.jsx                   # Routes
└── main.jsx                  # Entry (Provider + Router + Toaster)
```

## Getting Started

```bash
npm install

# Point at your backend (defaults to http://localhost:5000)
cp .env.example .env

npm run dev          # http://localhost:5173
```

Make sure the backend is running (see `../inventorymanagementbackend`).

## Build for Production

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build locally
```

## Configuring the Backend URL

The API base URL resolves in this order:

1. **`window.ENV.VITE_API_URL`** — runtime config (`public/env-config.js`)
2. **`VITE_API_URL`** — build-time env (used on Vercel/Netlify)
3. `http://localhost:5000` — local fallback

## Deploy (Vercel / Netlify)

1. Push this repo to GitHub.
2. Import the project; set the project root to `inventorymanagementfrontend`.
3. Build command: `npm run build` · Output dir: `dist`
4. Add an environment variable **`VITE_API_URL`** = your live backend URL
   (e.g. `https://your-backend.onrender.com`).
5. Deploy. Ensure the backend's `CORS_ORIGINS` includes the frontend URL.
# inventory-management-frontend
