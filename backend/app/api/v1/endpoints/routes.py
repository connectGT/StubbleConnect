from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Route

router = APIRouter(prefix="/routes", tags=["Logistics Routes"])

@router.get("/")
def get_all_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    
    data = []
    for r in routes:
        data.append({
            "id": r.id,
            "code": r.code,
            "cluster": r.cluster_id, # Can be joined to get name later
            "buyer": r.buyer_id,     # Can be joined to get name later
            "buyerLocation": "Varies", 
            "stops": r.stops,
            "tonnage": r.tonnage,
            "status": r.status,
            "path": r.path_coords
        })
        

    # Standardize output to match frontend mockup fields
    for d in data:
        # Quick hack to inject names instead of IDs for the MVP since we seeded with names
        d["buyer"] = d["buyer"] if d["buyer"] else "EcoHeat Industries"
        d["buyerLocation"] = "Bathinda" if "GreenFuel" in d["buyer"] else "Mansa"
        
    return {"status": "success", "count": len(data), "data": data}

@router.post("/optimize")
def generate_optimal_routes(db: Session = Depends(get_db)):
    from sqlalchemy import func
    import json
    
    from app.ml_engine.routing.vrp_solver import solve_capacitated_vrp
    from app.db.models import Cluster, Buyer
    
    # 1. Fetch Clusters (Treat clusters as pickup stops)
    clusters_data = db.query(
        Cluster,
        func.ST_Y(Cluster.center_geom).label('lat'),
        func.ST_X(Cluster.center_geom).label('lng')
    ).all()
    
    if not clusters_data:
        return {"status": "error", "message": "No clusters available to route."}
        
    # 2. Fetch Buyers (Treat top buyer as depot for simplicity in MVP)
    buyers_data = db.query(
        Buyer,
        func.ST_Y(Buyer.geom).label('lat'),
        func.ST_X(Buyer.geom).label('lng')
    ).first()
    
    if not buyers_data:
        return {"status": "error", "message": "No buyers available to act as depot."}
        
    buyer_model, b_lat, b_lng = buyers_data
    depot = {
        "id": buyer_model.id,
        "name": buyer_model.plant_name,
        "latitude": b_lat,
        "longitude": b_lng
    }
    
    # Format pickup stops from clusters
    pickup_stops = []
    for c, lat, lng in clusters_data:
        pickup_stops.append({
            "id": c.id,
            "name": c.name,
            "latitude": lat,
            "longitude": lng,
            "biomass_tonnes": c.total_biomass
        })
        
    # Run VRP solver
    generated_routes = solve_capacitated_vrp(depot, pickup_stops, vehicle_capacity_tonnes=100.0)
    
    # Clear old routes
    db.query(Route).delete()
    
    for rt in generated_routes:
        new_r = Route(
            code=rt["code"],
            cluster_id="Multiple",
            buyer_id=depot["name"],
            stops=rt["stops_count"],
            tonnage=rt["tonnage"],
            status="Scheduled",
            path_coords=rt["path"]
        )
        db.add(new_r)
        
    db.commit()

    return {
        "status": "success",
        "message": f"Vehicle Routing Problem solver generated {len(generated_routes)} optimal routes.",
        "routes_count": len(generated_routes)
    }
