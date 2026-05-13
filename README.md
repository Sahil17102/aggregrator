# ChoiceMee Main

Monorepo for the ChoiceMee admin dashboard, client portal, and backend API.

## Repository Layout

- `apps/admin` - React and Chakra UI operations dashboard.
- `apps/client` - Vite, React, and MUI customer shipping portal.
- `apps/landing-page` - Legacy standalone landing app, now kept only as a forwarder for stale deployments.
- `apps/backend` - Node, Express, and Drizzle backend services.

## Run Locally

- Admin: `cd apps/admin && npm install --legacy-peer-deps && npm start`
- Client: `cd apps/client && npm install && npm run dev`
- Backend: `cd apps/backend && npm install && npm run dev`

## Deployment Notes

- Netlify admin: root `apps/admin`, build `npm run build:netlify`, publish `build`, Node `20`, `NPM_FLAGS=--legacy-peer-deps`.
- Netlify client: root `apps/client`, build `npm run build:netlify`, publish `dist`, Node `20`.
- Railway backend: root `apps/backend`, build `npm install && npm run build`, start `npm start`.

The client bundle now owns the public landing route at `/`, so the same app can power both `choicemee.in` and the portal-facing routes.

Keep production environment variables and secrets in the hosting providers. Do not commit `.env` files.


