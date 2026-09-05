from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Cluster, Field
from app.ml_engine.clustering.dbscan_cluster import cluster_farms_dbscan
import numpy as np
from scipy.spatial import ConvexHull
import json

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
    db.query(Field).update({Field.cluster_id: None})
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
