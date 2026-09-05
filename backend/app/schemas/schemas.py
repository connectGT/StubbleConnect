from pydantic import BaseModel, Field
from typing import List, Optional

class FieldRegisterRequest(BaseModel):
    farmer_name: str
    phone: str
    village: str
    district: str = "Bathinda"
    state: str = "Punjab"
    acres: float
    crop_type: str = "Paddy / Basmati"
    harvest_date: str
    latitude: float
    longitude: float
    status: Optional[str] = "Pending"

class BuyerRegisterRequest(BaseModel):
    plant_name: str
    facility_type: str
    daily_capacity_tonnes: float
    current_stored_tonnes: float = 0.0
    location: str
    latitude: float
    longitude: float
    contact: str

class ClusterResponse(BaseModel):
    id: str
    number: int
    name: str
    risk_level: str
    risk_score: int
    farms_count: int
    total_biomass: float
    harvest_window: str
    avg_distance: str
    nearest_buyer: str
    buyer_location: str
    status: str
    center: List[float]
    polygon: List[List[float]]
    recommended_action: str

class RouteResponse(BaseModel):
    id: str
    code: str
    cluster: str
    buyer: str
    buyer_location: str
    stops: int
    tonnage: float
    status: str
    path: List[List[float]]

class DashboardStatsResponse(BaseModel):
    total_fields: int
    total_biomass_tonnes: float
    active_clusters: int
    matched_clusters: int
    routes_planned: int
    high_risk_areas: int

class FarmerRegisterRequest(BaseModel):
    name: str
    phone: str
    village: str
    district: str = "Bathinda"
    state: str = "Punjab"

class FarmerLoginRequest(BaseModel):
    phone: str
    otp: str

class FarmerFieldResponse(BaseModel):
    id: str
    name: str
    location: str
    acres: float
    crop_type: str
    harvest_date: str
    biomass_est: float
    status: str
    status_color: str

class FarmerProfileResponse(BaseModel):
    id: str
    name: str
    phone: str
    village: str
    district: str
    fpo_id: str
    tier: str
    joined_date: str
    total_biomass_sold: float
    total_earnings: float
    fields: List[FarmerFieldResponse]
