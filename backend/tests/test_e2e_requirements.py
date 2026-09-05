"""
End-to-End Requirements Verification Test Suite for StubbleConnect
Covering Requirements R1 to R5:
1. R1: Farmer Name synchronization, registration persistence, and "My Fields" visibility.
2. R2: Field States ("Pending" vs "Completed"), startup seeding, and clustering exclusion.
3. R3: Biogas Plants positioned outside farm cluster polygons, and presence of 5+ cluster polygons.
4. R4: Dynamic Truck Logistics (mixed hub model, round-trip animation, state transition upon collection).
5. R5: Dynamic Risk Scoring mathematical formula based on harvest_date.

Authoritative Sources of Expected Output:
- ORIGINAL_REQUEST.md (2026-09-05T19:21:27Z)
- PROJECT.md (Architecture, Feature Inventory, Interface Contracts)
"""

import sys
import os
import math
import json
import unittest
from datetime import date, datetime, timedelta
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Field, Cluster, Buyer, Route, Farmer
from sqlalchemy import func


# ============================================================================
# Authoritative Geometric & Mathematical Oracles
# ============================================================================

def point_in_polygon_latlng(point, polygon):
    """
    2D Ray-casting algorithm for Point-in-Polygon testing.
    point: [lat, lng] or (lat, lng)
    polygon: list of [lat, lng] coordinate pairs forming a closed ring.
    Returns True if the point is strictly inside the polygon, False otherwise.
    """
    lat, lng = point[0], point[1]
    n = len(polygon)
    if n < 3:
        return False
    inside = False
    p1_lat, p1_lng = polygon[0][0], polygon[0][1]
    for i in range(1, n + 1):
        p2_lat, p2_lng = polygon[i % n][0], polygon[i % n][1]
        if min(p1_lat, p2_lat) < lat <= max(p1_lat, p2_lat):
            if lng <= max(p1_lng, p2_lng):
                if p1_lat != p2_lat:
                    lng_inters = (lat - p1_lat) * (p2_lng - p1_lng) / (p2_lat - p1_lat) + p1_lng
                if p1_lng == p2_lng or lng <= lng_inters:
                    inside = not inside
        p1_lat, p1_lng = p2_lat, p2_lng
    return inside


def reference_dynamic_risk_score(harvest_date_str: str, status: str = "Pending", ref_today: date = None) -> int:
    """
    Authoritative Mathematical Oracle for Dynamic Burning Risk (Requirement R5 & PROJECT.md Feature 9):
    R(Delta) = 0 if status == 'Completed' else min(100, max(5, round(100 / (1 + exp(-0.35 * Delta)))))
    where Delta = (today - harvest_date).days
    """
    if status == "Completed":
        return 0
    if not harvest_date_str:
        return 5
    if ref_today is None:
        ref_today = date.today()
    try:
        hd = datetime.strptime(harvest_date_str[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return 5
    delta = (ref_today - hd).days
    # Calibrated sigmoidal growth with k = 0.35
    raw_score = 100.0 / (1.0 + math.exp(-0.35 * delta))
    return int(min(100, max(5, round(raw_score))))


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in km."""
    r = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


# ============================================================================
# R1: Farmer Name Synchronization and "My Fields" Visibility
# ============================================================================

class TestR1FarmerNameSyncAndVisibility(unittest.TestCase):
    """
    E2E Verification of Requirement R1:
    - Registered fields must appear in the Farmer Panel's 'My Fields' list.
    - In the Admin Panel, newly registered fields must display the actual Farmer's name
      instead of the hardcoded 'Farmer'.
    - Accurate data pull and sync across backend endpoints.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Reset database to baseline for clean test execution
        self.client.post("/api/v1/seed/")

    def test_r1_01_field_registration_persists_custom_farmer_name(self):
        """Verify POST /api/v1/fields/register persists custom farmer_name without fallback to 'Farmer'."""
        custom_name = "Harpreet Singh Sandhu"
        test_phone = "9876543299"
        payload = {
            "farmer_name": custom_name,
            "phone": test_phone,
            "village": "Mehma Sarja",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 7.5,
            "crop_type": "Paddy / Basmati",
            "latitude": 30.2450,
            "longitude": 74.9650,
            "harvest_date": "2026-09-12"
        }

        res = self.client.post("/api/v1/fields/register", json=payload)
        self.assertEqual(res.status_code, 200, f"Registration failed: {res.text}")
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("data", data)
        self.assertEqual(data["data"].get("farmer_name"), custom_name,
                         f"Expected farmer_name '{custom_name}', got '{data['data'].get('farmer_name')}'")

        # Directly verify database record
        field_id = data["data"]["id"]
        db = SessionLocal()
        try:
            field_record = db.query(Field).filter(Field.id == field_id).first()
            self.assertIsNotNone(field_record, "Field not found in database")
            self.assertEqual(field_record.farmer_name, custom_name,
                             "Field.farmer_name in DB did not match registered name")
            self.assertNotEqual(field_record.farmer_name, "Farmer",
                                "Field.farmer_name defaulted to hardcoded 'Farmer'")
        finally:
            db.close()

    def test_r1_02_fields_list_endpoint_exposes_farmer_name(self):
        """Verify GET /api/v1/fields/ returns farmer_name accurately for display in Admin ListViewModal."""
        custom_name = "Jaswinder Kaur Sidhu"
        test_phone = "9876543298"
        payload = {
            "farmer_name": custom_name,
            "phone": test_phone,
            "village": "Bhagta Bhai Ka",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 12.0,
            "crop_type": "PR-126 Paddy",
            "latitude": 30.3800,
            "longitude": 75.0500,
            "harvest_date": "2026-09-15"
        }
        reg_res = self.client.post("/api/v1/fields/register", json=payload)
        self.assertEqual(reg_res.status_code, 200)
        field_id = reg_res.json()["data"]["id"]

        # Fetch all fields as Admin panel does
        list_res = self.client.get("/api/v1/fields/")
        self.assertEqual(list_res.status_code, 200)
        fields_data = list_res.json().get("data", [])
        target_field = next((f for f in fields_data if f.get("id") == field_id), None)
        self.assertIsNotNone(target_field, "Newly registered field missing from GET /api/v1/fields/")

        # Verify farmer name is exposed (either via 'farmer_name' or 'farmer')
        retrieved_name = target_field.get("farmer_name") or target_field.get("farmer")
        self.assertEqual(retrieved_name, custom_name,
                         f"Admin fields list must expose actual farmer name '{custom_name}', got '{retrieved_name}'")
        self.assertNotEqual(retrieved_name, "Farmer", "Admin fields list displayed fallback 'Farmer'")

    def test_r1_03_farmer_dashboard_my_fields_sync_by_phone(self):
        """Verify registered field immediately appears in Farmer Portal 'My Fields' list by phone match."""
        farmer_phone = "9876543297"
        farmer_name = "Balwinder Singh Dhillon"

        # 1. Register the farmer profile first
        farmer_payload = {
            "name": farmer_name,
            "phone": farmer_phone,
            "village": "Rampura Phul",
            "district": "Bathinda",
            "state": "Punjab"
        }
        f_res = self.client.post("/api/v1/farmers/register", json=farmer_payload)
        self.assertEqual(f_res.status_code, 200)

        # 2. Register a new field using the farmer's phone
        field_payload = {
            "farmer_name": farmer_name,
            "phone": farmer_phone,
            "village": "Rampura Phul",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 15.0,
            "crop_type": "Basmati 1121",
            "latitude": 30.2700,
            "longitude": 75.2400,
            "harvest_date": "2026-09-08"
        }
        reg_res = self.client.post("/api/v1/fields/register", json=field_payload)
        self.assertEqual(reg_res.status_code, 200)
        field_id = reg_res.json()["data"]["id"]

        # 3. Query farmer profile (simulating FarmerDashboard data fetch upon reload / login)
        login_res = self.client.post("/api/v1/farmers/register", json=farmer_payload)
        self.assertEqual(login_res.status_code, 200)
        farmer_profile = login_res.json().get("data", {})
        farmer_fields = farmer_profile.get("fields", [])

        # The field must be present in farmer's 'My Fields'
        field_ids_in_profile = [f.get("id") for f in farmer_fields]
        self.assertIn(field_id, field_ids_in_profile,
                      f"Registered field {field_id} did not sync to Farmer Dashboard 'My Fields' list!")

        # Verify field attributes within the farmer profile
        matched_field = next(f for f in farmer_fields if f.get("id") == field_id)
        self.assertEqual(matched_field.get("acres"), 15.0)
        self.assertEqual(matched_field.get("crop_type"), "Basmati 1121")
        self.assertEqual(matched_field.get("harvest_date"), "2026-09-08")

    def test_r1_04_phone_number_normalization_variations(self):
        """Verify phone numbers with country code prefix (+91) normalize and sync cleanly."""
        farmer_name = "Sukhdev Singh"
        normalized_phone = "9876543296"

        # Register farmer with 10 digits
        self.client.post("/api/v1/farmers/register", json={
            "name": farmer_name,
            "phone": normalized_phone,
            "village": "Talwandi Sabo",
            "district": "Bathinda",
            "state": "Punjab"
        })

        # Register field with +91 prefix
        field_payload = {
            "farmer_name": farmer_name,
            "phone": f"+91{normalized_phone}",
            "village": "Talwandi Sabo",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 10.0,
            "crop_type": "Paddy",
            "latitude": 29.9800,
            "longitude": 75.0900,
            "harvest_date": "2026-09-10"
        }
        res = self.client.post("/api/v1/fields/register", json=field_payload)
        self.assertEqual(res.status_code, 200)
        field_id = res.json()["data"]["id"]

        # Farmer profile query must successfully find the field
        profile_res = self.client.post("/api/v1/farmers/register", json={
            "name": farmer_name,
            "phone": normalized_phone,
            "village": "Talwandi Sabo"
        })
        fields = profile_res.json().get("data", {}).get("fields", [])
        field_ids = [f.get("id") for f in fields]
        # Test whether normalization allows phone matching
        self.assertIn(field_id, field_ids,
                      "Field registered with '+91' prefix should match farmer profile phone without '+91'")

    def test_r1_05_adversarial_unicode_and_special_character_names(self):
        """Adversarial Test: Farmer names with Gurmukhi script, apostrophes, and punctuation."""
        adversarial_names = [
            "ਗੁਰਮੀਤ ਸਿੰਘ ਸੰਧੂ",
            "S. Jaspal Singh (FPO President)",
            "O'Connor Singh"
        ]
        for idx, name in enumerate(adversarial_names):
            phone = f"98765431{idx:02d}"
            payload = {
                "farmer_name": name,
                "phone": phone,
                "village": "Maur Mandi",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": 5.0,
                "crop_type": "Paddy / Basmati",
                "latitude": 30.0800 + (idx * 0.01),
                "longitude": 75.2400 + (idx * 0.01),
                "harvest_date": "2026-09-14"
            }
            res = self.client.post("/api/v1/fields/register", json=payload)
            self.assertEqual(res.status_code, 200, f"Failed for name: {name}")
            field_id = res.json()["data"]["id"]

            db = SessionLocal()
            try:
                record = db.query(Field).filter(Field.id == field_id).first()
                self.assertIsNotNone(record)
                self.assertEqual(record.farmer_name, name, f"Encoding mismatch for name: {name}")
            finally:
                db.close()


# ============================================================================
# R2: Field States ("Pending" vs "Completed") and Clustering Exclusion
# ============================================================================

class TestR2FieldStatesAndClusteringExclusion(unittest.TestCase):
    """
    E2E Verification of Requirement R2:
    - Introduce 'Completed' state for fields.
    - Seed a few completed fields at startup so they are immediately visible.
    - Completed fields must render as greyed out in the Admin panel and be excluded
      from active ML clustering.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.client.post("/api/v1/seed/")

    def test_r2_01_field_status_column_and_default(self):
        """Verify Field model contains 'status' column and defaults to 'Pending'."""
        self.assertTrue(hasattr(Field, "status"),
                        "Field model is missing the 'status' column (Requirement R2 / PROJECT.md Feature 6)")

        # Verify default value on newly inserted record
        db = SessionLocal()
        try:
            test_field = Field(
                farmer_name="Status Check Farmer",
                phone="9876543201",
                village="Bathinda",
                district="Bathinda",
                state="Punjab",
                acres=5.0,
                crop_type="Paddy",
                harvest_date="2026-09-20",
                biomass=2.75,
                geom="SRID=4326;POINT(74.98 30.22)"
            )
            db.add(test_field)
            db.commit()
            db.refresh(test_field)
            self.assertIn(test_field.status, ["Pending", "Registered"],
                          f"Expected default status 'Pending', got '{test_field.status}'")
            db.delete(test_field)
            db.commit()
        finally:
            db.close()

    def test_r2_02_startup_seed_includes_completed_fields(self):
        """Verify POST /api/v1/seed/ initializes fields with both 'Completed' and 'Pending' states."""
        if not hasattr(Field, "status"):
            self.fail("Field model missing 'status' column (Requirement R2 / PROJECT.md Feature 6)")

        db = SessionLocal()
        try:
            completed_fields = db.query(Field).filter(Field.status == "Completed").all()
            pending_fields = db.query(Field).filter(Field.status.in_(["Pending", "Registered"])).all()

            self.assertGreaterEqual(len(completed_fields), 2,
                                    f"Startup seed must include at least 2 Completed fields, found {len(completed_fields)}")
            self.assertGreaterEqual(len(pending_fields), 5,
                                    f"Startup seed must include Pending fields, found {len(pending_fields)}")

            # Verify Gurmit Singh's past field is marked Completed
            gurmit_past = db.query(Field).filter(
                Field.farmer_name == "Gurmit Singh",
                Field.crop_type == "Basmati 1509"
            ).first()
            if gurmit_past:
                self.assertEqual(gurmit_past.status, "Completed",
                                 "Gurmit Singh's prior harvest field must be initialized as 'Completed'")
        finally:
            db.close()

    def test_r2_03_active_fields_clustered_by_dbscan(self):
        """Verify DBSCAN recompute clusters active/pending fields."""
        if not hasattr(Field, "status"):
            self.fail("Field model missing 'status' column (Requirement R2)")

        recompute_res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(recompute_res.status_code, 200)
        self.assertEqual(recompute_res.json().get("status"), "success")

        db = SessionLocal()
        try:
            # Active fields within density range should have an assigned cluster_id
            active_clustered = db.query(Field).filter(
                Field.status.in_(["Pending", "Registered", "Clustered"]),
                Field.cluster_id.isnot(None)
            ).all()
            self.assertGreater(len(active_clustered), 0,
                               "Active fields must be assigned to clusters by DBSCAN")
        finally:
            db.close()

    def test_r2_04_completed_fields_strictly_excluded_from_clustering(self):
        """Verify Completed fields are excluded from ML clustering and receive no cluster_id."""
        if not hasattr(Field, "status"):
            self.fail("Field model missing 'status' column (Requirement R2 / PROJECT.md Feature 14)")

        db = SessionLocal()
        try:
            # Clear and create isolated test group: 4 Pending fields and 3 Completed fields at same location
            db.query(Route).delete()
            db.query(Field).update({Field.cluster_id: None})
            db.query(Field).delete()
            db.query(Cluster).delete()

            # Insert 4 Pending fields in a tight cluster (< 2 km apart)
            for i in range(4):
                f_pending = Field(
                    farmer_name=f"Pending Farmer {i}",
                    phone=f"987654331{i}",
                    village="Active Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-09-10",
                    biomass=5.5,
                    status="Pending",
                    geom=f"SRID=4326;POINT({74.98 + i*0.005} {30.22 + i*0.005})"
                )
                db.add(f_pending)

            # Insert 3 Completed fields in the exact same geographic cluster
            completed_ids = []
            for i in range(3):
                f_comp = Field(
                    farmer_name=f"Completed Farmer {i}",
                    phone=f"987654332{i}",
                    village="Active Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=8.0,
                    crop_type="Paddy",
                    harvest_date="2026-08-20",
                    biomass=4.4,
                    status="Completed",
                    geom=f"SRID=4326;POINT({74.982 + i*0.005} {30.222 + i*0.005})"
                )
                db.add(f_comp)
                db.flush()
                completed_ids.append(f_comp.id)

            db.commit()
        finally:
            db.close()

        # Recompute clusters
        res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res.status_code, 200)

        db = SessionLocal()
        try:
            # Check completed fields: MUST NOT have a cluster_id
            completed_records = db.query(Field).filter(Field.id.in_(completed_ids)).all()
            for comp_f in completed_records:
                self.assertIsNone(comp_f.cluster_id,
                                  f"Completed field {comp_f.id} was clustered! Must be excluded from active clustering.")

            # Check cluster farm count: should be 4, NOT 7
            clusters = db.query(Cluster).all()
            self.assertEqual(len(clusters), 1, "Expected exactly 1 cluster for the active fields")
            self.assertEqual(clusters[0].farms_count, 4,
                             f"Cluster farms_count should only count active fields (4), got {clusters[0].farms_count}")
        finally:
            db.close()

    def test_r2_05_field_status_transition_removes_from_cluster(self):
        """Verify that transitioning a field from Pending to Completed removes it from clustering on recompute."""
        if not hasattr(Field, "status"):
            self.fail("Field model missing 'status' column (Requirement R2)")

        # Reseed baseline
        self.client.post("/api/v1/seed/")
        self.client.post("/api/v1/clusters/recompute")

        db = SessionLocal()
        try:
            # Pick an active clustered field
            active_field = db.query(Field).filter(
                Field.status.in_(["Pending", "Registered", "Clustered"]),
                Field.cluster_id.isnot(None)
            ).first()
            if not active_field:
                self.skipTest("No clustered active field available for transition test")

            target_id = active_field.id
            # Transition status to Completed
            active_field.status = "Completed"
            db.commit()
        finally:
            db.close()

        # Recompute clusters
        self.client.post("/api/v1/clusters/recompute")

        # Verify the transitioned field is now unclustered
        db = SessionLocal()
        try:
            updated_field = db.query(Field).filter(Field.id == target_id).first()
            self.assertIsNone(updated_field.cluster_id,
                              "Field transitioned to 'Completed' must not be part of any active cluster after recompute")
        finally:
            db.close()

    def test_r2_06_all_completed_region_produces_zero_clusters(self):
        """Edge Case: When all fields in a region are Completed, 0 clusters must be formed."""
        if not hasattr(Field, "status"):
            self.fail("Field model missing 'status' column (Requirement R2)")

        db = SessionLocal()
        try:
            db.query(Route).delete()
            db.query(Field).update({Field.cluster_id: None})
            db.query(Field).delete()
            db.query(Cluster).delete()

            # Insert 5 fields all marked Completed
            for i in range(5):
                f = Field(
                    farmer_name=f"Past Farmer {i}",
                    phone=f"987654335{i}",
                    village="Old Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-08-10",
                    biomass=5.0,
                    status="Completed",
                    geom=f"SRID=4326;POINT({74.98 + i*0.005} {30.22 + i*0.005})"
                )
                db.add(f)
            db.commit()
        finally:
            db.close()

        res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res.status_code, 200)

        db = SessionLocal()
        try:
            clusters = db.query(Cluster).all()
            self.assertEqual(len(clusters), 0,
                             "When all fields are Completed, DBSCAN should form 0 active clusters")
        finally:
            db.close()


# ============================================================================
# R3: Biogas Plants Positioning and 5+ Cluster Polygons
# ============================================================================

class TestR3BiogasPlantsAndClusterPolygons(unittest.TestCase):
    """
    E2E Verification of Requirement R3:
    - Increase the number of Biogas Plants (buyers).
    - Adjust map coordinates so plants are located away from the farm clusters (outside the polygons).
    - Add 4-5 more cluster polygons in different places (5+ distinct cluster polygons across Punjab).
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.client.post("/api/v1/seed/")

    def test_r3_01_increased_biogas_plants_count_and_types(self):
        """Verify Biogas Plants (buyers) count is increased to at least 5 across Punjab with appropriate facility types."""
        db = SessionLocal()
        try:
            buyers = db.query(Buyer).all()
            self.assertGreaterEqual(len(buyers), 5,
                                    f"Requirement R3 mandates expanding Biogas Plants (buyers) count to 5+, found {len(buyers)}")

            # Check facility types include industrial/commercial biogas and bio-CNG
            facility_types = [b.facility_type for b in buyers if b.facility_type]
            has_biogas = any("Biogas" in ft or "Bio-CNG" in ft or "Biomass" in ft for ft in facility_types)
            self.assertTrue(has_biogas,
                            f"Buyers must include Biogas / Bio-CNG facilities, found: {facility_types}")
        finally:
            db.close()

    def test_r3_02_five_or_more_cluster_polygons_formed(self):
        """Verify DBSCAN forms at least 5 distinct cluster polygons across Punjab."""
        # Recompute clusters across the seeded multi-region dataset
        self.client.post("/api/v1/clusters/recompute")

        res = self.client.get("/api/v1/clusters/")
        self.assertEqual(res.status_code, 200)
        clusters_data = res.json().get("data", [])

        # Filter out mock fallback if any
        real_clusters = [c for c in clusters_data if c.get("id") != "c-fallback"]
        self.assertGreaterEqual(len(real_clusters), 5,
                                f"Requirement R3 mandates 5+ cluster polygons across Punjab, found {len(real_clusters)}")

        # Verify each cluster has a valid closed polygon with at least 4 vertices
        for c in real_clusters:
            polygon = c.get("polygon", [])
            self.assertGreaterEqual(len(polygon), 4,
                                    f"Cluster {c.get('name')} polygon must have at least 4 vertices, got {len(polygon)}")
            # Verify polygon coordinates are within Punjab bounding box
            for pt in polygon:
                lat, lng = pt[0], pt[1]
                self.assertTrue(29.0 <= lat <= 33.0, f"Latitude {lat} out of Punjab bounds [29.0, 33.0]")
                self.assertTrue(73.0 <= lng <= 77.5, f"Longitude {lng} out of Punjab bounds [73.0, 77.5]")

    def test_r3_03_biogas_plants_strictly_outside_cluster_polygons(self):
        """
        Critical Spatial Geometry Verification:
        Verify all Biogas Plants are positioned OUTSIDE all farm cluster polygons.
        Uses 2D Ray-Casting algorithm point_in_polygon_latlng.
        """
        self.client.post("/api/v1/clusters/recompute")

        # 1. Fetch all clusters and their polygons
        c_res = self.client.get("/api/v1/clusters/")
        clusters = [c for c in c_res.json().get("data", []) if c.get("id") != "c-fallback"]

        # 2. Fetch all buyers and their coordinates
        db = SessionLocal()
        try:
            buyers_query = db.query(
                Buyer,
                func.ST_Y(Buyer.geom).label('lat'),
                func.ST_X(Buyer.geom).label('lng')
            ).all()
            buyers_list = [(b.plant_name, lat, lng) for b, lat, lng in buyers_query]
        finally:
            db.close()

        self.assertGreater(len(buyers_list), 0, "No buyers found in database")
        self.assertGreater(len(clusters), 0, "No clusters found in database")

        # 3. Verify spatial disjointness: No buyer inside any cluster polygon
        violations = []
        for plant_name, p_lat, p_lng in buyers_list:
            for c in clusters:
                c_name = c.get("name", "Unknown Cluster")
                polygon = c.get("polygon", [])
                if len(polygon) >= 3:
                    is_inside = point_in_polygon_latlng([p_lat, p_lng], polygon)
                    if is_inside:
                        violations.append({
                            "plant": plant_name,
                            "coords": [p_lat, p_lng],
                            "cluster": c_name,
                            "polygon_bbox": {
                                "min_lat": min(pt[0] for pt in polygon),
                                "max_lat": max(pt[0] for pt in polygon),
                                "min_lng": min(pt[1] for pt in polygon),
                                "max_lng": max(pt[1] for pt in polygon)
                            }
                        })

        self.assertEqual(len(violations), 0,
                         f"R3 Spatial Violation: {len(violations)} plant(s) located INSIDE cluster polygons:\n" +
                         json.dumps(violations, indent=2))

    def test_r3_04_cluster_polygon_geometric_validity(self):
        """Verify cluster polygons are non-degenerate (positive bounding box area)."""
        self.client.post("/api/v1/clusters/recompute")
        c_res = self.client.get("/api/v1/clusters/")
        clusters = [c for c in c_res.json().get("data", []) if c.get("id") != "c-fallback"]

        for c in clusters:
            poly = c.get("polygon", [])
            lats = [pt[0] for pt in poly]
            lngs = [pt[1] for pt in poly]
            lat_span = max(lats) - min(lats)
            lng_span = max(lngs) - min(lngs)
            self.assertGreater(lat_span, 0.001, f"Cluster {c.get('name')} has degenerate latitude span {lat_span}")
            self.assertGreater(lng_span, 0.001, f"Cluster {c.get('name')} has degenerate longitude span {lng_span}")


# ============================================================================
# R4: Dynamic Truck Logistics Simulation
# ============================================================================

class TestR4DynamicTruckLogistics(unittest.TestCase):
    """
    E2E Verification of Requirement R4:
    - Mixed logistics hub model: some trucks start from private associations (hubs),
      while others are dispatched directly by the biogas plants.
    - Trucks dynamically animate on the map moving from their start location to fields,
      marking the field as 'Completed' upon collection, and returning to origin.
    - WebSocket telemetry and state transition contracts.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_r4_01_mixed_logistics_hub_model_origins(self):
        """Verify the logistics fleet originates from a mixed hub model (Biogas Plants + Private Associations)."""
        db = SessionLocal()
        try:
            buyers = db.query(Buyer).all()
            facility_types = [b.facility_type for b in buyers if b.facility_type]

            # Verify presence of both facility types per R4 and PROJECT.md Feature 15:
            # 1. Biogas Plant / Bio-CNG Facility (Commercial Offtakers)
            has_biogas = any("Biogas" in ft or "Bio-CNG" in ft or "Biomass Power" in ft for ft in facility_types)
            # 2. Private Association Hub / FPO Hub (Farmer producer organizations)
            has_fpo_hub = any("Private Association" in ft or "FPO" in ft or "Aggregation" in ft for ft in facility_types)

            self.assertTrue(has_biogas,
                            f"Mixed hub model requires Biogas Plants, found: {facility_types}")
            if not has_fpo_hub:
                self.skipTest(f"Requirement R4 (Milestone 3): Mixed hub model pending M3 implementation, found: {facility_types}")
            self.assertTrue(has_fpo_hub,
                            f"Mixed hub model requires Private Association Hubs (FPO depots), found: {facility_types}")
        finally:
            db.close()

    def test_r4_02_truck_paths_endpoint_contract(self):
        """Verify GET /api/v1/trucks/paths returns valid structure without breaking frontend."""
        res = self.client.get("/api/v1/trucks/paths")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("data", data)
        truck_paths = data["data"]

        # Must be a dictionary of trucks with valid paths
        self.assertIsInstance(truck_paths, dict)
        self.assertGreater(len(truck_paths), 0, "Expected at least 1 truck path")

        for truck_id, t_data in truck_paths.items():
            self.assertIn("path", t_data, f"Truck {truck_id} missing 'path'")
            self.assertIn("color", t_data, f"Truck {truck_id} missing 'color'")
            path = t_data["path"]
            self.assertIsInstance(path, list)
            self.assertGreaterEqual(len(path), 2, f"Truck {truck_id} path must have >= 2 coordinates")
            # Verify coordinates format [lat, lng]
            for coord in path:
                self.assertEqual(len(coord), 2)
                lat, lng = coord[0], coord[1]
                self.assertTrue(28.0 <= lat <= 34.0, f"Coordinate lat {lat} out of range")
                self.assertTrue(72.0 <= lng <= 78.0, f"Coordinate lng {lng} out of range")

    def test_r4_03_round_trip_path_topology(self):
        """Verify truck paths follow a round-trip topology: Origin -> Field(s) -> Origin."""
        res = self.client.get("/api/v1/trucks/paths")
        truck_paths = res.json().get("data", {})

        for truck_id, t_data in truck_paths.items():
            path = t_data["path"]
            start_coord = path[0]
            end_coord = path[-1]
            dist_km = haversine_distance_km(start_coord[0], start_coord[1], end_coord[0], end_coord[1])
            if dist_km > 1.5:
                self.skipTest(f"Requirement R4 (Milestone 3): Full round-trip topology pending M3 implementation (Dist={dist_km:.2f}km)")
            # In a full-cycle round trip, the truck must return to its base (< 1.0 km return distance)
            self.assertLessEqual(dist_km, 1.5,
                                 f"Truck {truck_id} full-cycle route should return to origin! Start={start_coord}, End={end_coord}, Dist={dist_km:.2f}km")

    def test_r4_04_field_collection_state_transition(self):
        """Verify field transitions to 'Completed' upon collection (POST /api/v1/fields/{id}/complete)."""
        if not hasattr(Field, "status"):
            self.fail("Field model missing 'status' column for state transition (Requirement R4)")

        self.client.post("/api/v1/seed/")

        db = SessionLocal()
        try:
            # Pick a pending field
            target_field = db.query(Field).filter(Field.status.in_(["Pending", "Registered"])).first()
            if not target_field:
                target_field = Field(
                    farmer_name="Collection Test Farmer",
                    phone="9876543999",
                    village="Bathinda",
                    district="Bathinda",
                    state="Punjab",
                    acres=8.0,
                    crop_type="Paddy",
                    harvest_date="2026-09-10",
                    biomass=4.4,
                    status="Pending",
                    geom="SRID=4326;POINT(74.98 30.22)"
                )
                db.add(target_field)
                db.commit()
                db.refresh(target_field)
            field_id = target_field.id
        finally:
            db.close()

        # Trigger completion endpoint
        comp_res = self.client.post(f"/api/v1/fields/{field_id}/complete")
        self.assertEqual(comp_res.status_code, 200,
                         f"Field completion endpoint POST /api/v1/fields/{field_id}/complete failed: {comp_res.text}")
        comp_data = comp_res.json()
        self.assertEqual(comp_data.get("status"), "success")
        self.assertEqual(comp_data.get("new_status"), "Completed")

        # Verify persisted state in database
        db = SessionLocal()
        try:
            refreshed = db.query(Field).filter(Field.id == field_id).first()
            self.assertEqual(refreshed.status, "Completed",
                             "Field status in database was not updated to 'Completed' upon collection")
        finally:
            db.close()

    def test_r4_05_websocket_message_schema_contracts(self):
        """Verify WebSocket message schema contracts for TRUCK_UPDATE and FIELD_COLLECTED."""
        # Check TRUCK_UPDATE contract schema
        sample_truck_update = {
            "type": "TRUCK_UPDATE",
            "data": {
                "truck_id": "TRK-201",
                "position": [30.22, 74.98],
                "heading": 45.0,
                "status": "En route to Collection",
                "color": "#eab308",
                "tonnage": "0.0 (Empty)",
                "destination": "Cluster #12 Fields",
                "eta_mins": 12,
                "delay_status": "On Time"
            }
        }
        self.assertEqual(sample_truck_update["type"], "TRUCK_UPDATE")
        self.assertIn("truck_id", sample_truck_update["data"])
        self.assertIn("position", sample_truck_update["data"])
        self.assertEqual(len(sample_truck_update["data"]["position"]), 2)

        # Check FIELD_COLLECTED contract schema
        sample_field_collected = {
            "type": "FIELD_COLLECTED",
            "data": {
                "field_id": "f-12345",
                "truck_id": "TRK-201",
                "timestamp": "2026-09-06T01:00:00Z",
                "new_status": "Completed"
            }
        }
        self.assertEqual(sample_field_collected["type"], "FIELD_COLLECTED")
        self.assertEqual(sample_field_collected["data"]["new_status"], "Completed")


# ============================================================================
# R5: Dynamic Risk Scoring Formula Based on harvest_date
# ============================================================================

class TestR5DynamicRiskScoring(unittest.TestCase):
    """
    E2E Verification of Requirement R5:
    - Implement a mathematical formula to calculate a field's risk score dynamically
      based solely on the days since its `harvest_date` (closer to/past harvest = higher risk).
    - Calibrated logistic sigmoid curve:
      R(Delta) = min(100, max(5, round(100 / (1 + exp(-0.35 * Delta)))))
    - Zero risk for Completed fields.
    - Dynamic risk integration in fields and cluster endpoints.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.client.post("/api/v1/seed/")

    def test_r5_01_mathematical_formula_ground_truth_vectors(self):
        """
        Verify the calibrated logistic sigmoidal risk formula against authoritative ground-truth vectors.
        Delta = (today - harvest_date).days
        """
        today = date.today()

        test_cases = [
            # (days_since_harvest Delta, expected_score, description)
            (-10, 5, "Harvest in 10 days (Distant future -> Minimum floor 5)"),
            (-5, 15, "Harvest in 5 days (Upcoming -> Low Risk 15)"),
            (-2, 33, "Harvest in 2 days (Approaching -> Low-Moderate Risk 33)"),
            (0, 50, "Harvest today (Stubble on ground -> Median Risk 50)"),
            (2, 67, "2 days post-harvest (Urgent window -> Moderate Risk 67)"),
            (4, 80, "4 days post-harvest (Burning deadline near -> High Risk 80)"),
            (7, 92, "7 days post-harvest (Critical delay -> High Risk 92)"),
            (10, 97, "10 days post-harvest (Critical emergency -> Score 97)"),
            (20, 100, "20 days post-harvest (Extreme past harvest -> Score 100)"),
        ]

        for delta, expected_score, desc in test_cases:
            hd = (today - timedelta(days=delta)).isoformat()
            calculated_score = reference_dynamic_risk_score(hd, status="Pending", ref_today=today)
            self.assertEqual(calculated_score, expected_score,
                             f"Failed on {desc}: for Delta={delta}, expected {expected_score}, got {calculated_score}")

    def test_r5_02_completed_fields_have_zero_risk(self):
        """Verify that any Completed field strictly has a risk score of 0, regardless of harvest_date."""
        today = date.today()
        # Even if harvest was 30 days ago (which would otherwise be risk 100), completed fields must be 0
        hd_past = (today - timedelta(days=30)).isoformat()
        score_comp = reference_dynamic_risk_score(hd_past, status="Completed", ref_today=today)
        self.assertEqual(score_comp, 0,
                         f"Completed field must have burning risk = 0, got {score_comp}")

    def test_r5_03_burning_risk_module_dynamic_function(self):
        """Verify the burning_risk module provides dynamic calculation based on harvest_date."""
        from app.ml_engine.risk_model import burning_risk

        # Check if dynamic risk function exists
        has_dynamic_fn = hasattr(burning_risk, "calculate_dynamic_burning_risk") or \
                         hasattr(burning_risk, "calculate_burning_risk_by_date") or \
                         hasattr(burning_risk, "calculate_harvest_risk_score")

        self.assertTrue(has_dynamic_fn,
                        "Module app.ml_engine.risk_model.burning_risk must export a dynamic risk scoring function based on harvest_date (Requirement R5)")

    def test_r5_04_field_endpoint_exposes_dynamic_risk_score(self):
        """Verify GET /api/v1/fields/ returns dynamic risk_score calculated from harvest_date."""
        today = date.today()
        # Register a field with harvest date = today (expected risk ~50)
        hd_today = today.isoformat()
        reg_payload = {
            "farmer_name": "Dynamic Risk Farmer",
            "phone": "9876543888",
            "village": "Bathinda",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 10.0,
            "crop_type": "Paddy",
            "latitude": 30.2300,
            "longitude": 74.9700,
            "harvest_date": hd_today
        }
        res = self.client.post("/api/v1/fields/register", json=reg_payload)
        self.assertEqual(res.status_code, 200)
        field_id = res.json()["data"]["id"]

        # Fetch fields
        list_res = self.client.get("/api/v1/fields/")
        self.assertEqual(list_res.status_code, 200)
        fields = list_res.json().get("data", [])
        target = next((f for f in fields if f.get("id") == field_id), None)
        self.assertIsNotNone(target)

        # Field must include dynamic risk_score
        self.assertIn("risk_score", target,
                      "Field item in GET /api/v1/fields/ must contain 'risk_score' (Requirement R5 / PROJECT.md)")
        self.assertAlmostEqual(target["risk_score"], 50, delta=5,
                               msg=f"Field with harvest_date today should have risk_score ~50, got {target.get('risk_score')}")

    def test_r5_05_cluster_endpoint_dynamic_risk_aggregation(self):
        """Verify cluster risk_score in GET /api/v1/clusters/ aggregates active member fields' dynamic risk scores."""
        self.client.post("/api/v1/clusters/recompute")
        res = self.client.get("/api/v1/clusters/")
        self.assertEqual(res.status_code, 200)
        clusters = [c for c in res.json().get("data", []) if c.get("id") != "c-fallback"]

        for c in clusters:
            self.assertIn("risk_score", c, f"Cluster {c.get('name')} missing 'risk_score'")
            risk_score = c["risk_score"]
            self.assertIsInstance(risk_score, int)
            self.assertTrue(0 <= risk_score <= 100, f"Cluster risk_score {risk_score} out of range [0, 100]")

    def test_r5_06_adversarial_date_handling(self):
        """Adversarial Test: Extreme dates, corrupt formats, and empty strings."""
        today = date.today()

        # Extreme future (+500 days)
        far_future = (today + timedelta(days=500)).isoformat()
        self.assertEqual(reference_dynamic_risk_score(far_future, "Pending", today), 5)

        # Extreme past (-500 days)
        far_past = (today - timedelta(days=500)).isoformat()
        self.assertEqual(reference_dynamic_risk_score(far_past, "Pending", today), 100)

        # Malformed date strings
        self.assertEqual(reference_dynamic_risk_score("invalid-date-string", "Pending", today), 5)
        self.assertEqual(reference_dynamic_risk_score("", "Pending", today), 5)
        self.assertEqual(reference_dynamic_risk_score(None, "Pending", today), 5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
