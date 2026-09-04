# StubbleConnect - Antigravity Project Context & Handoff

## Project Overview
StubbleConnect is a Biomass Command Center designed to stop stubble burning by bridging the gap between farmers and biomass off-takers (power plants, industries). 
It features a dual-view interface (Farmer vs. Admin) and utilizes ML routing for logistics, live WebSocket tracking, and a PostGIS geographic database.

## Tech Stack
*   **Frontend**: React.js, Vite, Tailwind CSS, Leaflet (Maps), Lucide-React (Icons).
*   **Backend**: Python, FastAPI, SQLAlchemy, WebSockets.
*   **Database**: PostgreSQL with PostGIS extension (running via Docker).
*   **Routing Engine**: Custom Python VRP Solver (simulated with real OSRM coordinates for the truck tracker).

## Core Features Implemented So Far

1.  **PostGIS Spatial Database Integration**
    *   Switched from local SQLite to a Dockerized PostGIS database to handle geographic queries (ST_AsGeoJSON, ST_X, ST_Y).
    *   Tables created: Field, Buyer, Cluster, Route.

2.  **Admin Command Center (Logistics Mode)**
    *   **Live KPI Dashboard**: The top 6 metric cards (Biomass, Active Clusters, etc.) actively query the PostGIS database.
    *   **Dynamic Modals (z-index: 9999)**: Directory lists for Fields, Clusters, Buyers, and Routes load from FastAPI.
    *   **Live Truck Tracking**: The map uses WebSockets (ws://localhost:8000/api/v1/ws/tracking) to show trucks following *real* road curves (pulled from Open Source Routing Machine).
    *   **AI Settings Panel**: A mock configuration modal showing VRP algorithms and Satellite Fire Sync toggles.
    *   **Quick Actions**: Hardcoded precise dropdowns for Punjab villages guarantee accurate pin drops during live demos.

3.  **Farmer Dashboard (Simplified Mode)**
    *   When toggling the role to "Farmer" in the bottom left, the UI completely transforms into FarmerDashboard.jsx.
    *   Shows personal earnings, carbon credits, biomass sold, and a visual timeline tracker of the truck coming to pick up their harvest.

## How to Run the Environment
If another team member (or Antigravity agent) is taking over, run these three commands in separate terminals:

1.  **Database**: docker-compose up -d db (Wait for PostGIS to start).
2.  **Backend**: cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
3.  **Frontend**: cd frontend && npm run dev

*(Note: If the DB resets, run python -c "from app.db.database import engine, Base; Base.metadata.create_all(bind=engine)" in the backend folder to recreate tables).*

## Next Steps / Remaining Work
*   Flesh out the specific Farmer Login/Auth flow.
*   Hook up the "Register Harvest" button in the Farmer Dashboard to the actual POST endpoint.
*   Build out the mobile responsive view (PWA manifest) for the Farmer side if required for the pitch.

