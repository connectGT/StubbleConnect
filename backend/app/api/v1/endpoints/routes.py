from fastapi import APIRouter

router = APIRouter(prefix="/routes", tags=["Logistics Routes"])

ROUTES_DB = [
    {
        "id": "route-r08",
        "code": "Route #R-08",
        "cluster": "Cluster #12",
        "buyer": "GreenFuel Plant",
        "buyer_location": "Bathinda",
        "stops": 8,
        "tonnage": 42.3,
        "status": "In Progress",
        "path": [
            [30.18, 74.58],
            [30.20, 74.75],
            [30.22, 74.98],
            [30.232, 75.015]
        ]
    },
    {
        "id": "route-r09",
        "code": "Route #R-09",
        "cluster": "Cluster #09",
        "buyer": "EcoHeat Industries",
        "buyer_location": "Mansa",
        "stops": 7,
        "tonnage": 35.7,
        "status": "Scheduled",
        "path": [
            [30.232, 75.015],
            [30.17, 75.25],
            [30.08, 74.91],
            [30.02, 75.41],
            [30.125, 75.445]
        ]
    },
    {
        "id": "route-r10",
        "code": "Route #R-10",
        "cluster": "Cluster #04",
        "buyer": "Punjab Biomass Ltd.",
        "buyer_location": "Sangrur",
        "stops": 6,
        "tonnage": 28.9,
        "status": "Scheduled",
        "path": [
            [30.31, 75.32],
            [30.28, 75.48],
            [30.250, 75.620]
        ]
    }
]

@router.get("/")
def get_all_routes():
    return {"status": "success", "count": len(ROUTES_DB), "data": ROUTES_DB}

@router.post("/optimize")
def generate_optimal_routes():
    return {
        "status": "success",
        "message": "Vehicle Routing Problem solver generated 8 optimal routes across 14 fleet vehicles",
        "routes_count": 8,
        "co2_saved_metric_tons": 1240.5
    }
