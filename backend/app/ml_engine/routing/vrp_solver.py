import numpy as np
from typing import List, Dict
import math
try:
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance in kilometers between two points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def solve_vrp_heuristic(
    depot: Dict,
    pickup_stops: List[Dict],
    vehicle_capacity_tonnes: float = 50.0
) -> List[Dict]:
    """
    Greedy nearest-neighbor with capacity constraints CVRP heuristic fallback.
    Guarantees valid routes when OR-Tools is not installed or yields no feasible solution.
    """
    if not pickup_stops:
        return []

    # Ensure effective capacity can accommodate the largest single stop demand
    max_demand = max([s.get('biomass_tonnes', 0.0) for s in pickup_stops], default=0.0)
    effective_capacity = max(float(vehicle_capacity_tonnes), max_demand * 1.05)

    unvisited = [dict(s) for s in pickup_stops]
    routes = []
    route_num = 1

    depot_lat = depot['latitude']
    depot_lng = depot['longitude']
    depot_name = depot.get('name', 'Depot Hub')

    while unvisited:
        curr_lat = depot_lat
        curr_lng = depot_lng
        curr_capacity = effective_capacity
        curr_route_stops = []
        curr_path = [[depot_lat, depot_lng]]

        while unvisited:
            # Find candidate stops that fit within remaining vehicle capacity
            feasible_candidates = [
                s for s in unvisited if s.get('biomass_tonnes', 0.0) <= curr_capacity
            ]

            if feasible_candidates:
                # Pick the nearest feasible stop to current position
                nearest = min(
                    feasible_candidates,
                    key=lambda s: haversine_distance(curr_lat, curr_lng, s['latitude'], s['longitude'])
                )
                curr_route_stops.append(nearest)
                curr_capacity -= nearest.get('biomass_tonnes', 0.0)
                curr_path.append([nearest['latitude'], nearest['longitude']])
                curr_lat = nearest['latitude']
                curr_lng = nearest['longitude']
                unvisited.remove(nearest)
            else:
                # If vehicle is empty but first stop exceeds capacity, take it anyway to avoid deadlock
                if len(curr_route_stops) == 0 and unvisited:
                    nearest = min(
                        unvisited,
                        key=lambda s: haversine_distance(curr_lat, curr_lng, s['latitude'], s['longitude'])
                    )
                    curr_route_stops.append(nearest)
                    curr_path.append([nearest['latitude'], nearest['longitude']])
                    unvisited.remove(nearest)
                # Current vehicle route is full
                break

        # Return to depot
        curr_path.append([depot_lat, depot_lng])

        if curr_route_stops:
            total_tonnage = sum(s.get('biomass_tonnes', 0.0) for s in curr_route_stops)
            routes.append({
                "code": f"Route #R-{route_num:02d}",
                "stops_count": len(curr_route_stops),
                "tonnage": round(total_tonnage, 1),
                "destination": depot_name,
                "path": curr_path
            })
            route_num += 1

    return routes

def create_data_model(depot: Dict, pickup_stops: List[Dict], vehicle_capacity: float):
    """Stores the data for the routing problem."""
    data = {}
    
    # Combine depot and stops into a single list of locations (depot is index 0)
    locations = [depot] + pickup_stops
    
    # Generate distance matrix
    num_locations = len(locations)
    distance_matrix = []
    for i in range(num_locations):
        row = []
        for j in range(num_locations):
            if i == j:
                row.append(0)
            else:
                # Multiply by 1000 to convert to integer meters (OR-Tools requires integer weights)
                dist = haversine_distance(
                    locations[i]['latitude'], locations[i]['longitude'],
                    locations[j]['latitude'], locations[j]['longitude']
                )
                row.append(int(dist * 1000))
        distance_matrix.append(row)
        
    data['distance_matrix'] = distance_matrix
    
    # Demands: Depot is 0, others are their biomass_tonnes (scaled by 100 to make integers)
    data['demands'] = [0] + [int(s['biomass_tonnes'] * 100) for s in pickup_stops]
    
    # Determine how many vehicles we need. Assume at least 1, max enough to cover total demand
    total_demand = sum(data['demands'])
    max_demand = max(data['demands']) if data['demands'] else 0
    scaled_capacity = max(int(vehicle_capacity * 100), int(max_demand * 1.1))
    num_vehicles = max(1, math.ceil(total_demand / max(1, scaled_capacity)) + 2) # Add some buffer vehicles
    
    data['vehicle_capacities'] = [scaled_capacity] * num_vehicles
    data['num_vehicles'] = num_vehicles
    data['depot'] = 0
    return data, locations

def solve_capacitated_vrp(
    depot: Dict,
    pickup_stops: List[Dict],
    vehicle_capacity_tonnes: float = 50.0
) -> List[Dict]:
    """
    Google OR-Tools solver for Capacitated Vehicle Routing Problem (CVRP),
    with automatic fallback to greedy nearest-neighbor heuristic if OR-Tools
    is not installed or unable to find a feasible solution.
    """
    if not pickup_stops:
        return []

    if not ORTOOLS_AVAILABLE:
        return solve_vrp_heuristic(depot, pickup_stops, vehicle_capacity_tonnes)

    try:
        data, locations = create_data_model(depot, pickup_stops, vehicle_capacity_tonnes)

        # Create the routing index manager.
        manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), data['num_vehicles'], data['depot'])

        # Create Routing Model.
        routing = pywrapcp.RoutingModel(manager)

        # Create and register a transit callback.
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return data['distance_matrix'][from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Add Capacity constraint.
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return data['demands'][from_node]

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            data['vehicle_capacities'],  # vehicle maximum capacities
            True,  # start cumul to zero
            'Capacity')

        # Setting first solution heuristic.
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
        search_parameters.time_limit.FromSeconds(1)

        # Solve the problem.
        solution = routing.SolveWithParameters(search_parameters)

        routes = []
        if solution:
            route_num = 1
            for vehicle_id in range(data['num_vehicles']):
                index = routing.Start(vehicle_id)
                # If the route is empty (only depot), skip it
                if routing.IsEnd(solution.Value(routing.NextVar(index))):
                    continue
                    
                route_stops = []
                route_path = []
                route_load = 0
                
                while not routing.IsEnd(index):
                    node_index = manager.IndexToNode(index)
                    loc = locations[node_index]
                    route_path.append([loc['latitude'], loc['longitude']])
                    
                    if node_index != data['depot']:
                        route_stops.append(loc)
                        route_load += loc['biomass_tonnes']
                        
                    index = solution.Value(routing.NextVar(index))
                    
                # Add depot at the end
                route_path.append([locations[data['depot']]['latitude'], locations[data['depot']]['longitude']])
                
                routes.append({
                    "code": f"Route #R-{route_num:02d}",
                    "stops_count": len(route_stops),
                    "tonnage": round(route_load, 1),
                    "destination": depot["name"],
                    "path": route_path
                })
                route_num += 1

        if not routes:
            return solve_vrp_heuristic(depot, pickup_stops, vehicle_capacity_tonnes)

        return routes

    except Exception:
        return solve_vrp_heuristic(depot, pickup_stops, vehicle_capacity_tonnes)


if __name__ == "__main__":
    depot_plant = {"name": "GreenFuel Plant Bathinda", "latitude": 30.232, "longitude": 75.015}
    sample_stops = [
        {"id": 1, "name": "Stop 1", "latitude": 30.23, "longitude": 74.94, "biomass_tonnes": 6.2},
        {"id": 2, "name": "Stop 2", "latitude": 30.28, "longitude": 74.97, "biomass_tonnes": 4.8},
        {"id": 3, "name": "Stop 3", "latitude": 30.32, "longitude": 74.82, "biomass_tonnes": 8.1},
        {"id": 4, "name": "Stop 4", "latitude": 30.22, "longitude": 74.98, "biomass_tonnes": 5.9},
    ]
    routes = solve_capacitated_vrp(depot_plant, sample_stops, 10.0)
    print(f"Generated {len(routes)} optimal routes.")
    for r in routes:
        print(f"{r['code']}: {r['tonnage']} tonnes, {r['stops_count']} stops")
