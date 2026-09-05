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
        b_name = r.buyer_id if r.buyer_id else "EcoPower Punjab (Demo Depot)"
        b_loc = "Bathinda" if any(x in b_name for x in ["Bathinda", "GreenFuel", "EcoPower"]) else "Mansa"
        data.append({
            "id": r.id,
            "code": r.code,
            "cluster": r.cluster_id,
            "buyer": b_name,
            "buyerLocation": b_loc,
            "buyer_location": b_loc,
            "stops": r.stops,
            "stops_count": r.stops,
            "tonnage": r.tonnage,
            "status": r.status,
            "path": r.path_coords
        })
        
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
        "latitude": b_lat if b_lat is not None else 30.22,
        "longitude": b_lng if b_lng is not None else 74.98
    }
    
    # Format pickup stops from clusters
    pickup_stops = []
    for c, lat, lng in clusters_data:
        pickup_stops.append({
            "id": c.id,
            "name": c.name,
            "latitude": lat if lat is not None else 30.22,
            "longitude": lng if lng is not None else 74.98,
            "biomass_tonnes": float(c.total_biomass or 10.0)
        })
        
    # Dynamically scale vehicle capacity (150T-200T default, or >= 125% of highest single cluster demand)
    max_cluster_biomass = max([p["biomass_tonnes"] for p in pickup_stops], default=0.0)
    effective_capacity = max(150.0, max_cluster_biomass * 1.25)
    
    # Run VRP solver
    generated_routes = solve_capacitated_vrp(depot, pickup_stops, vehicle_capacity_tonnes=effective_capacity)
    
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
