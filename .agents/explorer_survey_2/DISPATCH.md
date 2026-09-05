# Dispatch to explorer_survey_2

## Objective
Survey the codebase for **R3 (Biogas Plants & ML Clustering)** and **R2 (Exclusion of Completed Fields from Clustering)**.

## Scope & Instructions
1. Read `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`.
2. Locate and analyze:
   - ML clustering implementation (backend algorithms, e.g. DBSCAN, KMeans, convex hull / polygon generation, or frontend cluster rendering).
   - Biogas plants (buyer models, mock data, coordinates, markers on the map).
   - Existing farm clusters / polygons: how cluster coordinates and polygon vertices are calculated and rendered.
   - Investigate how biogas plant locations overlap or sit inside farm cluster polygons, and where they should be relocated so they are strictly outside polygons.
   - Investigate how 4-5 more cluster polygons in different places can be introduced / generated.
   - Investigate how the clustering pipeline filters fields, and ensure completed fields can be filtered out from active clustering.
3. Report your findings with exact file paths, line numbers, data flows, and proposed fix strategies.
4. Output report in your working directory: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_2\handoff.md` and `progress.md`.
