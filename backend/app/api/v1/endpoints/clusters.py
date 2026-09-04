from fastapi import APIRouter
from typing import List
from app.schemas.schemas import ClusterResponse

router = APIRouter(prefix="/clusters", tags=["Clusters"])

CLUSTERS_DB = [
    {
        "id": "cluster-12",
        "number": 12,
        "name": "Cluster #12",
        "risk_level": "High Risk",
        "risk_score": 85,
        "farms_count": 8,
        "total_biomass": 42.3,
        "harvest_window": "18 – 20 Aug 2025",
        "avg_distance": "14.2 km",
        "nearest_buyer": "GreenFuel Plant",
        "buyer_location": "Bathinda",
        "status": "Route Assigned",
        "center": [30.22, 74.98],
        "polygon": [
            [30.26, 74.93],
            [30.29, 74.99],
            [30.26, 75.05],
            [30.19, 75.04],
            [30.17, 74.96],
        ],
        "recommended_action": "Priority collection suggested due to high burning risk."
    },
    {
        "id": "cluster-8",
        "number": 8,
        "name": "Cluster #08",
        "risk_level": "Moderate Risk",
        "risk_score": 68,
        "farms_count": 11,
        "total_biomass": 58.4,
        "harvest_window": "19 – 22 Aug 2025",
        "avg_distance": "11.5 km",
        "nearest_buyer": "GreenFuel Plant",
        "buyer_location": "Bathinda",
        "status": "Route Assigned",
        "center": [30.34, 74.92],
        "polygon": [
            [30.38, 74.88],
            [30.41, 74.95],
            [30.36, 75.01],
            [30.29, 74.97],
            [30.30, 74.89],
        ],
        "recommended_action": "Standard collection route scheduled for morning batch."
    },
    {
        "id": "cluster-7",
        "number": 7,
        "name": "Cluster #07",
        "risk_level": "Low Risk",
        "risk_score": 38,
        "farms_count": 9,
        "total_biomass": 46.8,
        "harvest_window": "21 – 24 Aug 2025",
        "avg_distance": "22.0 km",
        "nearest_buyer": "GreenFuel Plant",
        "buyer_location": "Bathinda",
        "status": "Matched",
        "center": [30.18, 74.58],
        "polygon": [
            [30.22, 74.52],
            [30.24, 74.63],
            [30.17, 74.68],
            [30.12, 74.61],
            [30.14, 74.54],
        ],
        "recommended_action": "Awaiting truck dispatch confirmation."
    },
    {
        "id": "cluster-9",
        "number": 9,
        "name": "Cluster #09",
        "risk_level": "Moderate Risk",
        "risk_score": 52,
        "farms_count": 7,
        "total_biomass": 35.7,
        "harvest_window": "20 – 22 Aug 2025",
        "avg_distance": "16.8 km",
        "nearest_buyer": "EcoHeat Industries",
        "buyer_location": "Mansa",
        "status": "Route Assigned",
        "center": [30.08, 74.91],
        "polygon": [
            [30.13, 74.86],
            [30.14, 74.96],
            [30.07, 74.99],
            [30.02, 74.93],
            [30.04, 74.85],
        ],
        "recommended_action": "Route #R-09 active for tomorrow morning."
    },
    {
        "id": "cluster-6",
        "number": 6,
        "name": "Cluster #06",
        "risk_level": "Moderate Risk",
        "risk_score": 61,
        "farms_count": 10,
        "total_biomass": 51.2,
        "harvest_window": "18 – 21 Aug 2025",
        "avg_distance": "18.4 km",
        "nearest_buyer": "Punjab Biomass Ltd.",
        "buyer_location": "Sangrur",
        "status": "Route Assigned",
        "center": [30.31, 75.32],
        "polygon": [
            [30.37, 75.26],
            [30.38, 75.38],
            [30.30, 75.43],
            [30.24, 75.36],
            [30.25, 75.27],
        ],
        "recommended_action": "Combine with Cluster #04 for heavy trailer transport."
    },
    {
        "id": "cluster-5",
        "number": 5,
        "name": "Cluster #05",
        "risk_level": "High Risk",
        "risk_score": 79,
        "farms_count": 6,
        "total_biomass": 28.9,
        "harvest_window": "17 – 19 Aug 2025",
        "avg_distance": "15.1 km",
        "nearest_buyer": "EcoHeat Industries",
        "buyer_location": "Mansa",
        "status": "Pending Match",
        "center": [30.02, 75.41],
        "polygon": [
            [30.06, 75.36],
            [30.08, 75.46],
            [30.00, 75.49],
            [29.96, 75.43],
            [29.98, 75.35],
        ],
        "recommended_action": "Urgent buyer match required to prevent open burning."
    }
]

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Cluster, Field
import sys
import os
from scipy.spatial import ConvexHull
import numpy as np

# Add ml_engine to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../ml_engine")))
from clustering.dbscan_cluster import cluster_farms_dbscan

router = APIRouter(prefix="/clusters", tags=["Clusters"])

@router.get("/")
def get_all_clusters(db: Session = Depends(get_db)):
    from sqlalchemy import func
    import json
    
    clusters_data = db.query(
        Cluster,
        func.ST_AsGeoJSON(Cluster.center_geom).label('center_json'),
        func.ST_AsGeoJSON(Cluster.polygon_geom).label('poly_json')
    ).all()
    
    data = []
    for c, c_json, p_json in clusters_data:
        center_dict = json.loads(c_json) if c_json else {"coordinates": [0,0]}
        poly_dict = json.loads(p_json) if p_json else {"coordinates": [[[]]]}
        
        # PostGIS returns [lng, lat], map expects [lat, lng]
        center = [center_dict["coordinates"][1], center_dict["coordinates"][0]]
        polygon = [[coord[1], coord[0]] for coord in poly_dict["coordinates"][0]]
        
        data.append({
            "id": c.id,
            "number": c.number,
            "name": c.name,
            "risk_level": c.risk_level,
            "riskScore": c.risk_score,
            "farmsCount": c.farms_count,
            "totalBiomass": c.total_biomass,
            "center": center,
            "polygon": polygon,
            "recommended_action": c.recommended_action
        })
    # If DB is empty, return a fallback so map doesn't crash empty on first run
    if not data:
        data = [{
            "id": "c-fallback", "number": 1, "name": "Cluster (Empty DB)",
            "risk_level": "Low Risk", "riskScore": 10, "farmsCount": 0, "totalBiomass": 0,
            "center": [30.22, 74.98],
            "polygon": [[30.26, 74.93], [30.29, 74.99], [30.26, 75.05], [30.19, 75.04], [30.17, 74.96]]
        }]
    return {"status": "success", "count": len(data), "data": data}

@router.post("/recompute")
def recompute_clusters(db: Session = Depends(get_db)):
    from sqlalchemy import func
    # 1. Fetch all fields
    fields = db.query(
        Field,
        func.ST_Y(Field.geom).label('lat'),
        func.ST_X(Field.geom).label('lng')
    ).all()
    if not fields:
        return {"status": "error", "message": "No fields registered to cluster."}

    farms_data = []
    for f, lat, lng in fields:
        farms_data.append({
            "id": f.id,
            "latitude": lat,
            "longitude": lng,
            "biomass_tonnes": f.biomass
        })

    # 2. Run DBSCAN
    clusters_res = cluster_farms_dbscan(farms_data, eps_km=8.0, min_samples=3)

    # 3. Clear old clusters
    db.query(Cluster).delete()
    
    active_clusters = 0
    # 4. Save new clusters and assign fields
    for idx, cres in enumerate(clusters_res):
        cluster_farms = cres["farms"]
        
        # Calculate ConvexHull for Polygon
        coords = np.array([[f["longitude"], f["latitude"]] for f in cluster_farms])
        if len(coords) >= 3:
            hull = ConvexHull(coords)
            polygon_coords = coords[hull.vertices].tolist()
            # Close the polygon for Leaflet
            polygon_coords.append(polygon_coords[0])
            poly_str = ", ".join([f"{lon} {lat}" for lon, lat in polygon_coords])
            wkt_poly = f"SRID=4326;POLYGON(({poly_str}))"
        else:
            c_lat, c_lng = cres["center"]
            wkt_poly = f"SRID=4326;POLYGON(({c_lng-0.02} {c_lat+0.02}, {c_lng+0.02} {c_lat+0.02}, {c_lng+0.02} {c_lat-0.02}, {c_lng-0.02} {c_lat-0.02}, {c_lng-0.02} {c_lat+0.02}))"
            
        c_lat, c_lng = cres["center"]
        wkt_center = f"SRID=4326;POINT({c_lng} {c_lat})"
            
        new_cluster = Cluster(
            number=idx+1,
            name=f"Cluster #{idx+1:02d}",
            risk_level="High Risk" if cres["total_biomass_tonnes"] > 50 else "Moderate Risk",
            risk_score=85 if cres["total_biomass_tonnes"] > 50 else 45,
            farms_count=cres["farms_count"],
            total_biomass=cres["total_biomass_tonnes"],
            center_geom=wkt_center,
            polygon_geom=wkt_poly,
            status="Generated",
            recommended_action="AI generated collection zone."
        )
        db.add(new_cluster)
        db.flush() # To get new_cluster.id
        
        # Update fields
        for f_data in cluster_farms:
            f_record = db.query(Field).filter(Field.id == f_data["id"]).first()
            if f_record:
                f_record.cluster_id = new_cluster.id
                
        active_clusters += 1

    db.commit()

    return {
        "status": "success",
        "message": f"AI DBSCAN clustering executed across {len(fields)} farms.",
        "active_clusters_formed": active_clusters
    }
