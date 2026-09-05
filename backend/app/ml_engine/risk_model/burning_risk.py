import math
from datetime import datetime

def calculate_burning_risk_score(
    hours_to_wheat_sowing_deadline: float,
    current_temperature_c: float,
    wind_speed_kmh: float,
    buyer_distance_km: float,
    is_route_assigned: bool
) -> dict:
    """
    Computes Stubble Burning Risk Score (0 - 100) using multi-factor penalty model.
    Factors:
    1. Harvest-to-Sowing Window Urgency (0-5 days tight window) -> 45% weight
    2. Atmospheric & Weather conditions (High heat/dry wind)     -> 20% weight
    3. Logistics Distance to Offtaker                          -> 15% weight
    4. Route Dispatch Status (Unassigned adds severe penalty)   -> 20% weight
    """
    # 1. Window urgency factor (<= 48 hours = highest risk)
    if hours_to_wheat_sowing_deadline <= 24:
        window_penalty = 45.0
    elif hours_to_wheat_sowing_deadline <= 48:
        window_penalty = 38.0
    elif hours_to_wheat_sowing_deadline <= 96:
        window_penalty = 25.0
    else:
        window_penalty = 10.0

    # 2. Weather factor (Heat index & dryness)
    weather_score = min(20.0, (current_temperature_c / 40.0) * 12.0 + (wind_speed_kmh / 30.0) * 8.0)

    # 3. Distance penalty
    dist_penalty = min(15.0, (buyer_distance_km / 30.0) * 15.0)

    # 4. Route assignment mitigation
    logistics_penalty = 0.0 if is_route_assigned else 20.0

    total_score = min(100, int(round(window_penalty + weather_score + dist_penalty + logistics_penalty)))

    if total_score >= 75:
        level = "High Risk"
        action = "Priority collection suggested due to high burning risk."
    elif total_score >= 45:
        level = "Moderate Risk"
        action = "Standard collection route scheduled for morning batch."
    else:
        level = "Low Risk"
        action = "Harvest window clear. Normal queue dispatch."

    return {
        "risk_score": total_score,
        "risk_level": level,
        "recommended_action": action
    }

if __name__ == "__main__":
    result = calculate_burning_risk_score(
        hours_to_wheat_sowing_deadline=36,
        current_temperature_c=32,
        wind_speed_kmh=14,
        buyer_distance_km=14.2,
        is_route_assigned=True
    )
    print(f"Computed Risk: {result}")
