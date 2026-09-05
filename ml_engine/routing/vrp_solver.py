import numpy as np
from typing import List, Dict
import math
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance in kilometers between two points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

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
    scaled_capacity = int(vehicle_capacity * 100)
    num_vehicles = max(1, math.ceil(total_demand / scaled_capacity) + 2) # Add some buffer vehicles
    
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
    Google OR-Tools solver for Capacitated Vehicle Routing Problem (CVRP).
    """
    if not pickup_stops:
        return []

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
        route_num = 8
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
                "code": f"Route #R-0{route_num}",
                "stops_count": len(route_stops),
                "tonnage": round(route_load, 1),
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
    routes = solve_capacitated_vrp(depot_plant, sample_stops, 10.0)
    print(f"Generated {len(routes)} optimal routes.")
    for r in routes:
        print(f"{r['code']}: {r['tonnage']} tonnes, {r['stops_count']} stops")
