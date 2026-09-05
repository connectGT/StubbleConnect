from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Field, Buyer, Cluster, Route, Farmer
from datetime import date, timedelta
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
    db.query(Farmer).delete()

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
        current_stored_tonnes=120.0,
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
    today = date.today()
    
    for i in range(10):
        # Standard 10-digit normalized phone number (e.g. 9876543210 for primary demo farmer)
        phone = f"98765432{10+i}"

        # Seed matching Farmer record
        farmer = Farmer(
            name=farmer_names[i],
            phone=phone,
            village=villages[i],
            district="Bathinda",
            state="Punjab",
            fpo_id=f"#{88100 + i}",
            tier="Gold" if i % 2 == 0 else "Green",
            joined_date=(today - timedelta(days=60 + i * 10)).isoformat(),
            is_verified=True,
            total_biomass_sold=0.0,
            total_earnings=0.0
        )
        db.add(farmer)

        lat_offset = random.uniform(-0.04, 0.04)
        lng_offset = random.uniform(-0.04, 0.04)
        
        lat = base_lat + lat_offset
        lng = base_lng + lng_offset
        
        biomass = round(random.uniform(6.0, 18.0), 1)
        # Gurmit Singh (i=0) harvest date is 2 days ahead ("Pickup Scheduled")
        harvest_days = 2 if i == 0 else (4 + i)
        harvest_dt = (today + timedelta(days=harvest_days)).isoformat()
        
        field = Field(
            farmer_name=farmer_names[i],
            phone=phone,
            village=villages[i],
            district="Bathinda",
            state="Punjab",
            acres=round(biomass * 2.2, 1),
            crop_type="Paddy / Basmati" if i % 2 == 0 else "PR-126 Paddy",
            harvest_date=harvest_dt,
            biomass=biomass,
            geom=f"SRID=4326;POINT({lng} {lat})"
        )
        db.add(field)

    # For demo farmer Gurmit Singh (9876543210), seed a completed prior harvest for realistic earning metrics
    past_field = Field(
        farmer_name=farmer_names[0],
        phone="9876543210",
        village=villages[0],
        district="Bathinda",
        state="Punjab",
        acres=6.0,
        crop_type="Basmati 1509",
        harvest_date=(today - timedelta(days=20)).isoformat(),
        biomass=12.5,
        geom="SRID=4326;POINT(74.965 30.215)"
    )
    db.add(past_field)

    db.commit()

    return {"status": "success", "message": "Database seeded with 1 buyer, 10 farmers, and 11 fields with 10-digit phone normalization."}
