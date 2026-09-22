# Serene Health Full-Stack Implementation Plan

**Goal:** Turn the existing Vietnamese clinic dashboards into a runnable, secure portfolio application with real persistence and a Gemini assistant.

**Architecture:** Preserve React/Vite and its existing layouts. Use one modular NestJS REST backend under `/api/v1`, Prisma/PostgreSQL, authenticated Socket.IO for human chat, and the current stable Vercel AI SDK for Gemini UI message streaming. No RAG, embeddings, vector database, or web retrieval.

**Specification:** The implementation follows the user's 29-section full-stack specification supplied in this session.

## Audit findings

- `apps/api` contains package and TypeScript configuration only; no working server exists.
- Existing frontend routes are authentication, doctor dashboard (including patient, schedule, appointment and consultation tabs), and manager dashboard/report/doctor-management/chatbot-monitor screens.
- Existing domain types describe doctors, clinic branches, medical specialties, schedules, patients, conversations and appointments. Display labels are Vietnamese.
- Existing authentication exposes doctor/manager selection; authorization must instead derive roles from stored accounts. Public registration creates patients only.
- Patient and expert functionality will use existing shared visual conventions where no screen exists, rather than redesigning doctor/manager screens.
- Current documentation describes a prototype and must be replaced with accurate run instructions.
- Docker CLI is installed but its daemon is unavailable. Database runtime verification requires an available PostgreSQL instance; report this honestly if it remains unavailable.

## Decisions and constraints

- Use Node.js 22+, ESM TypeScript, stable Prisma 7 rather than the registry's Prisma 8 release candidate, AI SDK 7 and matching Google/React adapters.
- Use native Node scrypt for password hashing; no password hashing dependency.
- JWT bearer authentication uses short expiry and server-side user lookup. No unused refresh endpoint. Browser session storage clears on logout and 401.
- Public catalogs; all personal records filtered by authenticated identity. Doctors see only assigned cases; experts review AI conversations; managers manage catalogs and see aggregates, not unrestricted patient records.
- Fixed 30-minute appointment slots, UTC timestamps, clinic timezone Asia/Ho_Chi_Minh. Database partial unique index prevents concurrent active bookings for a doctor and timestamp.
- Tools call services, never arbitrary SQL. Tools cannot finalize booking. Escalation tool returns a proposal; explicit patient confirmation performs mutation.
- Server loads authoritative chat history and accepts only latest validated user text. Lease prevents concurrent generations; bounded history and request size limit cost.
- Emergency rules are auditable English/Vietnamese phrase checks, not a diagnosis. Emergency response works without Gemini.
- New dependencies are limited to requested stack, Nest validation/auth/security/Swagger, PostgreSQL driver, AI SDK/Zod and Socket.IO. No infrastructure beyond PostgreSQL.
- Never read existing environment/secret files. Create example environment configuration containing placeholders only. Never commit changes automatically.

## Execution tasks

- [ ] **1. Audit:** Complete screen, mock and action inventory; inspect surrounding code before each change.
- [ ] **2. Database:** Add Prisma schema, config, service/module, initial migration and idempotent seed. Models: User, PatientProfile, DoctorProfile, Clinic, MedicalService, DoctorSchedule, Appointment, Consultation, Conversation, Message, ExpertReview. Include indexes and active booking uniqueness.
- [ ] **3. Authentication:** Add validated login/register/me/profile endpoints, scrypt, JWT, global guards, role decorator, environment validation, CORS and throttling. Tests reject elevated registration and cross-role access.
- [ ] **4. Core API:** Implement catalogs, availability, transactional booking, status transitions, assigned patient records, schedules, manager doctor management. Test ownership and booking contention.
- [ ] **5. Frontend integration:** Central typed API client, authenticated routing/session, real manager/doctor data, loading/error/empty states, patient booking/profile/history and expert review screens. Preserve existing layout and components.
- [ ] **6. Gemini streaming:** Verify installed SDK declarations; use streamText, toUIMessageStream and SDK response piping with DefaultChatTransport/useChat. Controlled unavailable-provider errors, no fake output.
- [ ] **7. Tools:** Services, doctor search/details/availability/slots, current patient profile and explicit escalation proposal; Zod input validation and actor-bound services.
- [ ] **8. Persistence:** Individual messages, server-authoritative history, bounded context, per-conversation generation lease, failed/aborted completion handling.
- [ ] **9. Escalation:** Explicit consent, patient-reported summary, doctor atomic claim and completion, role/ownership enforcement.
- [ ] **10. Human chat:** Authenticated Socket.IO rooms, participation validation on joins and sends, persisted messages, REST history.
- [ ] **11. Expert:** Conversation review, flag notes, resolution. No knowledge ingestion or fake functioning knowledge base.
- [ ] **12. Manager:** PostgreSQL-backed metrics and reports, real catalog maintenance; remove random analytics.
- [ ] **13. Verification:** Node built-in tests for password/auth/ownership/booking/safety/tools, PostgreSQL integration test when available, TypeScript and builds, lint, migration and seed checks. No live Gemini in automated tests.
- [ ] **14. Documentation:** README and docs with architecture, APIs, accounts, environment, commands, safety, no-RAG decision and honest limitations; inspect diff and secret exposure without reading protected files.

## Verification commands

```bash
npm install
npm run db:generate
npm run db:validate
npm run typecheck
npm run build:web
npm run build:api
npm run lint:web
npm run lint:api
npm test
npm run db:migrate
npm run db:seed
```

Database checks must not reset or delete existing data. Initial migration is new; any later edits to an existing migration require a backup reference. Integration tests use their own test fixtures and do not run against production. Background servers must be reported with port/PID and shutdown instructions, then retained only on user request.
