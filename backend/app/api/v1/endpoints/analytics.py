from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Field, Cluster, Route, Buyer
from app.schemas.schemas import DashboardStatsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/dashboard-kpi")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Total fields
    total_fields = db.query(Field).count()
    
    # Total biomass
    total_biomass = db.query(func.sum(Field.biomass)).scalar() or 0.0
    
    # Clusters
    active_clusters = db.query(Cluster).count()
    
    # High risk areas (mock logic: clusters with biomass > 30 could be high risk, or just a dummy calc for MVP if risk isn't in DB)
    # Since we didn't add risk_score to PostGIS cluster schema yet, let's randomly flag some or base it on cluster count.
    high_risk_areas = max(0, active_clusters // 3) 
    
    # Routes
    routes_planned = db.query(Route).count()
    
    # Buyer Capacity
    total_buyer_cap = db.query(func.sum(Buyer.daily_capacity_tonnes)).scalar() or 0.0

    return {
        "total_fields": total_fields,
        "total_biomass_tonnes": round(total_biomass, 1),
        "active_clusters": active_clusters,
        "matched_clusters": min(active_clusters, routes_planned), # dummy stat
        "routes_planned": routes_planned,
        "high_risk_areas": high_risk_areas,
        "total_buyer_capacity": round(total_buyer_cap, 1)
    }

@router.get("/activity-feed")
def get_recent_activities(db: Session = Depends(get_db)):
    activities = []
    
    # 1. Get a few recent fields
    recent_fields = db.query(Field).order_by(Field.id.desc()).limit(3).all()
    for f in recent_fields:
        activities.append({
            "id": f.id,
            "type": "field_registered",
            "title": f"Field registered by {f.farmer_name}",
            "subtitle": f"Village {f.village}",
            "time": "Recently"
        })
        
    # 2. Get a few recent routes
    recent_routes = db.query(Route).order_by(Route.id.desc()).limit(2).all()
    for r in recent_routes:
        activities.append({
            "id": r.id,
            "type": "route_generated",
            "title": f"{r.code} completed for {r.buyer_id}",
            "subtitle": f"{r.tonnage} Tonnes scheduled",
            "time": "Recently"
        })
        
    return activities
