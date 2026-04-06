# FincaGest360

## Project Overview

**FincaGest360** is a modern fintech-style agricultural management web application. It manages farms (fincas), plots (lotes), employees, production, harvests, finances, payroll, supplies, and work days. Built as a pnpm monorepo with TypeScript.

## Architecture

- **Frontend** (`artifacts/fincagest360`): React + Vite, Wouter routing, TanStack Query, shadcn/ui components, Recharts, emerald green fintech theme
- **API Server** (`artifacts/api-server`): Express 5, port 8080, proxied at `/api`
- **Database** (`lib/db`): PostgreSQL + Drizzle ORM
- **API Client** (`lib/api-client-react`): Auto-generated React Query hooks via Orval from OpenAPI spec
- **Validation** (`lib/api-zod`): Auto-generated Zod schemas

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Dashboard — KPIs, monthly cash flow chart, recent activity |
| `/fincas` | Farm management — CRUD cards |
| `/lotes` | Plot management — filterable by farm |
| `/produccion` | Production records + summary metrics |
| `/cosecha` | Harvest registry with quality badges |
| `/finanzas` | Finance center — ingresos, gastos, inversiones tabs + charts |
| `/nomina` | Payroll — liquidaciones with paid/pending status |
| `/empleados` | Employee management — cards with salary info |
| `/insumos` | Supply inventory with low-stock alerts |
| `/jornadas` | Daily work logs with overtime tracking |

## DB Schema Tables

`fincas`, `lotes`, `empleados`, `produccion`, `ingresos`, `gastos`, `inversiones`, `nomina`, `insumos`, `jornadas`, `cosecha`

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **API**: Express 5, esbuild bundle
- **DB**: PostgreSQL + Drizzle ORM
- **Codegen**: Orval (OpenAPI → React Query hooks + Zod)
- **UI**: React, Vite, shadcn/ui, Tailwind v4, Recharts
- **Currency**: Colombian Pesos (COP)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Important Patterns

- Route mappers must always convert `null` DB values to `undefined` before Zod `.parse()` (use `field ?? undefined`)
- All hooks import from `@workspace/api-client-react`, never relative paths
- Cache invalidation: use `queryClient.invalidateQueries({ queryKey: getXxxQueryKey() })` after mutations
- No emojis in UI; use `data-testid` on all interactive elements
