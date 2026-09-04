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
def get_recent_activities():
    return [
        {
            "id": "act-1",
            "type": "field_registered",
            "title": "Field registered by Harjit Singh",
            "subtitle": "Village Talwandi",
            "time": "10 mins ago"
        },
        {
            "id": "act-2",
            "type": "cluster_matched",
            "title": "Cluster #12 matched with GreenFuel Plant",
            "subtitle": None,
            "time": "12 mins ago"
        },
        {
            "id": "act-3",
            "type": "route_generated",
            "title": "Route generated for Cluster #12",
            "subtitle": None,
            "time": "18 mins ago"
        },
        {
            "id": "act-4",
            "type": "field_registered",
            "title": "Field registered by Gurpreet Kaur",
            "subtitle": "Village Bhucho Mandi",
            "time": "25 mins ago"
        }
    ]
