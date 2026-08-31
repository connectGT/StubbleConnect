# StubbleConnect &bull; AI-Powered Biomass Marketplace & Logistics Command Center (SIH 2026)

StubbleConnect is a real-time geospatial command center and logistics platform engineered for Smart India Hackathon (SIH 2026). It solves the stubble burning challenge in Punjab & Haryana by clustering registered farms within their 0–5 day harvest window, matching them with industrial biomass buyers (Bio-CNG, Thermal Power, Pellet Plants), and dispatching optimal collection routes before open burning occurs.

---

## 📂 Repository Structure

```
├── frontend/                # React 19 + Tailwind CSS v4 + React Leaflet Command Center Dashboard
│   ├── src/
│   │   ├── components/      # Modular UI components (Sidebar, Header, StatsRow, BiomassMap, ClusterDetails, BottomRow)
│   │   ├── data/            # Mock dataset representing 128 farms, 16 clusters, 3 offtakers, 8 routes
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
│
├── backend/                 # FastAPI REST API for field telemetry, clusters, offtakers, and analytics
│   ├── app/
│   │   ├── api/v1/          # Endpoints for fields, clusters, buyers, routes, analytics
│   │   ├── core/            # Configuration & CORS settings
│   │   ├── schemas/         # Pydantic data validation schemas
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── ml_engine/               # AI & Optimization algorithms
│   ├── clustering/          # Haversine-based DBSCAN spatial farm clustering
│   ├── risk_model/          # Multi-factor stubble burning risk model (0-100 score)
│   ├── routing/             # Capacitated Vehicle Routing Problem (CVRP) solver
│   └── requirements.txt
│
├── docs/                    # Architectural diagrams & pitch specs
├── docker-compose.yml       # Full stack container orchestration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Frontend (Command Center Dashboard)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend (FastAPI Services)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Machine Learning & Optimization Engine
```bash
cd ml_engine
pip install -r requirements.txt
python clustering/dbscan_cluster.py
python risk_model/burning_risk.py
python routing/vrp_solver.py
```

### 4. Run Everything via Docker Compose
```bash
docker-compose up --build
```
