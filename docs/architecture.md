# StubbleConnect Architecture Overview (SIH 2026)

## System Flowchart

```mermaid
graph TD
    A[Farmers Register Fields] --> B[FastAPI Backend]
    C[Biomass Offtakers Register] --> B
    B --> D[ML Engine: DBSCAN Geospatial Clustering]
    D --> E[Clustered Biomass Zones & Harvest Windows]
    E --> F[Risk Scoring Engine: Thermal & Sowing Deadlines]
    F --> G[VRP Logistics Solver: Route Optimization]
    G --> H[Admin Operations Command Center Dashboard]
    G --> I[Truck Driver Dispatch & Offtaker Inventory]
```

## Core Components
1. **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Leaflet.js with ESRI Satellite imagery.
2. **Backend**: FastAPI, Pydantic v2, RESTful API layer.
3. **ML Engine**: Scikit-Learn DBSCAN, OR-Tools VRP Solver, Burning Risk Scoring.
4. **Logistics**: Multi-stop pickup routes with real-time capacity progress bars.
