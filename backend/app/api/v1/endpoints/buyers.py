from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Buyer
from app.schemas.schemas import BuyerRegisterRequest

router = APIRouter(prefix="/buyers", tags=["Buyers"])

@router.get("/")
def get_all_buyers(db: Session = Depends(get_db)):
    buyers_data = db.query(
        Buyer,
        func.ST_Y(Buyer.geom).label('lat'),
        func.ST_X(Buyer.geom).label('lng')
    ).all()
    
    data = []
    for b, lat, lng in buyers_data:
        data.append({
            "id": b.id,
            "name": b.plant_name,
            "location": b.location,
            "currentCapacity": b.current_stored_tonnes,
            "maxCapacity": b.daily_capacity_tonnes,
            "unit": "Tonnes",
            "percentage": round((b.current_stored_tonnes / b.daily_capacity_tonnes) * 100, 1) if b.daily_capacity_tonnes else 0,
            "coords": [lat, lng],
            "type": b.facility_type,
            "contact": b.contact
        })
        
    if not data:
        # Seed default buyers
        defaults = [
            {"plant_name": "GreenFuel Plant", "location": "Bathinda", "current_stored_tonnes": 420.0, "daily_capacity_tonnes": 500.0, "geom": "SRID=4326;POINT(75.015 30.232)", "facility_type": "Biogas & Bio-CNG", "contact": "+91 98765-43210"},
            {"plant_name": "EcoHeat Industries", "location": "Mansa", "current_stored_tonnes": 340.0, "daily_capacity_tonnes": 500.0, "geom": "SRID=4326;POINT(75.445 30.125)", "facility_type": "Biomass Pellet Plant", "contact": "+91 98123-45678"},
        ]
        for d in defaults:
            db.add(Buyer(**d))
        db.commit()
        return get_all_buyers(db)
        
    return {"status": "success", "count": len(data), "data": data}

@router.post("/register")
def register_buyer(payload: BuyerRegisterRequest, db: Session = Depends(get_db)):
    new_buyer = Buyer(
        plant_name=payload.plant_name,
        facility_type=payload.facility_type,
        daily_capacity_tonnes=payload.daily_capacity_tonnes,
        current_stored_tonnes=payload.current_stored_tonnes,
        location=payload.location,
        contact=payload.contact,
        geom=f"SRID=4326;POINT({payload.longitude} {payload.latitude})"
    )
    db.add(new_buyer)
    db.commit()
    db.refresh(new_buyer)
    return {"status": "success", "message": "Biomass buyer onboarded successfully", "data": {"id": new_buyer.id}}
