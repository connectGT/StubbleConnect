from fastapi import APIRouter
from app.api.v1.endpoints.websockets import TRUCKS

router = APIRouter(prefix="/trucks", tags=["Trucks"])

@router.get("/paths")
def get_truck_paths():
    data = []
    for truck in TRUCKS:
        data.append({
            "id": truck["id"],
            "path": truck["path"],
            "color": truck["color"]
        })
    return {"status": "success", "data": data}
