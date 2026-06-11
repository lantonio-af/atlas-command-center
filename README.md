# Atlas Command Center

Immersive 3D command center for **Atlas Funded** — visualise a team of AI agents working in real time.

## Agents

| Agent | Role | Connectors |
|-------|------|------------|
| **Ledger** | Finance | Meta, Docs |
| **Mercury** | Operations | Docs |
| **Pulse** | Marketing | Meta, Docs |
| **Forge** | Developer | Docs |
| **Broker** | Affiliate Manager | Docs |
| **Muse** | Creative | Higgsfield, Docs |

## Quick start

```bash
cp .env.example .env
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (port 3001 avoids conflicts with other local apps).

## Task dispatch

Use the command bar at the bottom. Tasks are auto-routed to the best agent by keywords. Examples:

- `Check 7-day Meta ROAS and flag campaigns below 4x`
- `Summarise our Atlas Meta ads plan for creative refresh`
- `Generate a 15s vertical ad brief for Atlas Funded`

## Connectors

| Connector | Env vars | Notes |
|-----------|----------|-------|
| **docs** | `DOCS_ROOT`, `DOCS_FILES` | Reads local markdown context |
| **meta** | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | Stub mode without credentials |
| **higgsfield** | `HIGGSFIELD_API_KEY` | Stub mode without API key |

## Architecture

- **Next.js 16** — App Router, API routes, SSE stream
- **React Three Fiber** — static-camera 3D room
- **Prisma + SQLite** — task/agent persistence (swap to Postgres on Railway)
- **Connector adapter layer** — add new tools in `src/lib/connectors/`

## Railway deploy

1. Set `DATABASE_URL` to PostgreSQL
2. Set connector env vars
3. Push repo — `railway.toml` included

## Adding an agent

1. Add definition in `src/config/agents.ts`
2. Wire connectors in the agent's `connectors` array
3. Optional zone props in `src/components/room/AgentZone.tsx`

## Adding a connector

1. Implement `Connector` in `src/lib/connectors/`
2. Register in `src/lib/connectors/index.ts`
3. Reference connector id on agent definitions
