from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.schemas import FieldRegisterRequest
from app.db.database import get_db
from app.db.models import Field

router = APIRouter(prefix="/fields", tags=["Fields"])

@router.get("/")
def get_all_fields(db: Session = Depends(get_db)):
    # Using func.ST_Y and func.ST_X to get lat/long from geom
    fields = db.query(
        Field,
        func.ST_Y(Field.geom).label('lat'),
        func.ST_X(Field.geom).label('lng')
    ).all()
    
    data = []
    for f, lat, lng in fields:
        data.append({
            "id": f.id,
            "name": f"Farm {f.id[:4]}",
            "farmer": f.farmer_name,
            "village": f.village,
            "acres": f.acres,
            "biomass": f"{f.biomass} T",
            "coords": [lat, lng],
            "cluster": f.cluster.name if f.cluster else "Unassigned"
        })
        
    # Seed default data if empty so the map has something to show initially
    if not data:
        defaults = [
            {"id": "f1", "farmer_name": "Harjit Singh", "village": "Talwandi", "acres": 12.0, "biomass": 6.2, "geom": "SRID=4326;POINT(74.94 30.23)", "district": "Bathinda", "state": "Punjab", "phone": "123", "crop_type": "Paddy", "harvest_date": "2025-08-20"},
            {"id": "f2", "farmer_name": "Gurpreet Kaur", "village": "Bhucho Mandi", "acres": 9.0, "biomass": 4.8, "geom": "SRID=4326;POINT(74.97 30.28)", "district": "Bathinda", "state": "Punjab", "phone": "123", "crop_type": "Paddy", "harvest_date": "2025-08-20"},
        ]
        for d in defaults:
            new_f = Field(**d)
            db.add(new_f)
        db.commit()
        return get_all_fields(db)
        
    return {"status": "success", "count": len(data), "data": data}

@router.post("/register")
def register_field(payload: FieldRegisterRequest, db: Session = Depends(get_db)):
    est_biomass = round(payload.acres * 0.55, 1)
    
    new_field = Field(
        farmer_name=payload.farmer_name,
        phone=payload.phone,
        village=payload.village,
        district=payload.district,
        state=payload.state,
        acres=payload.acres,
        crop_type=payload.crop_type,
        harvest_date=payload.harvest_date,
        geom=f"SRID=4326;POINT({payload.longitude} {payload.latitude})",
        biomass=est_biomass
    )
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    
    return {
        "status": "success", 
        "message": f"Field registered successfully", 
        "data": {
            "id": new_field.id,
            "farmer_name": new_field.farmer_name,
            "coords": [payload.latitude, payload.longitude]
        }
    }
