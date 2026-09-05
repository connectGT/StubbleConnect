from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import math
from pathlib import Path

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

import os
# Try to find route_coords.json in backend directory or project root
_route_file = Path(__file__).parents[4] / 'route_coords.json'
if not _route_file.exists():
    _route_file = Path(__file__).parents[5] / 'route_coords.json'
if not _route_file.exists():
    _route_file = Path('/app/route_coords.json')
with open(_route_file, 'r') as f:
    real_routes = json.load(f)

TRUCKS = [
    {
        "id": "TRK-201",
        "status": "En route to Collection",
        "color": "#eab308", 
        "tonnage": "0.0 (Empty)",
        "destination": "Cluster #12 Fields",
        "path": real_routes["TRK-201"]["path"],
        "total_duration_sec": real_routes["TRK-201"]["duration"],
        "current_segment": 0,
        "progress": 0.0,
        "speed": 0.05,  # smooth normal speed
        "delay_mins": 0,
        "delay_status": "On Time"
    },
    {
        "id": "TRK-405",
        "status": "Transporting Biomass",
        "color": "#22c55e",
        "tonnage": "32.5 Tonnes",
        "destination": "GreenFuel Plant",
        "path": real_routes["TRK-405"]["path"],
        "total_duration_sec": real_routes["TRK-405"]["duration"],
        "current_segment": int(len(real_routes["TRK-405"]["path"]) * 0.2), # start 20% in
        "progress": 0.0,
        "speed": 0.06,
        "delay_mins": 14,
        "delay_status": "14 mins late (Traffic)"
    },
    {
        "id": "TRK-708",
        "status": "Returning to Base",
        "color": "#64748b",
        "tonnage": "0.0 (Empty)",
        "destination": "Logistics Hub",
        "path": real_routes["TRK-708"]["path"],
        "total_duration_sec": real_routes["TRK-708"]["duration"],
        "current_segment": int(len(real_routes["TRK-708"]["path"]) * 0.7),
        "progress": 0.0,
        "speed": 0.05,
        "delay_mins": 0,
        "delay_status": "On Time"
    },
    {
        "id": "TRK-112",
        "status": "Transporting Biomass",
        "color": "#ef4444",
        "tonnage": "45.0 Tonnes",
        "destination": "EcoHeat Ludhiana",
        "path": real_routes["TRK-201"]["path"][::-1], # Reverse path
        "total_duration_sec": real_routes["TRK-201"]["duration"],
        "current_segment": int(len(real_routes["TRK-201"]["path"]) * 0.4),
        "progress": 0.0,
        "speed": 0.07,
        "delay_mins": 0,
        "delay_status": "On Time"
    },
    {
        "id": "TRK-990",
        "status": "En route to Collection",
        "color": "#8b5cf6",
        "tonnage": "0.0 (Empty)",
        "destination": "Cluster #03 Fields",
        "path": real_routes["TRK-405"]["path"][::-1],
        "total_duration_sec": real_routes["TRK-405"]["duration"],
        "current_segment": int(len(real_routes["TRK-405"]["path"]) * 0.1),
        "progress": 0.0,
        "speed": 0.04,
        "delay_mins": 0,
        "delay_status": "On Time"
    },
    {
        "id": "TRK-334",
        "status": "Transporting Biomass",
        "color": "#f97316",
        "tonnage": "28.5 Tonnes",
        "destination": "AgriPower Moga",
        "path": real_routes["TRK-708"]["path"],
        "total_duration_sec": real_routes["TRK-708"]["duration"],
        "current_segment": int(len(real_routes["TRK-708"]["path"]) * 0.85),
        "progress": 0.0,
        "speed": 0.05,
        "delay_mins": 5,
        "delay_status": "5 mins late (Loading)"
    }
]

async def simulate_truck_movement():
    while True:
        try:
            if manager.active_connections:
                for t in TRUCKS:
                    path = t["path"]
                    idx = t["current_segment"]
                    
                    if idx >= len(path) - 1:
                        t["current_segment"] = 0
                        idx = 0
                        
                    p1 = path[idx]
                    p2 = path[idx + 1]
                    
                    current_pos = interpolate_points(p1, p2, t["progress"])
                    heading = math.degrees(math.atan2(p2[1] - p1[1], p2[0] - p1[0]))
                    
                    # Calculate ETA based on remaining segments
                    total_segs = len(path)
                    rem_segs = total_segs - idx
                    pct_left = rem_segs / total_segs if total_segs > 0 else 0
                    sec_left = int(t["total_duration_sec"] * pct_left)
                    eta_mins = max(1, sec_left // 60)
                    
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
                                "delay_color": "red-600" if t["delay_mins"] > 0 else "emerald-600"
                            }
                        }))
                    except Exception:
                        pass
                    
                    t["progress"] += t["speed"]
                    if t["progress"] >= 1.0:
                        t["progress"] = 0.0
                        t["current_segment"] += 1
        except Exception:
            pass
                        
        await asyncio.sleep(0.5)

@router.websocket("/tracking")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)
