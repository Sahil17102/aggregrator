# ChoiceMee Main

Monorepo for the ChoiceMee admin dashboard, client portal, and backend API.

## Repository Layout

- `apps/admin` - React and Chakra UI operations dashboard.
- `apps/client` - Vite, React, and MUI customer shipping portal.
- `apps/landing-page` - Standalone public landing app connected to the client auth flow.
- `apps/backend` - Node, Express, and Drizzle backend services.

## Run Locally

- Admin: `cd apps/admin && npm install --legacy-peer-deps && npm start`
- Client: `cd apps/client && npm install && npm run dev`
- Backend: `cd apps/backend && npm install && npm run dev`

## Deployment Notes

- Netlify admin: root `apps/admin`, build `npm run build:netlify`, publish `build`, Node `20`, `NPM_FLAGS=--legacy-peer-deps`.
- Netlify client: root `apps/client`, build `npm run build:netlify`, publish `dist`, Node `20`.
- Netlify landing: root `apps/landing-page`, build `npm run build`, publish `dist`, Node `20`.
- Railway backend: root `apps/backend`, build `npm install && npm run build`, start `npm start`.

The public landing app serves `choicemee.in`, while the client app continues to own the portal flow at `app.choicemee.in` and `/login`.

Keep production environment variables and secrets in the hosting providers. Do not commit `.env` files.


