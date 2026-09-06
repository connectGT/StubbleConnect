from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Farmer, Field
from app.schemas.schemas import FarmerRegisterRequest, FarmerLoginRequest, FarmerProfileResponse
from sqlalchemy import func
import random
import uuid
from datetime import date

router = APIRouter(prefix="/farmers", tags=["Farmers"])

def generate_fpo_id(db: Session = None):
    for _ in range(50):
        fpo = f"#{random.randint(88000, 88999)}"
        if db is not None:
            if not db.query(Farmer).filter(Farmer.fpo_id == fpo).first():
                return fpo
        else:
            return fpo
    return f"#{random.randint(10000, 99999)}"

def field_status(harvest_date_str: str) -> tuple:
    """Return (status_label, status_color) based on harvest_date vs today."""
    try:
        from datetime import datetime
        hd = datetime.strptime(harvest_date_str, "%Y-%m-%d").date()
        today = date.today()
        days_diff = (hd - today).days
        if days_diff < 0:
            return "Sold & Paid", "emerald"
        elif days_diff <= 3:
            return "Pickup Scheduled", "amber"
        else:
            return "Registered", "blue"
    except:
        return "Registered", "blue"

def build_farmer_profile(farmer: Farmer, db: Session) -> dict:
    """Build the complete farmer profile dict including their fields."""
    # Get fields by phone
    fields_query = db.query(
        Field,
        func.ST_Y(Field.geom).label('lat'),
        func.ST_X(Field.geom).label('lng')
    ).filter(Field.phone == farmer.phone).all()
    
    fields_data = []
    total_biomass = 0.0
    total_earnings = 0.0
    
    for i, (f, lat, lng) in enumerate(fields_query):
        if f.status == "Completed":
            status = "Completed"
            color = "emerald"
        else:
            status, color = field_status(f.harvest_date or "")
        biomass = f.biomass or round((f.acres or 0) * 2.5, 1)
        total_biomass += biomass if (status == "Completed" or status == "Sold & Paid") else 0
        total_earnings += biomass * 2500 if (status == "Completed" or status == "Sold & Paid") else 0
        fields_data.append({
            "id": f.id,
            "name": f"Farm {chr(65+i)}",  # Farm A, Farm B, Farm C...
            "location": f.village or farmer.village,
            "acres": f.acres or 0,
            "crop_type": f.crop_type or "Paddy / Basmati",
            "harvest_date": f.harvest_date or "",
            "biomass_est": biomass,
            "status": status,
            "status_color": color,
        })
    
    return {
        "id": farmer.id,
        "name": farmer.name,
        "phone": farmer.phone,
        "village": farmer.village,
        "district": farmer.district,
        "fpo_id": farmer.fpo_id or generate_fpo_id(db),
        "tier": farmer.tier or "Green",
        "joined_date": farmer.joined_date or str(date.today()),
        "total_biomass_sold": round(total_biomass, 1),
        "total_earnings": round(total_earnings, 0),
        "fields": fields_data,
    }

def normalize_phone(p: str) -> str:
    cp = p.replace("+91", "").replace(" ", "").replace("-", "").strip()
    if len(cp) > 10 and cp.startswith("91"):
        cp = cp[2:]
    return cp

@router.post("/register")
def register_farmer(payload: FarmerRegisterRequest, db: Session = Depends(get_db)):
    clean_phone = normalize_phone(payload.phone)
    # Check if farmer already exists
    existing = db.query(Farmer).filter(Farmer.phone == clean_phone).first()
    if existing:
        # Return existing profile instead of error
        profile = build_farmer_profile(existing, db)
        return {"status": "existing", "message": "Farmer already registered. Logging you in.", "data": profile}
    
    new_farmer = Farmer(
        name=payload.name,
        phone=clean_phone,
        village=payload.village,
        district=payload.district,
        state=payload.state,
        fpo_id=generate_fpo_id(db),
        tier="Green",
        joined_date=str(date.today()),
        is_verified=True,
        total_biomass_sold=0.0,
        total_earnings=0.0,
    )
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    
    profile = build_farmer_profile(new_farmer, db)
    return {"status": "success", "message": "Registration successful!", "data": profile}

@router.post("/send-otp")
def send_otp(phone: str, db: Session = Depends(get_db)):
    """Simulate OTP send. In production, integrate Twilio/MSG91."""
    clean_phone = normalize_phone(phone)
    farmer = db.query(Farmer).filter(Farmer.phone == clean_phone).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Phone number not registered. Please sign up first.")
    # For demo: OTP is always 123456
    return {"status": "sent", "message": f"OTP sent to +91{clean_phone}", "demo_otp": "123456"}

@router.post("/verify-otp")
def verify_otp(payload: FarmerLoginRequest, db: Session = Depends(get_db)):
    """Verify OTP and return farmer profile. Demo: any 6-digit OTP works."""
    if len(payload.otp) != 6 or not payload.otp.isdigit():
        raise HTTPException(status_code=400, detail="OTP must be 6 digits")
    
    clean_phone = normalize_phone(payload.phone)
    farmer = db.query(Farmer).filter(Farmer.phone == clean_phone).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Phone not registered. Please sign up first.")
    
    profile = build_farmer_profile(farmer, db)
    return {"status": "success", "message": "Login successful!", "data": profile}

@router.get("/me")
def get_farmer_profile(phone: str, db: Session = Depends(get_db)):
    """Get farmer profile and their registered fields by phone number."""
    clean_phone = normalize_phone(phone)
    farmer = db.query(Farmer).filter(Farmer.phone == clean_phone).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    profile = build_farmer_profile(farmer, db)
    return {"status": "success", "data": profile}

@router.get("/")
def list_farmers(db: Session = Depends(get_db)):
    """Admin: list all registered farmers."""
    farmers = db.query(Farmer).all()
    return {
        "status": "success",
        "count": len(farmers),
        "data": [{"id": f.id, "name": f.name, "phone": f.phone, "village": f.village, "tier": f.tier, "joined_date": f.joined_date} for f in farmers]
    }
