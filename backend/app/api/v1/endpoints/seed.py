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
    db.query(Field).update({Field.cluster_id: None})
    db.query(Field).delete()
    db.query(Cluster).delete()
    db.query(Buyer).delete()

    # Define Buyer Locations across Punjab
    buyer_locations = [
        {"name": "GreenFuel Plant", "city": "Bathinda", "lat": 30.22, "lng": 74.98},
        {"name": "EcoHeat Industries", "city": "Ludhiana", "lat": 30.90, "lng": 75.85},
        {"name": "Punjab Biomass Ltd", "city": "Sangrur", "lat": 30.24, "lng": 75.84},
        {"name": "BioEnergy Corp", "city": "Patiala", "lat": 30.33, "lng": 76.38},
        {"name": "AgriPower Solutions", "city": "Moga", "lat": 30.81, "lng": 75.17}
    ]

    # Seed Buyer (Depot) in Bathinda
    buyer = Buyer(
        plant_name="EcoPower Punjab (Demo Depot)",
        facility_type="Biomass Power Plant",
        daily_capacity_tonnes=500.0,
        location="Bathinda",
        contact="info@ecopower.demo",
        geom="SRID=4326;POINT(74.98 30.22)"  # Longitude, Latitude
    )
    db.add(buyer)

    villages = ["Mehma Bhagwana", "Sivian", "Gill Patti", "Jassi Pau Wali", "Bhucho Khurd", "Lehra Bega", "Nathana", "Bhagta Bhai Ka", "Rampura Phul", "Maur Mandi"]
    farmer_names = ["Gurmit Singh", "Jaswinder Kaur", "Avtar Singh", "Manpreet Kaur", "Balwinder Singh", "Kuldeep Kaur", "Sukhdev Singh", "Paramjit Kaur", "Hardial Singh", "Karamjit Kaur"]

    # Seed 10 closely grouped farms in a 5-8km radius around Bathinda (30.22, 74.98)
    base_lat = 30.22
    base_lng = 74.98
    
    for i in range(10):
        lat_offset = random.uniform(-0.04, 0.04)
        lng_offset = random.uniform(-0.04, 0.04)
        
        lat = base_lat + lat_offset
        lng = base_lng + lng_offset
        
        biomass = random.uniform(5.0, 20.0)
        
        field = Field(
            farmer_name=farmer_names[i],
            phone=f"+9198765432{10+i}",
            village=villages[i],
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
