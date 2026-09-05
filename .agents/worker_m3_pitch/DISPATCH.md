# Dispatch for Worker M3: SIH Pitch Guide Generation

## 2026-09-05T12:40:31Z

### Identity & Context
- Working Directory: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m3_pitch\`
- Identity: Documentation & Pitch Guide Worker (`teamwork_preview_worker`)
- Parent Conversation ID: `75689b5b-ec5f-4ded-bb03-59272ae7a5d5`

### Mandatory First Step
Read the authoritative files in order:
1. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
2. `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
3. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m3_pitch\DISPATCH.md`
4. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_algo_pitch_survey\handoff.md`

### Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Write Ownership (EXCLUSIVELY OWNED FILES)
- `c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md`

### Task Requirements
Create a comprehensive, production-grade `SIH_PITCH_GUIDE.md` in the project root (`c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md`), fulfilling all acceptance criteria:
1. Exact, step-by-step click actions for presenters to navigate the entire system smoothly.
2. Clear, high-impact talking points for each screen (Admin Command Center, Farmer Portal, Logistics Map, Buyer Portal, Driver QR Pass).
3. **Explicit section on triggering "DBSCAN clustering"**:
   - Technical explanation: spatial density clustering using Haversine metric (eps=8.0 km, min_samples=3), ConvexHull polygon generation, noise point rejection.
   - Exact UI buttons to click: "Recompute Clusters" in QuickActionModal or API `POST /api/v1/clusters/recompute`.
   - Visual verification points: map cluster boundaries, biomass gauges, cluster risk score breakdown.
4. **Explicit section on triggering "Google OR-Tools routing"**:
   - Technical explanation: Capacitated Vehicle Routing Problem (CVRP) solved with Google OR-Tools constraint solver using Path Cheapest Arc and Guided Local Search.
   - Exact UI buttons to click: "Generate Dispatch Routes" or "Confirm & Dispatch Logistics Route" in ClusterModal.
   - Visual verification points: cyan polyline routes with stop counts, tonnage load, depot-to-buyer path.
5. **Live Insertion Fail-Safe Demo**:
   - Exact steps for live demo: register a new farmer field in Bathinda City (`30.211, 74.945`) with 5 acres of Paddy stubble.
   - Show how the system dynamically absorbs the new field into the nearest active cluster without downtime or crashing, updating cluster biomass and re-running routing seamlessly.
   - Fallback instructions if live network or backend is interrupted.
6. Technical Q&A defense against typical SIH jury questions (scalability, offline mode, cold start, false reporting prevention).

### Verification Requirement
Verify that `c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md` exists, contains all required sections, and specifically includes explicit steps for "DBSCAN clustering" and "Google OR-Tools routing".
Write completion report to `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m3_pitch\handoff.md`.

