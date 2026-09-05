from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import math
import uuid
from geoalchemy2.shape import to_shape
from app.db.database import SessionLocal
from app.db.models import Field, Buyer

router = APIRouter(prefix="/ws", tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

manager = ConnectionManager()

def interpolate_points(p1, p2, fraction):
    return [p1[0] + (p2[0] - p1[0]) * fraction, p1[1] + (p2[1] - p1[1]) * fraction]

# In-memory trucks state
TRUCKS = []
ACTIVE_TARGETS = set()

def get_hubs():
    db = SessionLocal()
    try:
        buyers = db.query(Buyer).all()
        hubs = []
        for b in buyers:
            pt = to_shape(b.geom)
            hubs.append({
                "id": b.id,
                "name": b.plant_name,
                "type": b.facility_type,
                "coords": [pt.y, pt.x]
            })
        return hubs
    finally:
        db.close()

def get_pending_fields():
    db = SessionLocal()
    try:
        fields = db.query(Field).filter(Field.status == "Pending").all()
        res = []
        for f in fields:
            pt = to_shape(f.geom)
            res.append({
                "id": f.id,
                "coords": [pt.y, pt.x],
                "biomass": f.biomass
            })
        return res
    finally:
        db.close()

def complete_field(field_id: str):
    db = SessionLocal()
    try:
        field = db.query(Field).filter(Field.id == field_id).first()
        if field:
            field.status = "Completed"
            db.commit()
    finally:
        db.close()

def spawn_trucks():
    hubs = get_hubs()
    pending = get_pending_fields()
    
    # Filter out fields already targeted
    available = [f for f in pending if f["id"] not in ACTIVE_TARGETS]
    
    # We want max 6 trucks active
    while len(TRUCKS) < 6 and available and hubs:
        f = available.pop(0)
        h = hubs[len(TRUCKS) % len(hubs)]
        ACTIVE_TARGETS.add(f["id"])
        
        # Simple path: Origin -> Field -> Origin
        path = [h["coords"], f["coords"], h["coords"]]
        
        truck_id = f"TRK-{str(uuid.uuid4())[:4].upper()}"
        
        TRUCKS.append({
            "id": truck_id,
            "status": "En route to Collection",
            "color": "#3b82f6" if "Hub" in h["type"] else "#ef4444",
            "tonnage": "0.0 (Empty)",
            "destination": f"Field {f['id'][:4]}",
            "path": path,
            "total_duration_sec": 60, # 60 seconds total round trip
            "current_segment": 0,
            "progress": 0.0,
            "speed": 0.05, 
            "delay_mins": 0,
            "delay_status": "On Time",
            "target_field_id": f["id"],
            "collected": False,
            "hub": h
        })

async def simulate_truck_movement():
    while True:
        try:
            if manager.active_connections:
                # Spawn new trucks if needed
                spawn_trucks()
                
                to_remove = []
                for t in TRUCKS:
                    path = t["path"]
                    idx = t["current_segment"]
                    
                    p1 = path[idx]
                    p2 = path[idx + 1]
                    
                    current_pos = interpolate_points(p1, p2, t["progress"])
                    heading = math.degrees(math.atan2(p2[1] - p1[1], p2[0] - p1[0]))
                    
                    # Update status based on segment
                    if idx == 0:
                        t["status"] = "En route to Collection"
                        t["tonnage"] = "0.0 (Empty)"
                    else:
                        t["status"] = "Returning to Base"
                        t["tonnage"] = "30.0 Tonnes"
                    
                    eta_mins = max(1, int(30 * (1.0 - t["progress"]))) if idx == 0 else max(1, int(30 * (1.0 - t["progress"])))
                    
                    try:
                        await manager.broadcast(json.dumps({
                            "type": "TRUCK_UPDATE",
                            "data": {
                                "truck_id": t["id"],
                                "position": current_pos,
                                "heading": heading,
                                "status": t["status"],
                                "color": t["color"],
                                "tonnage": t["tonnage"],
                                "destination": t["destination"],
                                "eta_mins": eta_mins,
                                "delay_status": t["delay_status"],
                                "delay_color": "emerald-600"
                            }
                        }))
                    except Exception:
                        pass
                    
                    t["progress"] += t["speed"]
                    if t["progress"] >= 1.0:
                        t["progress"] = 0.0
                        t["current_segment"] += 1
                        
                        # Reached field
                        if t["current_segment"] == 1 and not t["collected"]:
                            t["collected"] = True
                            complete_field(t["target_field_id"])
                            try:
                                await manager.broadcast(json.dumps({
                                    "type": "FIELD_COLLECTED",
                                    "data": {
                                        "field_id": t["target_field_id"],
                                        "truck_id": t["id"],
                                        "timestamp": "now",
                                        "new_status": "Completed"
                                    }
                                }))
                            except Exception:
                                pass
                            t["destination"] = t["hub"]["name"]
                            
                        # Reached origin
                        if t["current_segment"] >= len(path) - 1:
                            to_remove.append(t)
                            
                for t in to_remove:
                    TRUCKS.remove(t)
                    if t["target_field_id"] in ACTIVE_TARGETS:
                        ACTIVE_TARGETS.remove(t["target_field_id"])
                        
        except Exception as e:
            print(f"Error in simulate: {e}")
                        
        await asyncio.sleep(0.5)

@router.websocket("/tracking")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)
