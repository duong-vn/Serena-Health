# Frontend audit

## Existing screens

The starting repository has a React 19/Vite application with React Router and Recharts. The backend contains only package and TypeScript configuration. No HTTP client, persisted authentication, or real backend requests existed.

| Area | Existing routes / screens | Initial server-state gap |
| --- | --- | --- |
| Authentication | `/`, `/login`; login, signup, forgot password | Component-local accounts; signup granted doctor role; fake reset delay; no guards |
| Manager overview | `/manager/dashboard`, `/manager/report` | Hardcoded KPI/chart arrays; filters/export not connected |
| Doctor management | `/manager/doctors`, `/manager/doctors/new`, `/manager/doctors/:doctorId` | In-memory `DoctorsDataContext` CRUD |
| Chatbot monitor | `/manager/chatbot-monitor` | Twelve static transcripts, ratings and summaries |
| Doctor portal | `/doctor/dashboard` | Internal tabs for overview, live consultation, patients, schedules, appointments |
| Doctor live consultation | `LiveConsultationTab.tsx` | Local messages and consultation state; discarded notes; booking only displayed a toast |
| Doctor patients | `PatientListTab.tsx` | Inline EMR, vital signs, prescriptions and encounter fixtures |
| Doctor appointments | `AppointmentListTab.tsx` | Duplicated patient/appointment fixtures |
| Doctor schedules | `DoctorSchedulePage.tsx` | Static calendar and shift data |
| Patient | `pages/mobile-user/.gitkeep` | No implemented screen or route |
| Expert | `pages/expert/.gitkeep` | No implemented screen or route |

## Mock sources

- `src/data/patientMockData.ts`
- `src/data/scheduleData.ts`
- `src/pages/manager/doctors/doctorMockData.ts`
- `src/pages/manager/chatbot-monitor/chatbotMonitorMockData.ts`
- Inline arrays in authentication, manager dashboards/reports, and doctor tabs.
- Header identity and sidebar logout were placeholders.
- Several manager sidebar entries had no route or action.

## Implementation implications

The doctor and manager visual structure is the source of truth and should remain recognizable. Patient and expert pages must be added because none existed. Existing fake password recovery must not be presented as working without a verified recovery channel. Static clinical facts must never become fallback data when an API call fails. Missing data should be empty or explicitly unavailable.

Doctor management requires real identity, clinic/service associations and schedules. Appointment booking must use server-validated slots, not display-only dates. Consultation history and clinical notes require ownership checks, not merely role guards. Expert reviews inspect AI outputs without adding document ingestion or RAG.
