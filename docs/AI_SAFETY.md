# Serene AI: scope and safety

Serene is an initial-health-guidance assistant, not a clinician. This portfolio demonstration is not a certified medical device and is not suitable for real clinical deployment without professional, privacy, legal and security review.

## Architecture

The React patient page uses `useChat` and `DefaultChatTransport`. It sends only the latest user text and conversation ID to NestJS `/api/v1/ai/chat`. NestJS authenticates the patient, verifies conversation ownership, loads stored history, and calls Gemini through the Vercel AI SDK. The Gemini key never enters a frontend environment variable or response.

This version intentionally has **no RAG**, embeddings, vector storage, document ingestion, or web browsing. Tool calls read application services backed by PostgreSQL. They are not medical knowledge retrieval.

## Application safeguards

- A small English/Vietnamese phrase list detects obvious emergencies and returns an emergency-care message without asking Gemini. It is deliberately auditable, not a medical triage engine. It can miss paraphrases and can over-trigger on quoted or historical descriptions.
- The system prompt independently instructs Gemini to recognize other urgent situations, express uncertainty, avoid definitive diagnoses, prescriptions and personalized prescription dosages, and never recommend stopping prescribed treatment.
- A conversation lease prevents overlapping generations. Generation has a timeout, bounded history, bounded output and a request rate limit.
- Client-supplied assistant/system history is never accepted. Failed or aborted assistant responses are not used as authoritative history for the next model call.
- Individual messages are persisted; metadata identifies the model and completion status. Emergency messages identify `application-safety-rules` rather than pretending to be Gemini output.
- Tool input is validated with Zod. Patient-profile access is bound to the authenticated user. No tool exposes arbitrary SQL, another patient's ID, or a booking mutation.
- Escalation tools prepare proposals only. The patient explicitly confirms sharing their conversation before the normal REST endpoint requests human care.
- Appointment booking requires the patient to choose an actual slot and confirm. Database constraints, not the model, decide whether the slot can be booked.
- Gemini/provider errors return a controlled unavailable message, never fake medical output or provider internals.

## Consent and privacy

Using Gemini sends conversation content and any profile information requested by a tool to Google's API. The application should only contain synthetic demonstration data until a suitable consent process, retention/deletion policy, provider agreement and access audit are in place. Do not enter real patient data into a public portfolio deployment.

Human chat is separate from AI streaming. Only the patient and assigned doctor can access its room and send messages. Expert access is for AI-quality review. Manager analytics should expose operational aggregates rather than unrestricted clinical records.

## Known limitations

Keyword safety rules are not comprehensive and must never be marketed as diagnostic screening. The prompt is a behavioral constraint, not a guarantee of model correctness. Tool data can change after it is displayed; booking revalidates availability. Provider/model availability depends on the configured Google account and region. Automated tests do not call Gemini.

Future work may add a clinically reviewed safety evaluation set, retention policies, consent records, stronger session management and production monitoring. A curated knowledge base with RAG is a possible later product decision, not part of this release.
