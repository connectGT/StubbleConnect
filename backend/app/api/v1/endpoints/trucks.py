from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter(prefix="/trucks", tags=["Trucks"])

# __file__ = sih/backend/app/api/v1/endpoints/trucks.py  →  parents[5] = sih/
_route_file = Path(__file__).parents[5] / 'route_coords.json'
with open(_route_file, 'r') as f:
    _real_routes = json.load(f)

TRUCK_COLORS = {
    "TRK-201": "#eab308",
    "TRK-405": "#22c55e",
    "TRK-708": "#64748b",
}

@router.get("/paths")
def get_truck_paths():
    data = {}
    for truck_id, route in _real_routes.items():
        data[truck_id] = {
            "path": route["path"],
            "color": TRUCK_COLORS.get(truck_id, "#94a3b8")
        }
    return {"status": "success", "data": data}
