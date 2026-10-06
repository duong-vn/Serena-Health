# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

Serene Health is a Vietnamese-language healthcare chatbot MVP with additional role-based clinic workflows in the codebase. npm workspaces contain `apps/web` (React 19, TypeScript, Vite) and `apps/api` (NestJS 11, TypeScript, Prisma 7, PostgreSQL). README documents local setup, environment, safety limitations, and product scope; consult it before changing setup or user-facing medical guidance.

## Common commands

Run from repository root:

- `npm ci` — install workspace dependencies.
- `npm run dev:api` / `npm run dev:web` — run API / frontend.
- `npm run typecheck` — typecheck web then API.
- `npm test` — run API then web tests; or `npm run test:api`, `npm run test:web`.
- `npm run lint:api`, `npm run lint:web` — lint individual workspace.
- `npm run build:api`, `npm run build:web` — build individual workspace.
- `npm run db:generate` — generate Prisma client; run before API typecheck/build/tests after schema changes.
- `npm run db:validate` — validate Prisma schema.
- `npm run db:migrate` — apply migrations to configured database; `npm run db:seed` loads sample data. Use only intended development/test database for these operations.

Tests use Node's built-in test runner. To run one test file, use workspace script command with file path, e.g. `npm --workspace apps/api exec -- node --import tsx --test src/ai/chatbot.test.ts` or `npm --workspace apps/web exec -- node --experimental-strip-types --test src/api/client.test.ts`. API tests also live under `apps/api/test/`.

## Architecture

- **Web app:** `apps/web/src/main.tsx` mounts the React app; `App.tsx` defines React Router routes and role-gated page access. `auth/AuthContext.tsx` owns session state. `api/client.ts` centralizes REST requests, access-token storage, and refresh-token flow; `api/useChatSocket.ts` handles realtime chat transport. Pages are grouped by role (`patient`, `doctor`, `expert`, `manager`, `admin`) and compose shared chat, layout, and UI components. API calls go directly to backend; Vite does not proxy them.
- **API app:** `apps/api/src/main.ts` sets `/api/v1`, DTO validation, CORS, and Swagger at `/api/docs`. `AppModule` composes domain modules and installs global JWT authentication, role authorization, and rate-limit guards. Controllers expose REST/WebSocket interfaces; services own business logic and Prisma access. Public routes opt out of global JWT guard via auth decorators; role checks are enforced by `RolesGuard`.
- **Persistence:** `apps/api/prisma/schema.prisma` defines users and role profiles, clinic catalog, schedules, appointments, conversations/messages, consultations, expert reviews, refresh tokens, and runtime settings. Prisma client is generated into `apps/api/src/generated/prisma`; do not hand-edit generated code. Migrations are in `apps/api/prisma/migrations`.
- **Chatbot:** `apps/api/src/ai/` implements patient-only AI streaming over SSE using Vercel AI SDK and OpenRouter (`@ai-sdk/openai`). `ChatbotService` checks conversation ownership and care status, serializes generation per conversation, persists messages, applies emergency guidance, and invokes tools. `AiToolsService` exposes scoped read-only catalog, availability, and patient-profile queries; proposed doctor escalation requires explicit patient confirmation in the interface. Model selection comes from `AdminSettingsService`. Keep clinical safety and ownership checks at the backend boundary; chatbot is not a diagnostic or treatment system.
- **Domain modules:** appointments, catalog, auth/profile, conversations, consultations/human chat, doctor, expert review, manager, and admin settings are separate Nest modules. Cross-module dependencies are wired through module imports/providers; follow existing module boundaries when extending behavior.

## Local runtime

README setup expects Node.js 22.12+ or 24 LTS, PostgreSQL (Docker Compose supported), and API environment at `apps/api/.env`; optional web API base URL uses `apps/web/.env` (`VITE_API_URL`). Required runtime settings and safe database setup are described in README. Never place backend secrets in `VITE_*` variables.
