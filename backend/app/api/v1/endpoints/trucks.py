from fastapi import APIRouter
from app.api.v1.endpoints.websockets import TRUCKS, spawn_trucks

router = APIRouter(prefix="/trucks", tags=["Trucks"])

@router.get("/paths")
def get_truck_paths():
    if not TRUCKS:
        spawn_trucks()
    data = {}
    for truck in TRUCKS:
        data[truck["id"]] = {
            "path": truck["path"],
            "color": truck["color"]
        }
    return {"status": "success", "data": data}
