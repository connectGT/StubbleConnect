from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter(prefix="/trucks", tags=["Trucks"])

import os
# Try to find route_coords.json in backend directory or project root
_route_file = Path(__file__).parents[4] / 'route_coords.json'
if not _route_file.exists():
    _route_file = Path(__file__).parents[5] / 'route_coords.json'
if not _route_file.exists():
    _route_file = Path('/app/route_coords.json')
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
