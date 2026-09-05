# Dispatch for Spec Miner / Explorer 3 (Algorithms & Pitch Guide Survey)

## Mission
Investigate the implementation and triggers for DBSCAN clustering and Google OR-Tools routing in the project, as well as the live insertion fail-safe demo flow, to provide exact technical specifications for `SIH_PITCH_GUIDE.md`.

## Scope & Instructions
- Read `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`.
- Search the codebase in `c:\Users\gurut\OneDrive\Desktop\sih\` for:
  - DBSCAN clustering implementation (Python/Node/Frontend scripts, API routes, triggers, parameters, output visualization)
  - Google OR-Tools routing implementation (Vehicle Routing Problem/TSP scripts, endpoints, fleet parameters, route output)
  - Live insertion fail-safe mechanism (how dynamic stubble orders/pickups are inserted into active routes/clusters)
  - UI triggers (buttons, endpoints, or CLI steps) to demonstrate these algorithms to judges
- Define exact step-by-step click sequences, API payloads, talking points, and visual verification points for the pitch guide.
- Output your comprehensive report to `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_algo_pitch_survey\handoff.md`.

## 2026-09-05T12:18:10Z
Your working directory is: c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_algo_pitch_survey\
Your identity: Algorithm & Pitch Spec Miner
Your parent conversation ID: 75689b5b-ec5f-4ded-bb03-59272ae7a5d5

MANDATORY FIRST STEP: Read the authoritative user request at:
c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md
Also read your task instructions at:
c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_algo_pitch_survey\DISPATCH.md

Your Task:
Investigate how DBSCAN clustering and Google OR-Tools routing are implemented in the project (c:\Users\gurut\OneDrive\Desktop\sih\), as well as the live insertion fail-safe demo mechanism.
Search for:
1. DBSCAN clustering logic: backend or frontend scripts, endpoints, parameters (eps, min_samples), cluster visualization on maps.
2. Google OR-Tools routing logic: VRP / TSP formulation, capacity constraints, depot coordinates, vehicle fleet configuration, route optimization triggers, and visualization.
3. Live insertion fail-safe demo: how a newly added stubble listing or farmer request is dynamically incorporated into existing routes or re-clustered without system crash.
4. Pitch guide steps: exact UI buttons to click, backend scripts/endpoints to trigger, sample coordinates/inputs to use, expected visual outputs, and key talking points for SIH judges.

Write your complete specification and guide draft to:
c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_algo_pitch_survey\handoff.md
Update your progress.md periodically.
When done, message your parent with a concise summary and reference to handoff.md.

