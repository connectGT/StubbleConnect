from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import math

router = APIRouter(prefix="/ws", tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

def interpolate_points(p1, p2, fraction):
    """Interpolate between two [lat, lng] points."""
    lat = p1[0] + (p2[0] - p1[0]) * fraction
    lng = p1[1] + (p2[1] - p1[1]) * fraction
    return [lat, lng]

async def simulate_truck_movement():
    """Background task to simulate a truck moving along a route."""
    # A sample route path in Punjab
    route_path = [
        [30.211, 74.9455],
        [30.220, 74.9600],
        [30.235, 74.9800],
        [30.232, 75.0150] # Buyer location
    ]
    
    current_segment = 0
    progress = 0.0
    speed = 0.05 # Progress per tick
    
    while True:
        if manager.active_connections:
            p1 = route_path[current_segment]
            p2 = route_path[current_segment + 1]
            
            current_pos = interpolate_points(p1, p2, progress)
            
            await manager.broadcast(json.dumps({
                "type": "TRUCK_UPDATE",
                "data": {
                    "truck_id": "TRK-9901",
                    "position": current_pos,
                    "heading": math.degrees(math.atan2(p2[1] - p1[1], p2[0] - p1[0]))
                }
            }))
            
            progress += speed
            if progress >= 1.0:
                progress = 0.0
                current_segment += 1
                if current_segment >= len(route_path) - 1:
                    current_segment = 0 # Loop back for demo
                    
        await asyncio.sleep(1.0) # 1 update per second

@router.websocket("/tracking")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Client can send commands if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)
