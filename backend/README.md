# StubbleConnect Backend API

FastAPI-powered REST API backend for the StubbleConnect biomass marketplace and logistics engine.

## Features
- **Field Telemetry & Registration API**: Farm plots, GPS coordinates, biomass estimations.
- **DBSCAN Geospatial Clustering**: Aggregates adjacent farms into viable logistics zones.
- **Buyer & Storage Registry**: Bio-CNG, Thermal power, and Pellet plant quotas.
- **Vehicle Routing Engine (VRP)**: Generates minimal-cost, multi-stop pickup paths.
- **Real-Time KPIs**: Real-time stats feeding the Command Center dashboard.

## Running Locally

1. Create a virtual environment and install dependencies:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

3. Open Swagger API Docs at:
```
http://localhost:8000/docs
```
