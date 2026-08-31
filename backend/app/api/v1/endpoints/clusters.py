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

@router.get("/")
def get_all_clusters():
    return {"status": "success", "count": len(CLUSTERS_DB), "data": CLUSTERS_DB}

@router.get("/{cluster_id}")
def get_cluster(cluster_id: str):
    cluster = next((c for c in CLUSTERS_DB if c["id"] == cluster_id or str(c["number"]) == cluster_id), None)
    if not cluster:
        return {"status": "error", "message": "Cluster not found"}
    return {"status": "success", "data": cluster}

@router.post("/recompute")
def recompute_clusters():
    # Trigger DBSCAN Geospatial Clustering algorithm
    return {
        "status": "success",
        "message": "AI DBSCAN clustering re-executed across 128 registered farms",
        "active_clusters_formed": 16,
        "matched_with_offtakers": 12
    }
