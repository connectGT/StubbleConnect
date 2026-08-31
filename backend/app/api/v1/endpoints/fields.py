from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import FieldRegisterRequest

router = APIRouter(prefix="/fields", tags=["Fields"])

# In-memory storage for demo / prototype
FIELDS_DB = [
    {"id": "f1", "farmer_name": "Harjit Singh", "village": "Talwandi", "acres": 12.0, "biomass": 6.2, "coords": [30.23, 74.94], "cluster": "Cluster #12"},
    {"id": "f2", "farmer_name": "Gurpreet Kaur", "village": "Bhucho Mandi", "acres": 9.0, "biomass": 4.8, "coords": [30.28, 74.97], "cluster": "Cluster #12"},
    {"id": "f3", "farmer_name": "Balwinder Singh", "village": "Kotkapura Rd", "acres": 15.0, "biomass": 8.1, "coords": [30.32, 74.82], "cluster": "Cluster #08"},
    {"id": "f4", "farmer_name": "Sukhdev Singh", "village": "Maur Mandi", "acres": 11.0, "biomass": 5.9, "coords": [30.07, 75.24], "cluster": "Cluster #09"},
    {"id": "f5", "farmer_name": "Jagtar Singh", "village": "Longowal North", "acres": 14.0, "biomass": 7.2, "coords": [30.18, 75.22], "cluster": "Cluster #09"},
]

@router.get("/")
def get_all_fields():
    return {"status": "success", "count": len(FIELDS_DB), "data": FIELDS_DB}

@router.post("/register")
def register_field(payload: FieldRegisterRequest):
    new_id = f"f{len(FIELDS_DB) + 1}"
    # Approximate biomass calculation: ~0.55 Tonnes stubble per acre
    est_biomass = round(payload.acres * 0.55, 1)
    
    entry = {
        "id": new_id,
        "farmer_name": payload.farmer_name,
        "village": payload.village,
        "district": payload.district,
        "acres": payload.acres,
        "biomass": est_biomass,
        "coords": [payload.latitude, payload.longitude],
        "cluster": "Cluster #12", # Automatically assigned via DBSCAN
        "harvest_date": payload.harvest_date
    }
    FIELDS_DB.append(entry)
    return {"status": "success", "message": f"Field {new_id} registered successfully", "data": entry}
