from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Field, Buyer, Cluster, Route, Farmer
from app.api.v1.endpoints.clusters import recompute_clusters
from datetime import date, timedelta

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

    today = date.today()

    # 1. Seed 6 Biogas Plants / Offtakers across Punjab
    # Coordinates positioned strictly outside farm cluster polygons
    buyers_data = [
        {
            "plant_name": "GreenFuel Bio-CNG Plant (Bathinda)",
            "facility_type": "Bio-CNG Facility",
            "daily_capacity_tonnes": 600.0,
            "current_stored_tonnes": 150.0,
            "location": "Bathinda",
            "contact": "+91 98765-43210",
            "lat": 30.275,
            "lng": 74.880
        },
        {
            "plant_name": "Punjab Bio-Energy Refinery (Ludhiana)",
            "facility_type": "Biogas Power Plant",
            "daily_capacity_tonnes": 850.0,
            "current_stored_tonnes": 320.0,
            "location": "Ludhiana",
            "contact": "+91 98765-43211",
            "lat": 30.880,
            "lng": 75.830
        },
        {
            "plant_name": "Malwa Green Power Off-Taker (Mansa)",
            "facility_type": "Biomass Power Plant",
            "daily_capacity_tonnes": 450.0,
            "current_stored_tonnes": 180.0,
            "location": "Mansa",
            "contact": "+91 98765-43212",
            "lat": 29.930,
            "lng": 75.340
        },
        {
            "plant_name": "Verka Bio-Thermal Co-gen (Sangrur)",
            "facility_type": "Biogas Plant",
            "daily_capacity_tonnes": 500.0,
            "current_stored_tonnes": 210.0,
            "location": "Sangrur",
            "contact": "+91 98765-43213",
            "lat": 30.230,
            "lng": 75.820
        },
        {
            "plant_name": "AgriPower Solutions Depot (Moga)",
            "facility_type": "Private Association Hub",
            "daily_capacity_tonnes": 400.0,
            "current_stored_tonnes": 110.0,
            "location": "Moga",
            "contact": "+91 98765-43214",
            "lat": 30.820,
            "lng": 75.180
        },
        {
            "plant_name": "Satluj Bio-Pellet Works (Kotkapura)",
            "facility_type": "FPO Aggregation Hub",
            "daily_capacity_tonnes": 350.0,
            "current_stored_tonnes": 90.0,
            "location": "Kotkapura",
            "contact": "+91 98765-43215",
            "lat": 30.550,
            "lng": 74.750
        }
    ]

    for b in buyers_data:
        buyer = Buyer(
            plant_name=b["plant_name"],
            facility_type=b["facility_type"],
            daily_capacity_tonnes=b["daily_capacity_tonnes"],
            current_stored_tonnes=b["current_stored_tonnes"],
            location=b["location"],
            contact=b["contact"],
            geom=f"SRID=4326;POINT({b['lng']} {b['lat']})"
        )
        db.add(buyer)

    # 2. Seed 6 geographically distinct farm regions across Punjab (>15 km apart)
    # 4 active farms per region arranged in quadrilateral to ensure non-collinear convex hulls
    regions = [
        {
            "name": "Bathinda Central Core",
            "district": "Bathinda",
            "center": (30.22, 74.98),
            "villages": ["Mehma Bhagwana", "Sivian", "Gill Patti", "Jassi Pau Wali"],
            "farmers": ["Gurmit Singh", "Jaswinder Kaur", "Avtar Singh", "Manpreet Kaur"],
            "harvest_deltas": [0, 2, -3, 5],
            "biomasses": [14.2, 11.5, 9.8, 16.0]
        },
        {
            "name": "Rampura Phul & Bhucho",
            "district": "Bathinda",
            "center": (30.27, 75.14),
            "villages": ["Rampura Phul", "Bhucho Khurd", "Lehra Bega", "Nathana"],
            "farmers": ["Balwinder Singh", "Kuldeep Kaur", "Sukhdev Singh", "Paramjit Kaur"],
            "harvest_deltas": [0, -5, 4, -8],
            "biomasses": [12.0, 15.5, 10.2, 13.4]
        },
        {
            "name": "Talwandi Sabo & Maur",
            "district": "Bathinda",
            "center": (30.02, 75.08),
            "villages": ["Talwandi Sabo", "Maur Mandi", "Kotshamir", "Mandi Kalan"],
            "farmers": ["Hardial Singh", "Karamjit Kaur", "Jagjit Singh", "Surjit Kaur"],
            "harvest_deltas": [0, 6, -4, 2],
            "biomasses": [13.0, 17.2, 8.5, 11.8]
        },
        {
            "name": "Mansa & Budhlada",
            "district": "Mansa",
            "center": (29.99, 75.40),
            "villages": ["Budhlada", "Bhikhi", "Jhunir", "Sardulgarh"],
            "farmers": ["Amarjit Singh", "Rajinder Kaur", "Satnam Singh", "Harbhajan Kaur"],
            "harvest_deltas": [0, 3, -6, 7],
            "biomasses": [15.0, 10.8, 14.5, 9.2]
        },
        {
            "name": "Goniana & Jaitu",
            "district": "Faridkot",
            "center": (30.35, 74.88),
            "villages": ["Goniana Mandi", "Jaitu", "Bajakhana", "Kotkapura Rural"],
            "farmers": ["Darshan Singh", "Gurmeet Kaur", "Nirmal Singh", "Daljit Kaur"],
            "harvest_deltas": [0, 4, -2, 8],
            "biomasses": [11.2, 13.8, 16.5, 12.4]
        },
        {
            "name": "Malout & Gidderbaha",
            "district": "Muktsar",
            "center": (30.18, 74.60),
            "villages": ["Gidderbaha", "Malout", "Lambi", "Doda"],
            "farmers": ["Bikramjit Singh", "Kiranjit Kaur", "Tejinder Singh", "Simranjit Kaur"],
            "harvest_deltas": [0, 2, -5, 4],
            "biomasses": [14.0, 12.6, 15.0, 10.5]
        }
    ]

    quad_offsets = [
        (0.015, 0.010),
        (-0.012, 0.015),
        (-0.015, -0.012),
        (0.010, -0.015)
    ]

    farmer_counter = 0
    for r_idx, region in enumerate(regions):
        c_lat, c_lng = region["center"]
        for f_idx in range(4):
            f_name = region["farmers"][f_idx]
            phone = f"98765432{10 + farmer_counter}"
            village = region["villages"][f_idx]

            # Seed Farmer record
            farmer = Farmer(
                name=f_name,
                phone=phone,
                village=village,
                district=region["district"],
                state="Punjab",
                fpo_id=f"#{88100 + farmer_counter}",
                tier="Gold" if farmer_counter % 2 == 0 else "Green",
                joined_date=(today - timedelta(days=60 + farmer_counter * 5)).isoformat(),
                is_verified=True,
                total_biomass_sold=0.0,
                total_earnings=0.0
            )
            db.add(farmer)

            # Coordinate with quad offset for non-collinear convex hull
            dlat, dlng = quad_offsets[f_idx]
            lat = round(c_lat + dlat, 5)
            lng = round(c_lng + dlng, 5)

            # Dynamic harvest dates: positive delta = past harvest (urgent), negative delta = future harvest (low risk)
            delta = region["harvest_deltas"][f_idx]
            harvest_dt = (today - timedelta(days=delta)).isoformat()

            biomass = region["biomasses"][f_idx]
            acres = round(biomass * 2.2, 1)

            field = Field(
                farmer_name=f_name,
                phone=phone,
                village=village,
                district=region["district"],
                state="Punjab",
                acres=acres,
                crop_type="Paddy / Basmati" if f_idx % 2 == 0 else "PR-126 Paddy",
                harvest_date=harvest_dt,
                biomass=biomass,
                status="Pending",
                geom=f"SRID=4326;POINT({lng} {lat})"
            )
            db.add(field)
            farmer_counter += 1

    # 3. Seed 3 Completed Fields across different regions (strictly excluded from clustering)
    # Completed Field 1: Gurmit Singh's past field in Bathinda
    past_field_1 = Field(
        farmer_name="Gurmit Singh",
        phone="9876543210",
        village="Mehma Bhagwana",
        district="Bathinda",
        state="Punjab",
        acres=6.0,
        crop_type="Basmati 1509",
        harvest_date=(today - timedelta(days=20)).isoformat(),
        biomass=12.5,
        status="Completed",
        geom="SRID=4326;POINT(74.965 30.215)"
    )
    db.add(past_field_1)

    # Completed Field 2: Talwandi Sabo region
    past_field_2 = Field(
        farmer_name="Harmanjit Singh",
        phone="9876543271",
        village="Talwandi Sabo",
        district="Bathinda",
        state="Punjab",
        acres=8.0,
        crop_type="PR-126 Paddy",
        harvest_date=(today - timedelta(days=15)).isoformat(),
        biomass=15.0,
        status="Completed",
        geom="SRID=4326;POINT(75.075 30.015)"
    )
    db.add(past_field_2)

    # Completed Field 3: Goniana region
    past_field_3 = Field(
        farmer_name="Amritpal Kaur",
        phone="9876543272",
        village="Goniana Mandi",
        district="Faridkot",
        state="Punjab",
        acres=7.5,
        crop_type="Basmati 1121",
        harvest_date=(today - timedelta(days=12)).isoformat(),
        biomass=13.2,
        status="Completed",
        geom="SRID=4326;POINT(74.875 30.345)"
    )
    db.add(past_field_3)

    db.commit()

    # 4. Automatically recompute clusters so clusters table and convex hull polygons are populated
    cluster_res = recompute_clusters(db)

    return {
        "status": "success",
        "message": f"Database seeded with 6 buyers, 24 active farms across 6 regions, 3 completed fields, and {cluster_res.get('active_clusters_formed', 0)} active clusters.",
        "active_clusters_formed": cluster_res.get("active_clusters_formed", 0)
    }
