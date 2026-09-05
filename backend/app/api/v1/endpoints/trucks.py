from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/trucks", tags=["Trucks"])

# Load the real OSRM road paths from file
_route_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), 'route_coords.json')
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
