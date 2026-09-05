# Dispatch Log

## 2026-09-05T19:22:11Z
From: parent (e1df7b09-ca4f-49c5-8e01-03e4ce03f407)
Mission & Scope:
Fix bugs in StubbleConnect (syncing farmer names and registered fields), enhance the ML clustering to separate biogas plants from farm clusters, and implement a dynamic truck logistics simulation (hub-and-spoke) with date-based dynamic risk scoring.
Requested team: Full Team

### Requirements:
1. R1. Fix Data Sync Bugs: Registered fields must appear in the Farmer Panel's "My Fields" list. In the Admin Panel, newly registered fields must display the actual Farmer's name instead of the hardcoded "Farmer". Make sure the frontend panels accurately pull these details.
2. R2. Field States (Pending vs. Completed): Introduce a "Completed" state for fields. Seed a few completed fields at startup so they are immediately visible. Completed fields must render as greyed out in the Admin panel and be excluded from active ML clustering.
3. R3. Plants and Clustering: Increase the number of Biogas Plants (buyers). Adjust the map coordinates so plants are located away from the farm clusters (outside the polygons). Add 4-5 more cluster polygons in different places.
4. R4. Dynamic Truck Logistics: Establish a mixed logistics hub model: some trucks start from private associations (hubs), while others are dispatched directly by the biogas plants. Trucks must dynamically animate on the map moving from their start location, to the fields to collect the biomass, marking the field as "Completed" upon collection, and then returning to their origin.
5. R5. Dynamic Risk Scoring: Implement a mathematical formula to calculate a field's risk score dynamically based solely on the days since its harvest_date (closer to/past harvest = higher risk).
