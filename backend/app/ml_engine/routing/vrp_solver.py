import numpy as np
from typing import List, Dict

def solve_capacitated_vrp(
    depot: Dict,
    pickup_stops: List[Dict],
    vehicle_capacity_tonnes: float = 50.0
) -> List[Dict]:
    """
    Greedy Nearest-Neighbor heuristic solver for Capacitated Vehicle Routing Problem (CVRP)
    for heavy biomass transport trailers.
    """
    unvisited = pickup_stops.copy()
    routes = []
    route_num = 8

    while unvisited:
        current_loc = depot
        current_load = 0.0
        route_stops = []
        route_path = [[depot["latitude"], depot["longitude"]]]

        while unvisited:
            candidates = [s for s in unvisited if current_load + s["biomass_tonnes"] <= vehicle_capacity_tonnes]
            if not candidates:
                if current_load == 0.0:
                    # If even an empty vehicle can't fit the stop, just pick the smallest one and exceed capacity
                    # to prevent infinite loop.
                    candidates = [min(unvisited, key=lambda s: s["biomass_tonnes"])]
                else:
                    break

            nearest_stop = min(
                candidates,
                key=lambda s: np.hypot(s["latitude"] - current_loc["latitude"], s["longitude"] - current_loc["longitude"])
            )

            current_load += nearest_stop["biomass_tonnes"]
            route_stops.append(nearest_stop)
            route_path.append([nearest_stop["latitude"], nearest_stop["longitude"]])
            current_loc = nearest_stop
            unvisited.remove(nearest_stop)

        # Return to depot
        route_path.append([depot["latitude"], depot["longitude"]])
        routes.append({
            "code": f"Route #R-0{route_num}",
            "stops_count": len(route_stops),
            "tonnage": round(current_load, 1),
            "destination": depot["name"],
            "path": route_path
        })
        route_num += 1

    return routes

if __name__ == "__main__":
    depot_plant = {"name": "GreenFuel Plant Bathinda", "latitude": 30.232, "longitude": 75.015}
    sample_stops = [
        {"id": 1, "name": "Stop 1", "latitude": 30.23, "longitude": 74.94, "biomass_tonnes": 6.2},
        {"id": 2, "name": "Stop 2", "latitude": 30.28, "longitude": 74.97, "biomass_tonnes": 4.8},
        {"id": 3, "name": "Stop 3", "latitude": 30.32, "longitude": 74.82, "biomass_tonnes": 8.1},
        {"id": 4, "name": "Stop 4", "latitude": 30.22, "longitude": 74.98, "biomass_tonnes": 5.9},
    ]
    routes = solve_capacitated_vrp(depot_plant, sample_stops)
    print(f"Generated {len(routes)} optimal routes.")
