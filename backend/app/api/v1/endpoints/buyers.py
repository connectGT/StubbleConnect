from fastapi import APIRouter
from app.schemas.schemas import BuyerRegisterRequest

router = APIRouter(prefix="/buyers", tags=["Buyers"])

BUYERS_DB = [
    {
        "id": "buyer-1",
        "name": "GreenFuel Plant",
        "location": "Bathinda",
        "current_capacity": 420,
        "max_capacity": 500,
        "unit": "Tonnes",
        "percentage": 84,
        "coords": [30.232, 75.015],
        "type": "Biogas & Bio-CNG",
        "contact": "+91 98765-43210"
    },
    {
        "id": "buyer-2",
        "name": "EcoHeat Industries",
        "location": "Mansa",
        "current_capacity": 340,
        "max_capacity": 500,
        "unit": "Tonnes",
        "percentage": 68,
        "coords": [30.125, 75.445],
        "type": "Biomass Pellet Plant",
        "contact": "+91 98123-45678"
    },
    {
        "id": "buyer-3",
        "name": "Punjab Biomass Ltd.",
        "location": "Sangrur",
        "current_capacity": 280,
        "max_capacity": 500,
        "unit": "Tonnes",
        "percentage": 56,
        "coords": [30.250, 75.620],
        "type": "Thermal Power Co-generation",
        "contact": "+91 98345-67890"
    }
]

@router.get("/")
def get_all_buyers():
    return {"status": "success", "count": len(BUYERS_DB), "data": BUYERS_DB}

@router.post("/register")
def register_buyer(payload: BuyerRegisterRequest):
    new_id = f"buyer-{len(BUYERS_DB) + 1}"
    entry = {
        "id": new_id,
        "name": payload.plant_name,
        "location": payload.location,
        "current_capacity": payload.current_stored_tonnes,
        "max_capacity": payload.daily_capacity_tonnes,
        "unit": "Tonnes",
        "percentage": round((payload.current_stored_tonnes / payload.daily_capacity_tonnes) * 100, 1),
        "coords": [payload.latitude, payload.longitude],
        "type": payload.facility_type,
        "contact": payload.contact
    }
    BUYERS_DB.append(entry)
    return {"status": "success", "message": "Biomass buyer onboarded successfully", "data": entry}
