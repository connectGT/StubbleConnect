from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Cluster, Field
from app.ml_engine.clustering.dbscan_cluster import cluster_farms_dbscan
import numpy as np
from scipy.spatial import ConvexHull, QhullError
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
        center = [30.22, 74.98]
        if c_json:
            try:
                c_data = json.loads(c_json)
                c_coords = c_data.get("coordinates", [])
                if len(c_coords) >= 2:
                    center = [c_coords[1], c_coords[0]]
            except Exception:
                pass

        polygon = []
        if p_json:
            try:
                p_data = json.loads(p_json)
                coords_raw = p_data.get("coordinates", [])
                if coords_raw and len(coords_raw) > 0:
                    outer_ring = coords_raw[0]
                    polygon = [[pt[1], pt[0]] for pt in outer_ring if isinstance(pt, (list, tuple)) and len(pt) >= 2]
            except Exception:
                polygon = []

        if not polygon:
            c_lat, c_lng = center
            polygon = [
                [c_lat + 0.02, c_lng - 0.02],
                [c_lat + 0.02, c_lng + 0.02],
                [c_lat - 0.02, c_lng + 0.02],
                [c_lat - 0.02, c_lng - 0.02]
            ]

        data.append({
            "id": c.id,
            "number": c.number,
            "name": c.name,
            "risk_level": c.risk_level,
            "riskScore": c.risk_score,
            "risk_score": c.risk_score,
            "farmsCount": c.farms_count,
            "farms_count": c.farms_count,
            "totalBiomass": c.total_biomass,
            "total_biomass": c.total_biomass,
            "center": center,
            "polygon": polygon,
            "status": c.status or "Generated",
            "harvestWindow": c.harvest_window or "Oct 20 - Oct 28",
            "harvest_window": c.harvest_window or "Oct 20 - Oct 28",
            "avgDistance": c.avg_distance or "4.2 km",
            "avg_distance": c.avg_distance or "4.2 km",
            "nearestBuyer": c.buyer_location or "GreenFuel Plant Bathinda",
            "buyer_location": c.buyer_location or "GreenFuel Plant Bathinda",
            "buyerLocation": c.buyer_location or "GreenFuel Plant Bathinda",
            "recommended_action": c.recommended_action
        })
    # If DB is empty, return a fallback so map doesn't crash empty on first run
    if not data:
        data = [{
            "id": "c-fallback", "number": 1, "name": "Cluster (Empty DB)",
            "risk_level": "Low Risk", "riskScore": 10, "risk_score": 10,
            "farmsCount": 0, "farms_count": 0, "totalBiomass": 0, "total_biomass": 0,
            "center": [30.22, 74.98],
            "polygon": [[30.26, 74.93], [30.29, 74.99], [30.26, 75.05], [30.19, 75.04], [30.17, 74.96]],
            "status": "Generated",
            "harvestWindow": "Oct 20 - Oct 28",
            "harvest_window": "Oct 20 - Oct 28",
            "avgDistance": "4.2 km",
            "avg_distance": "4.2 km",
            "nearestBuyer": "GreenFuel Plant Bathinda",
            "buyer_location": "GreenFuel Plant Bathinda",
            "buyerLocation": "GreenFuel Plant Bathinda",
            "recommended_action": "Awaiting initial farm registration."
        }]
    return {"status": "success", "count": len(data), "data": data}

@router.post("/recompute")
def recompute_clusters(db: Session = Depends(get_db)):
    from sqlalchemy import func
    # 1. Fetch active fields (exclude Completed fields)
    fields = db.query(
        Field,
        func.ST_Y(Field.geom).label('lat'),
        func.ST_X(Field.geom).label('lng')
    ).filter(
        (Field.status != "Completed") | (Field.status.is_(None))
    ).all()
    if not fields:
        db.query(Field).update({Field.cluster_id: None})
        db.query(Cluster).delete()
        db.commit()
        return {"status": "success", "message": "No active fields to cluster.", "active_clusters_formed": 0}

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
        c_lat, c_lng = cres["center"]
        coords = np.array([[f["longitude"], f["latitude"]] for f in cluster_farms])
        wkt_poly = None
        
        unique_coords = np.unique(coords, axis=0) if len(coords) > 0 else np.array([])
        if len(unique_coords) >= 3:
            try:
                hull = ConvexHull(unique_coords)
                polygon_coords = unique_coords[hull.vertices].tolist()
                # Close the polygon for Leaflet / PostGIS
                polygon_coords.append(polygon_coords[0])
                poly_str = ", ".join([f"{lon} {lat}" for lon, lat in polygon_coords])
                wkt_poly = f"SRID=4326;POLYGON(({poly_str}))"
            except (QhullError, Exception):
                wkt_poly = None
                
        if not wkt_poly:
            # Collinear points or < 3 unique coordinates: fallback to bounding box
            if len(coords) > 0:
                min_lng, min_lat = np.min(coords, axis=0)
                max_lng, max_lat = np.max(coords, axis=0)
                pad = 0.015
                min_lng = min(min_lng - pad, c_lng - pad)
                max_lng = max(max_lng + pad, c_lng + pad)
                min_lat = min(min_lat - pad, c_lat - pad)
                max_lat = max(max_lat + pad, c_lat + pad)
                wkt_poly = f"SRID=4326;POLYGON(({min_lng} {max_lat}, {max_lng} {max_lat}, {max_lng} {min_lat}, {min_lng} {min_lat}, {min_lng} {max_lat}))"
            else:
                wkt_poly = f"SRID=4326;POLYGON(({c_lng-0.02} {c_lat+0.02}, {c_lng+0.02} {c_lat+0.02}, {c_lng+0.02} {c_lat-0.02}, {c_lng-0.02} {c_lat-0.02}, {c_lng-0.02} {c_lat+0.02}))"
            
        wkt_center = f"SRID=4326;POINT({c_lng} {c_lat})"
            
        new_cluster = Cluster(
            number=idx+1,
            name=f"Cluster #{idx+1:02d}",
            risk_level="High Risk" if cres["total_biomass_tonnes"] > 50 else ("Moderate Risk" if cres["total_biomass_tonnes"] > 30 else "Low Risk"),
            risk_score=85 if cres["total_biomass_tonnes"] > 50 else (45 if cres["total_biomass_tonnes"] > 30 else 15),
            farms_count=cres["farms_count"],
            total_biomass=cres["total_biomass_tonnes"],
            center_geom=wkt_center,
            polygon_geom=wkt_poly,
            status="Generated",
            harvest_window="Oct 20 - Oct 28",
            avg_distance="4.2 km",
            buyer_location="GreenFuel Plant Bathinda",
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
