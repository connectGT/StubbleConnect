from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.schemas import FieldRegisterRequest
from app.db.database import get_db
from app.db.models import Field, Farmer

from app.ml_engine.risk_model.burning_risk import calculate_dynamic_burning_risk

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
            "farmer_name": f.farmer_name,
            "phone": f.phone,
            "village": f.village,
            "district": f.district,
            "state": f.state,
            "acres": f.acres,
            "crop_type": f.crop_type,
            "biomass": f"{f.biomass} T",
            "coords": [lat, lng],
            "cluster": f.cluster.name if f.cluster else "Unassigned",
            "cluster_id": f.cluster_id,
            "is_clustered": f.cluster_id is not None,
            "harvest_date": f.harvest_date,
            "status": f.status or "Pending",
            "risk_score": calculate_dynamic_burning_risk(f.harvest_date, f.status),
        })

    return {"status": "success", "count": len(data), "data": data}

@router.post("/register")
def register_field(payload: FieldRegisterRequest, db: Session = Depends(get_db)):
    est_biomass = round(payload.acres * 0.55, 1)

    # Normalize phone number to 10 digits
    clean_phone = payload.phone.replace("+91", "").replace(" ", "").replace("-", "").strip()
    if len(clean_phone) > 10 and clean_phone.startswith("91"):
        clean_phone = clean_phone[2:]
    
    # Auto-create Farmer if they don't exist
    existing_farmer = db.query(Farmer).filter(Farmer.phone == clean_phone).first()
    if not existing_farmer:
        import random
        from datetime import date
        fpo = f"#{random.randint(88000, 88999)}"
        new_farmer = Farmer(
            name=payload.farmer_name,
            phone=clean_phone,
            village=payload.village,
            district=payload.district,
            state=payload.state,
            fpo_id=fpo,
            tier="Green",
            joined_date=str(date.today()),
            is_verified=True
        )
        db.add(new_farmer)
        db.commit()

    new_field = Field(
        farmer_name=payload.farmer_name,
        phone=clean_phone,
        village=payload.village,
        district=payload.district,
        state=payload.state,
        acres=payload.acres,
        crop_type=payload.crop_type,
        harvest_date=payload.harvest_date,
        geom=f"SRID=4326;POINT({payload.longitude} {payload.latitude})",
        biomass=est_biomass,
        status=payload.status or "Pending"
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
            "status": new_field.status,
            "coords": [payload.latitude, payload.longitude]
        }
    }

@router.post("/{field_id}/complete")
def complete_field(field_id: str, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail=f"Field {field_id} not found")
    field.status = "Completed"
    field.cluster_id = None
    db.commit()
    db.refresh(field)
    return {
        "status": "success",
        "message": f"Field {field_id} marked as Completed",
        "new_status": "Completed",
        "data": {
            "id": field.id,
            "status": field.status,
            "cluster_id": field.cluster_id
        }
    }
