from fastapi import APIRouter
from app.schemas.schemas import DashboardStatsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/dashboard-kpi", response_model=DashboardStatsResponse)
def get_dashboard_stats():
    return {
        "total_fields": 128,
        "total_biomass_tonnes": 842.6,
        "active_clusters": 16,
        "matched_clusters": 12,
        "routes_planned": 8,
        "high_risk_areas": 5
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
