# StubbleConnect Machine Learning & Optimization Engine

This engine contains the core intelligence algorithms powering the StubbleConnect platform:

1. **Geospatial DBSCAN Clustering (`clustering/dbscan_cluster.py`)**:
   - Aggregates individual farm plots based on Haversine distance ($\le 8\text{km}$) and synchronized harvest windows.
2. **Multi-Factor Burning Risk Model (`risk_model/burning_risk.py`)**:
   - Calculates risk scores (0-100) combining satellite hotspot indicators, weather telemetry, and remaining sowing deadlines.
3. **Capacitated Vehicle Routing Problem (CVRP) Optimizer (`routing/vrp_solver.py`)**:
   - Solves optimal multi-stop transport paths from farm clusters to industrial biomass refineries.
