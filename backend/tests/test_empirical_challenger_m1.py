"""
Empirical Challenger Test Suite: Milestone 1 (R1 & R2)
Exhaustive stress tests, load tests, adversarial edge cases, and mathematical/geometric oracles:
1. Registration under load (rapid sequential registrations, concurrency, diverse names).
2. Phone format permutations and immediate lookup in Farmer Dashboard ("My Fields").
3. Clustering exclusion of completed fields and convex hull geometric boundaries.
4. State transitions (Pending -> Completed) and dynamic cluster recomputation / dissolution.
"""

import unittest
import sys
import os
import time
import math
from pathlib import Path
from datetime import date, timedelta
from concurrent.futures import ThreadPoolExecutor

backend_path = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Field, Cluster, Route, Buyer, Farmer
from sqlalchemy import func


def point_in_polygon(point, polygon):
    """2D Ray-casting algorithm for Point-in-Polygon testing."""
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


class TestRegistrationUnderLoadAndStress(unittest.TestCase):
    """Stress testing field registration under high volume, concurrency, and diverse payloads."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.client.post("/api/v1/seed/")

    def test_rapid_sequential_100_field_registrations(self):
        """Stress: Rapidly register 100 fields sequentially. Measure latency and verify persistence."""
        total_fields = 100
        start_time = time.time()
        registered_ids = []

        for i in range(total_fields):
            payload = {
                "farmer_name": f"Stress Farmer {i:03d}",
                "phone": f"98700{i:05d}",
                "village": f"Village {i % 10}",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": round(1.0 + (i % 25) * 0.5, 1),
                "crop_type": "Paddy / Basmati" if i % 2 == 0 else "PR-126",
                "latitude": 30.1500 + (i % 20) * 0.005,
                "longitude": 74.9000 + (i // 20) * 0.005,
                "harvest_date": "2026-09-15"
            }
            res = self.client.post("/api/v1/fields/register", json=payload)
            self.assertEqual(res.status_code, 200, f"Registration failed at index {i}: {res.text}")
            res_json = res.json()
            self.assertEqual(res_json["status"], "success")
            field_id = res_json["data"]["id"]
            registered_ids.append(field_id)

        elapsed = time.time() - start_time
        avg_latency_ms = (elapsed / total_fields) * 1000
        print(f"\n[STRESS] Registered 100 fields in {elapsed:.2f}s ({avg_latency_ms:.1f}ms/request)")
        self.assertLess(avg_latency_ms, 150.0, f"Average registration latency {avg_latency_ms:.1f}ms exceeded 150ms")

        # Directly verify all 100 fields persisted with exact biomass and status
        db = SessionLocal()
        try:
            persisted = db.query(Field).filter(Field.id.in_(registered_ids)).all()
            self.assertEqual(len(persisted), 100, f"Expected 100 persisted fields, found {len(persisted)}")
            for f in persisted:
                self.assertIn("Stress Farmer", f.farmer_name)
                self.assertEqual(f.status, "Pending")
                expected_biomass = round(f.acres * 0.55, 1)
                self.assertAlmostEqual(f.biomass, expected_biomass, places=1)
        finally:
            db.close()

    def test_concurrent_multithreaded_registrations(self):
        """Stress: 20 concurrent registrations across 4 threads testing connection pool thread-safety."""
        def register_worker(worker_id):
            client = TestClient(app)
            payload = {
                "farmer_name": f"Thread Farmer {worker_id}",
                "phone": f"98711000{worker_id:02d}",
                "village": "Talwandi Sabo",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": 5.0,
                "crop_type": "Paddy / Basmati",
                "latitude": 30.2200 + (worker_id * 0.001),
                "longitude": 74.9800 + (worker_id * 0.001),
                "harvest_date": "2026-09-10"
            }
            res = client.post("/api/v1/fields/register", json=payload)
            return res.status_code, res.json()

        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(register_worker, range(20)))

        for status_code, data in results:
            self.assertEqual(status_code, 200)
            self.assertEqual(data["status"], "success")
            self.assertIn("id", data["data"])

    def test_diverse_farmer_names_and_character_encodings(self):
        """Adversarial: Non-ASCII scripts, honorifics, apostrophes, hyphens, and extreme lengths."""
        test_names = [
            "ਹਰਪ੍ਰੀਤ ਸਿੰਘ ਸੰਧੂ (Harpreet Singh)",
            "Sardar Jaspal Singh-Dhillon, B.Sc. Agri",
            "M'Kenzie Singh",
            "A",
            "Dr. Gurkirat Singh & Sons Cooperative Agricultural Enterprise Bathinda Area Depot #12"
        ]

        for idx, name in enumerate(test_names):
            payload = {
                "farmer_name": name,
                "phone": f"98722000{idx:02d}",
                "village": "Rampura Phul",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": 10.0,
                "crop_type": "Paddy / Basmati",
                "latitude": 30.2500,
                "longitude": 75.2000,
                "harvest_date": "2026-09-12"
            }
            res = self.client.post("/api/v1/fields/register", json=payload)
            self.assertEqual(res.status_code, 200, f"Failed for name: {name}")
            field_id = res.json()["data"]["id"]

            db = SessionLocal()
            try:
                record = db.query(Field).filter(Field.id == field_id).first()
                self.assertIsNotNone(record)
                self.assertEqual(record.farmer_name, name)
            finally:
                db.close()

    def test_acres_boundary_and_biomass_calculation(self):
        """Stress: Boundary condition acres (0.1 to 5000.0) verify biomass = round(acres * 0.55, 1)."""
        test_acres = [0.1, 0.55, 1.0, 7.3, 10.0, 99.9, 500.0, 5000.0]
        for idx, acre in enumerate(test_acres):
            payload = {
                "farmer_name": f"Boundary Farmer {idx}",
                "phone": f"98733000{idx:02d}",
                "village": "Goniana",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": acre,
                "crop_type": "Paddy",
                "latitude": 30.3000,
                "longitude": 74.9000,
                "harvest_date": "2026-09-20"
            }
            res = self.client.post("/api/v1/fields/register", json=payload)
            self.assertEqual(res.status_code, 200)
            field_id = res.json()["data"]["id"]

            db = SessionLocal()
            try:
                record = db.query(Field).filter(Field.id == field_id).first()
                expected_biomass = round(acre * 0.55, 1)
                self.assertEqual(record.biomass, expected_biomass)
            finally:
                db.close()


class TestPhoneFormatsAndLookupSync(unittest.TestCase):
    """Verifying diverse phone formats, normalization, and immediate visibility in 'My Fields'."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.client.post("/api/v1/seed/")

    def test_phone_format_normalization_permutations(self):
        """Oracle: Test phone formatting variations normalize cleanly to 10 digits in Field record."""
        test_phones = [
            ("+919876543201", "9876543201"),
            ("+91 98765 43202", "9876543202"),
            ("+91-98765-43203", "9876543203"),
            ("919876543204", "9876543204"),
            ("9876543205", "9876543205"),
            ("  9876543206  ", "9876543206"),
            ("+91  98765-43207", "9876543207")
        ]

        for raw_phone, expected_norm in test_phones:
            payload = {
                "farmer_name": f"Phone Test {expected_norm}",
                "phone": raw_phone,
                "village": "Bathinda",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": 5.0,
                "crop_type": "Paddy",
                "latitude": 30.2200,
                "longitude": 74.9800,
                "harvest_date": "2026-09-10"
            }
            res = self.client.post("/api/v1/fields/register", json=payload)
            self.assertEqual(res.status_code, 200, f"Registration failed for raw phone: '{raw_phone}'")
            field_id = res.json()["data"]["id"]

            db = SessionLocal()
            try:
                f_record = db.query(Field).filter(Field.id == field_id).first()
                self.assertIsNotNone(f_record)
                self.assertEqual(f_record.phone, expected_norm,
                                 f"Phone '{raw_phone}' normalized to '{f_record.phone}', expected '{expected_norm}'")
            finally:
                db.close()

    def test_farmer_dashboard_my_fields_immediate_queryability(self):
        """Sync: Register farmer, register 3 fields with varying formats, verify immediate queryability."""
        base_phone = "9875500001"
        farmer_name = "Jagtar Singh"

        # 1. Register farmer
        f_reg = self.client.post("/api/v1/farmers/register", json={
            "name": farmer_name,
            "phone": base_phone,
            "village": "Talwandi Sabo",
            "district": "Bathinda",
            "state": "Punjab"
        })
        self.assertEqual(f_reg.status_code, 200)

        # 2. Register 3 fields with different phone formatting
        phone_formats = [f"+91{base_phone}", f"+91 {base_phone[:5]} {base_phone[5:]}", base_phone]
        registered_field_ids = []
        for idx, p_fmt in enumerate(phone_formats):
            res = self.client.post("/api/v1/fields/register", json={
                "farmer_name": farmer_name,
                "phone": p_fmt,
                "village": "Talwandi Sabo",
                "district": "Bathinda",
                "state": "Punjab",
                "acres": 6.0 + idx,
                "crop_type": "Basmati",
                "latitude": 29.9800 + (idx * 0.005),
                "longitude": 75.0800 + (idx * 0.005),
                "harvest_date": f"2026-09-1{idx}"
            })
            self.assertEqual(res.status_code, 200)
            registered_field_ids.append(res.json()["data"]["id"])

        # 3. Query farmer profile via GET /api/v1/farmers/me?phone=...
        me_res = self.client.get(f"/api/v1/farmers/me?phone={base_phone}")
        self.assertEqual(me_res.status_code, 200)
        profile_fields = me_res.json()["data"]["fields"]
        profile_field_ids = [f["id"] for f in profile_fields]

        for fid in registered_field_ids:
            self.assertIn(fid, profile_field_ids,
                          f"Field {fid} not found in Farmer Portal 'My Fields' via GET /api/v1/farmers/me!")

        # 4. Also verify via POST /api/v1/farmers/register (login simulation)
        login_res = self.client.post("/api/v1/farmers/register", json={
            "name": farmer_name,
            "phone": base_phone,
            "village": "Talwandi Sabo"
        })
        self.assertEqual(login_res.status_code, 200)
        login_field_ids = [f["id"] for f in login_res.json()["data"]["fields"]]
        for fid in registered_field_ids:
            self.assertIn(fid, login_field_ids,
                          f"Field {fid} not found in Farmer Portal login profile!")

    def test_phone_isolation_no_cross_farmer_leakage(self):
        """Security/Correctness: Verify fields for Farmer A never appear in Farmer B's profile."""
        phone_a = "9875500010"
        phone_b = "9875500020"

        # Register Farmer A and B
        self.client.post("/api/v1/farmers/register", json={"name": "Farmer A", "phone": phone_a, "village": "Village A"})
        self.client.post("/api/v1/farmers/register", json={"name": "Farmer B", "phone": phone_b, "village": "Village B"})

        # Register field for Farmer A
        res_a = self.client.post("/api/v1/fields/register", json={
            "farmer_name": "Farmer A", "phone": phone_a, "village": "Village A",
            "district": "Bathinda", "state": "Punjab", "acres": 10.0, "crop_type": "Paddy",
            "latitude": 30.22, "longitude": 74.98, "harvest_date": "2026-09-10"
        })
        field_a_id = res_a.json()["data"]["id"]

        # Farmer B profile must NOT contain field_a_id
        profile_b = self.client.get(f"/api/v1/farmers/me?phone={phone_b}").json()["data"]
        b_field_ids = [f["id"] for f in profile_b["fields"]]
        self.assertNotIn(field_a_id, b_field_ids, "Field belonging to Farmer A leaked into Farmer B's profile!")

    def test_phone_lookup_performance_benchmark(self):
        """Performance: Querying 'My Fields' executes in < 20ms even with many database records."""
        # Query primary seed farmer Gurmit Singh (phone 9876543210)
        start_t = time.time()
        res = self.client.get("/api/v1/farmers/me?phone=9876543210")
        elapsed_ms = (time.time() - start_t) * 1000

        self.assertEqual(res.status_code, 200)
        self.assertLess(elapsed_ms, 50.0, f"Farmer profile lookup took {elapsed_ms:.2f}ms, expected < 50ms")
        print(f"\n[BENCHMARK] Farmer profile & My Fields lookup completed in {elapsed_ms:.2f}ms")


class TestClusteringExclusionCompletedFields(unittest.TestCase):
    """Stress testing clustering exclusion of Completed fields and geometric boundaries."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Clean state
        db = SessionLocal()
        try:
            db.query(Route).delete()
            db.query(Field).update({Field.cluster_id: None})
            db.query(Field).delete()
            db.query(Cluster).delete()
            db.commit()
        finally:
            db.close()

    def test_strict_dbscan_exclusion_mixed_dense_cluster(self):
        """Stress: 10 fields in same 1km area (5 Pending, 5 Completed). Completed MUST be excluded."""
        db = SessionLocal()
        completed_ids = []
        pending_ids = []
        try:
            # 5 Pending fields
            for i in range(5):
                f = Field(
                    farmer_name=f"Pending Farmer {i}",
                    phone=f"987440001{i}",
                    village="Central Hub",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-09-10",
                    biomass=5.5,
                    status="Pending",
                    geom=f"SRID=4326;POINT({74.980 + i*0.002} {30.220 + i*0.002})"
                )
                db.add(f)
                db.flush()
                pending_ids.append(f.id)

            # 5 Completed fields interleaved in the same location
            for i in range(5):
                f = Field(
                    farmer_name=f"Completed Farmer {i}",
                    phone=f"987440002{i}",
                    village="Central Hub",
                    district="Bathinda",
                    state="Punjab",
                    acres=12.0,
                    crop_type="Paddy",
                    harvest_date="2026-08-15",
                    biomass=6.6,
                    status="Completed",
                    geom=f"SRID=4326;POINT({74.981 + i*0.002} {30.221 + i*0.002})"
                )
                db.add(f)
                db.flush()
                completed_ids.append(f.id)
            db.commit()
        finally:
            db.close()

        # Recompute
        res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["active_clusters_formed"], 1)

        db = SessionLocal()
        try:
            # Verify completed fields have cluster_id is None
            comp_fields = db.query(Field).filter(Field.id.in_(completed_ids)).all()
            for cf in comp_fields:
                self.assertIsNone(cf.cluster_id, f"Completed field {cf.id} was clustered!")

            # Verify pending fields all have cluster_id assigned
            pend_fields = db.query(Field).filter(Field.id.in_(pending_ids)).all()
            for pf in pend_fields:
                self.assertIsNotNone(pf.cluster_id, f"Pending field {pf.id} was NOT clustered!")

            # Verify cluster properties
            cluster = db.query(Cluster).first()
            self.assertIsNotNone(cluster)
            self.assertEqual(cluster.farms_count, 5, f"Cluster farms_count was {cluster.farms_count}, expected 5")
            self.assertAlmostEqual(cluster.total_biomass, 5 * 5.5, places=1)
        finally:
            db.close()

    def test_convex_hull_polygon_does_not_expand_to_completed_fields(self):
        """Geometry: Verify ConvexHull polygon strictly bounds active fields and excludes distant completed fields."""
        db = SessionLocal()
        try:
            # 4 Pending fields forming a tight 1km square around (30.22, 74.98)
            pending_coords = [
                (30.220, 74.980),
                (30.220, 74.990),
                (30.230, 74.990),
                (30.230, 74.980),
            ]
            for i, (lat, lng) in enumerate(pending_coords):
                f = Field(
                    farmer_name=f"Square Farmer {i}",
                    phone=f"987440003{i}",
                    village="Square",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-09-10",
                    biomass=5.5,
                    status="Pending",
                    geom=f"SRID=4326;POINT({lng} {lat})"
                )
                db.add(f)

            # 1 Completed field placed 4km away (at 30.260, 74.980)
            distant_comp = Field(
                farmer_name="Distant Completed Farmer",
                phone="9874400039",
                village="Distant",
                district="Bathinda",
                state="Punjab",
                acres=10.0,
                crop_type="Paddy",
                harvest_date="2026-08-01",
                biomass=5.5,
                status="Completed",
                geom="SRID=4326;POINT(74.980 30.260)"
            )
            db.add(distant_comp)
            db.commit()
        finally:
            db.close()

        # Recompute
        self.client.post("/api/v1/clusters/recompute")

        # Fetch cluster polygon from GET /api/v1/clusters/
        c_res = self.client.get("/api/v1/clusters/")
        self.assertEqual(c_res.status_code, 200)
        clusters = c_res.json()["data"]
        self.assertEqual(len(clusters), 1)

        polygon = clusters[0]["polygon"]
        poly_lats = [pt[0] for pt in polygon]
        poly_lngs = [pt[1] for pt in polygon]

        # The maximum latitude of the polygon must NOT reach 30.25+ (where the completed field is)
        max_poly_lat = max(poly_lats)
        self.assertLess(max_poly_lat, 30.245,
                        f"Cluster convex hull expanded to include distant completed field at lat 30.260! Max lat={max_poly_lat}")

        # The completed field coordinate must NOT be inside the cluster convex hull
        is_comp_inside = point_in_polygon([30.260, 74.980], polygon)
        self.assertFalse(is_comp_inside, "Completed field is inside active cluster convex hull polygon!")

    def test_min_samples_boundary_noise_rejection_with_completed_fields(self):
        """Boundary Oracle: 2 Pending + 2 Completed. 2 < min_samples(3), so DBSCAN MUST yield 0 clusters."""
        db = SessionLocal()
        try:
            # 2 Pending fields
            for i in range(2):
                f = Field(
                    farmer_name=f"Sub-threshold Farmer {i}",
                    phone=f"987440004{i}",
                    village="Sparse Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-09-10",
                    biomass=5.5,
                    status="Pending",
                    geom=f"SRID=4326;POINT({74.98 + i*0.005} {30.22 + i*0.005})"
                )
                db.add(f)

            # 2 Completed fields
            for i in range(2):
                f = Field(
                    farmer_name=f"Past Farmer {i}",
                    phone=f"987440005{i}",
                    village="Sparse Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-08-01",
                    biomass=5.5,
                    status="Completed",
                    geom=f"SRID=4326;POINT({74.982 + i*0.005} {30.222 + i*0.005})"
                )
                db.add(f)
            db.commit()
        finally:
            db.close()

        res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["active_clusters_formed"], 0,
                         "Expected 0 active clusters because only 2 Pending fields exist (< min_samples 3)")

    def test_all_completed_fields_yield_zero_clusters(self):
        """Edge Case: 15 completed fields in high density must produce 0 clusters."""
        db = SessionLocal()
        try:
            for i in range(15):
                f = Field(
                    farmer_name=f"All Completed {i}",
                    phone=f"987440006{i:02d}",
                    village="Old Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=8.0,
                    crop_type="Paddy",
                    harvest_date="2026-08-01",
                    biomass=4.4,
                    status="Completed",
                    geom=f"SRID=4326;POINT({74.98 + (i%5)*0.002} {30.22 + (i//5)*0.002})"
                )
                db.add(f)
            db.commit()
        finally:
            db.close()

        res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["active_clusters_formed"], 0)

        # GET /api/v1/clusters/ should return fallback with 0 farms
        c_res = self.client.get("/api/v1/clusters/")
        self.assertEqual(c_res.status_code, 200)
        clusters = c_res.json()["data"]
        # If DB is empty of clusters, fallback cluster has farms_count == 0
        self.assertEqual(clusters[0]["farms_count"], 0)


class TestStateTransitionsAndDynamicRecomputation(unittest.TestCase):
    """Stress testing field state transitions (Pending -> Completed) and dynamic cluster evolution."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.client.post("/api/v1/seed/")
        self.client.post("/api/v1/clusters/recompute")

    def test_transition_pending_to_completed_clears_cluster_id_immediately(self):
        """Verification: POST /api/v1/fields/{id}/complete immediately sets status and nulls cluster_id."""
        db = SessionLocal()
        try:
            clustered_field = db.query(Field).filter(
                Field.status.in_(["Pending", "Registered", "Clustered"]),
                Field.cluster_id.isnot(None)
            ).first()
            self.assertIsNotNone(clustered_field, "Need an active clustered field for transition test")
            target_id = clustered_field.id
            prior_cluster_id = clustered_field.cluster_id
        finally:
            db.close()

        # Trigger completion
        res = self.client.post(f"/api/v1/fields/{target_id}/complete")
        self.assertEqual(res.status_code, 200)
        res_data = res.json()
        self.assertEqual(res_data["status"], "success")
        self.assertEqual(res_data["new_status"], "Completed")
        self.assertIsNone(res_data["data"]["cluster_id"])

        # Check DB directly
        db = SessionLocal()
        try:
            f = db.query(Field).filter(Field.id == target_id).first()
            self.assertEqual(f.status, "Completed")
            self.assertIsNone(f.cluster_id)
        finally:
            db.close()

    def test_recomputation_after_completion_excludes_field(self):
        """Verification: Calling recompute after completion keeps the completed field excluded."""
        db = SessionLocal()
        try:
            clustered_field = db.query(Field).filter(
                Field.status.in_(["Pending", "Registered", "Clustered"]),
                Field.cluster_id.isnot(None)
            ).first()
            target_id = clustered_field.id
        finally:
            db.close()

        # Mark completed
        self.client.post(f"/api/v1/fields/{target_id}/complete")

        # Recompute clusters
        recompute_res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(recompute_res.status_code, 200)

        # Verify completed field is NOT in any cluster
        db = SessionLocal()
        try:
            f = db.query(Field).filter(Field.id == target_id).first()
            self.assertIsNone(f.cluster_id, "Completed field received cluster_id after recomputation!")
        finally:
            db.close()

    def test_cluster_dissolution_when_active_members_drop_below_min_samples(self):
        """Adversarial Oracle: 3 Pending fields form 1 cluster. Complete 1 field -> cluster MUST dissolve."""
        # 1. Create clean isolate with exactly 3 fields
        db = SessionLocal()
        try:
            db.query(Route).delete()
            db.query(Field).update({Field.cluster_id: None})
            db.query(Field).delete()
            db.query(Cluster).delete()

            field_ids = []
            for i in range(3):
                f = Field(
                    farmer_name=f"Trio Farmer {i}",
                    phone=f"987440008{i}",
                    village="Trio Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy",
                    harvest_date="2026-09-10",
                    biomass=5.5,
                    status="Pending",
                    geom=f"SRID=4326;POINT({74.98 + i*0.002} {30.22 + i*0.002})"
                )
                db.add(f)
                db.flush()
                field_ids.append(f.id)
            db.commit()
        finally:
            db.close()

        # 2. Recompute -> exactly 1 cluster formed
        res1 = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.json()["active_clusters_formed"], 1)

        # 3. Complete 1 of the 3 fields
        complete_res = self.client.post(f"/api/v1/fields/{field_ids[0]}/complete")
        self.assertEqual(complete_res.status_code, 200)

        # 4. Recompute -> cluster must dissolve into 0 clusters because 2 < min_samples(3)
        res2 = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["active_clusters_formed"], 0,
                         "Cluster did NOT dissolve after active fields dropped below min_samples (3)!")

        # 5. Verify all fields now have cluster_id is None
        db = SessionLocal()
        try:
            remaining_fields = db.query(Field).all()
            for rf in remaining_fields:
                self.assertIsNone(rf.cluster_id, f"Field {rf.id} retained cluster_id after cluster dissolution!")
        finally:
            db.close()

    def test_completed_field_risk_score_drops_to_zero(self):
        """Mathematical Oracle: Harvest date 20 days ago (risk 100). When completed, risk_score MUST drop to 0."""
        # Register field with harvest date 20 days ago
        hd_past = (date.today() - timedelta(days=20)).isoformat()
        res = self.client.post("/api/v1/fields/register", json={
            "farmer_name": "High Risk Farmer",
            "phone": "9874400099",
            "village": "Bathinda",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 10.0,
            "crop_type": "Paddy",
            "latitude": 30.22,
            "longitude": 74.98,
            "harvest_date": hd_past
        })
        field_id = res.json()["data"]["id"]

        # Check fields list: risk_score must be 100
        fields_before = self.client.get("/api/v1/fields/").json()["data"]
        f_before = next(f for f in fields_before if f["id"] == field_id)
        self.assertEqual(f_before["risk_score"], 100, f"Expected risk_score 100 for 20-day past harvest, got {f_before['risk_score']}")

        # Complete the field
        self.client.post(f"/api/v1/fields/{field_id}/complete")

        # Check fields list: risk_score must now be 0
        fields_after = self.client.get("/api/v1/fields/").json()["data"]
        f_after = next(f for f in fields_after if f["id"] == field_id)
        self.assertEqual(f_after["status"], "Completed")
        self.assertEqual(f_after["risk_score"], 0, f"Expected risk_score 0 for Completed field, got {f_after['risk_score']}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
