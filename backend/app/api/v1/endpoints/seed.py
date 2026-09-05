from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Field, Buyer, Cluster, Route
import random

router = APIRouter(prefix="/seed", tags=["Seed"])

@router.post("/")
def seed_database(db: Session = Depends(get_db)):
    # Clear existing data
    db.query(Route).delete()
    db.query(Field).delete()
    db.query(Cluster).delete()
    db.query(Buyer).delete()

    # Seed Buyer (Depot) in Bathinda
    buyer = Buyer(
        plant_name="GreenFuel Plant",
        facility_type="Biomass Power Plant",
        daily_capacity_tonnes=500.0,
        location="Bathinda",
        contact="info@greenfuel.com",
        geom="SRID=4326;POINT(74.98 30.22)"  # Longitude, Latitude
    )
    db.add(buyer)

    # Seed 10 closely grouped farms in a 5-8km radius around Bathinda (30.22, 74.98)
    # Approx 1 degree lat/lng = 111km, so 0.05 degrees is ~5.5km
    base_lat = 30.22
    base_lng = 74.98
    
    for i in range(10):
        # random offset between -0.04 and 0.04
        lat_offset = random.uniform(-0.04, 0.04)
        lng_offset = random.uniform(-0.04, 0.04)
        
        lat = base_lat + lat_offset
        lng = base_lng + lng_offset
        
        biomass = random.uniform(5.0, 20.0)
        
        field = Field(
            farmer_name=f"Farmer {i+1}",
            phone=f"+9198765432{10+i}",
            village="Demo Village",
            district="Bathinda",
            state="Punjab",
            acres=biomass * 2,
            crop_type="Paddy",
            harvest_date="2025-10-15",
            biomass=biomass,
            geom=f"SRID=4326;POINT({lng} {lat})"
        )
        db.add(field)

    db.commit()

    return {"status": "success", "message": "Database seeded with 1 buyer and 10 farms in a tight radius."}
