from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Field(Base):
    __tablename__ = "fields"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    farmer_name = Column(String, index=True)
    phone = Column(String)
    village = Column(String)
    district = Column(String)
    state = Column(String)
    acres = Column(Float)
    crop_type = Column(String)
    harvest_date = Column(String)
    biomass = Column(Float)
    cluster_id = Column(String, ForeignKey("clusters.id"), nullable=True)
    
    # PostGIS point for location
    geom = Column(Geometry("POINT", srid=4326))

    cluster = relationship("Cluster", back_populates="fields")

class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    number = Column(Integer)
    name = Column(String)
    risk_level = Column(String)
    risk_score = Column(Integer)
    farms_count = Column(Integer)
    total_biomass = Column(Float)
    harvest_window = Column(String)
    avg_distance = Column(String)
    status = Column(String)
    buyer_location = Column(String, nullable=True)
    
    # PostGIS geometries
    center_geom = Column(Geometry("POINT", srid=4326))
    polygon_geom = Column(Geometry("POLYGON", srid=4326))
    
    recommended_action = Column(String)

    fields = relationship("Field", back_populates="cluster")
    
class Buyer(Base):
    __tablename__ = "buyers"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    plant_name = Column(String)
    facility_type = Column(String)
    daily_capacity_tonnes = Column(Float)
    current_stored_tonnes = Column(Float, default=0.0)
    location = Column(String)
    contact = Column(String)
    
    geom = Column(Geometry("POINT", srid=4326))

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    code = Column(String)
    cluster_id = Column(String)
    buyer_id = Column(String)
    stops = Column(Integer)
    tonnage = Column(Float)
    status = Column(String)
    
    path_coords = Column(JSON)

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    village = Column(String, nullable=False)
    district = Column(String, default="Bathinda")
    state = Column(String, default="Punjab")
    fpo_id = Column(String, unique=True)
    tier = Column(String, default="Green")
    joined_date = Column(String)
    is_verified = Column(Boolean, default=True)
    total_biomass_sold = Column(Float, default=0.0)
    total_earnings = Column(Float, default=0.0)
