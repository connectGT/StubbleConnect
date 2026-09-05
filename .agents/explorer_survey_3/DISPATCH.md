# Dispatch to explorer_survey_3

## Objective
Survey the codebase for **R4 (Dynamic Truck Logistics Simulation)** and **R5 (Dynamic Risk Scoring Formula)**.

## Scope & Instructions
1. Read `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`.
2. Locate and analyze:
   - Logistics simulation and routing logic (OR-Tools, vehicle routing, dispatch simulation, truck state).
   - Map rendering engine and animation (Leaflet, Mapbox, React-Leaflet, canvas, or SVG animation).
   - Where hubs (private associations) and biogas plants are defined for logistics origins.
   - How truck movement animation from Hub/Plant -> Field -> Hub/Plant can be executed smoothly, and how field collection triggers status change to "Completed".
   - Risk scoring calculation: inspect where risk score is currently computed or assigned (backend ML/service or frontend).
   - Formulate and analyze the mathematical formula for risk score based solely on days since `harvest_date` (closer to/past harvest = higher risk).
3. Report your findings with exact file paths, line numbers, data flows, and proposed fix strategies.
4. Output report in your working directory: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_3\handoff.md` and `progress.md`.

## 2026-09-05T19:22:45Z
Investigate R4 (Dynamic Truck Logistics: Mixed hub model with private associations and biogas plants, dynamic map animation Hub/Plant -> Field -> Hub/Plant, field status marked Completed on collection) and R5 (Dynamic Risk Scoring: mathematical formula based solely on days since harvest_date).
Survey the logistics, routing, animation system, map rendering, and risk scoring formula across frontend and backend.
Write findings to handoff.md and update progress.md.

