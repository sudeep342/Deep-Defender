# Deep Defender

Deep Defender is a real-time network event simulator and monitoring dashboard. It provides a TypeScript/Node backend that produces and stores simulated network events, an API for querying and classifying events, and a React + Vite frontend dashboard for visualization and basic analytics.

## Features
- Real-time simulated packet generator (background task)
- AI-like classification of events (simulated inference)
- REST API endpoints for listing, classifying and resetting events
- Web dashboard with protected routes and live polling
- PostgreSQL storage via Drizzle ORM and migration support with `drizzle-kit`
- Authentication integration (Passport / Replit auth adapters)

## Tech stack
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL, Drizzle ORM
- Frontend: React, Vite, TypeScript, Tailwind CSS
- State / Data fetching: @tanstack/react-query
- Auth: Passport / Replit integrations

## Quickstart

Prerequisites:
- Node.js (>=18)
- PostgreSQL (provision a database and set `DATABASE_URL`)

Environment variables (minimum):
- `DATABASE_URL` – Postgres connection string
- `PORT` – optional, defaults to `5000`
- `NODE_ENV` – `development` or `production`

Install and run (development):

```bash
npm install
npm run dev
```

Build and run (production):

```bash
npm run build
npm start
```

Database migrations:

```bash
npm run db:push
```

The dev server starts both the API and the client app on the same port (default `5000`).

## Project layout
- `server/` — Express server, API route registration, background packet generator, auth integration
- `client/` — React + Vite frontend, pages and UI components
- `shared/` — shared API route schema and Drizzle schema (`shared/schema.ts`)
- `script/` — build helpers
- `drizzle.config.ts` — Drizzle configuration for migrations

Key files:
- API registration: [server/index.ts](server/index.ts)
- Routes and packet generator: [server/routes.ts](server/routes.ts)
- DB schema: [shared/schema.ts](shared/schema.ts)
- Frontend entry + routing: [client/src/App.tsx](client/src/App.tsx)

## API (high level)
The server exposes protected API endpoints (require authentication):

- `GET /api/events` — list recent events
- `GET /api/analytics` — dashboard analytics summary
- `POST /api/events/classify` — submit an event to classify (simulated)
- `POST /api/events/reset` — reset events in the DB (administrative)

The server also starts a background packet generator that creates events every ~2s for demo and dashboard purposes.

## Development notes
- Frontend polls `/api/events` and `/api/analytics` frequently (approx every 2s) for live updates.
- The project uses Drizzle + `drizzle-kit` for migrations. Ensure `DATABASE_URL` is set before running migration commands.
- Authentication is set up via the `replit_integrations/auth` adapter — update auth config if running outside Replit.

## Contributing
Contributions are welcome. Open issues or PRs with clear descriptions and small, focused changes.

## License
MIT

## Demo
A demo recording of the project is available here:

https://alliancebschool-my.sharepoint.com/personal/aashwithbtech23_ced_alliance_edu_in/_layouts/15/stream.aspx?id=%2Fpersonal%2Faashwithbtech23%5Fced%5Falliance%5Fedu%5Fin%2FDocuments%2FRecording%202026%2D03%2D02%20112919%2Emp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E318b5225%2D2d51%2D4774%2Da53d%2Dacec4a654dcb

## Deployed Link :
https://deep-defender--ssudeepkumarc.replit.app