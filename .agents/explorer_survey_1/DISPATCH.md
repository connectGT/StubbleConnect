# Dispatch to explorer_survey_1

## Objective
Survey the codebase for **R1 (Data Sync Bugs: Farmer Name & Registered Fields)** and **R2 (Field States: Pending vs Completed, Seeding, Greyed-out in Admin, Exclusion from Clustering)**.

## Scope & Instructions
1. Read `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`.
2. Locate and analyze:
   - Frontend Farmer Panel components (where "My Fields" list is rendered, how fields are fetched or stored in state).
   - Frontend Admin Panel components (where fields table / cards are rendered, where farmer names are displayed - specifically why newly registered fields show "Farmer" instead of the actual name).
   - Backend APIs or mock data services for field registration and retrieval (FastAPI/Node/Flask/etc. whatever backend is used).
   - Field data model: check current schema, status/state fields (`Pending`, `Completed`, etc.).
   - Initial seed data: where fields are seeded/mocked at startup.
   - UI styling and rendering for completed/inactive fields in Admin Panel (how greyed-out styling should be applied).
3. Report your findings with exact file paths, line numbers, data flows, and proposed fix strategies.
4. Output report in your working directory: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_1\handoff.md` and `progress.md`.
