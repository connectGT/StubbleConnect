"""
Empirical Challenger Test Suite
Stress tests for:
1. Google OR-Tools / Heuristic CVRP solver (vrp_solver.py, POST /api/v1/routes/optimize)
2. DBSCAN clustering & ConvexHull geometry resilience (dbscan_cluster.py, POST /api/v1/clusters/recompute, GET /api/v1/clusters/)
3. Live insertion field registration (POST /api/v1/fields/register) matching SIH_PITCH_GUIDE.md
"""

import unittest
import sys
import os
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_path))

from app.ml_engine.routing.vrp_solver import (
    solve_capacitated_vrp,
    solve_vrp_heuristic,
    create_data_model,
    haversine_distance,
    ORTOOLS_AVAILABLE
)
from app.ml_engine.clustering.dbscan_cluster import cluster_farms_dbscan
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Field, Cluster, Route, Buyer, Farmer
from sqlalchemy import text


class TestVRPSolverStress(unittest.TestCase):
    """Stress testing the VRP solver and heuristic fallback."""

    def setUp(self):
        self.depot = {"name": "Test Depot", "latitude": 30.22, "longitude": 74.98}

    def test_zero_pickup_stops(self):
        """Edge Case: 0 pickup stops should return empty route list without crashing."""
        routes_cvrp = solve_capacitated_vrp(self.depot, [], vehicle_capacity_tonnes=50.0)
        routes_heur = solve_vrp_heuristic(self.depot, [], vehicle_capacity_tonnes=50.0)
        self.assertEqual(routes_cvrp, [])
        self.assertEqual(routes_heur, [])

    def test_single_pickup_stop(self):
        """Edge Case: Single stop within capacity should generate 1 route with depot->stop->depot path."""
        stops = [{"name": "Stop 1", "latitude": 30.25, "longitude": 74.99, "biomass_tonnes": 12.0}]
        routes = solve_capacitated_vrp(self.depot, stops, vehicle_capacity_tonnes=50.0)
        self.assertEqual(len(routes), 1)
        self.assertEqual(routes[0]["stops_count"], 1)
        self.assertEqual(routes[0]["tonnage"], 12.0)
        self.assertEqual(len(routes[0]["path"]), 3)  # depot -> stop 1 -> depot

    def test_massive_tonnage_single_stop(self):
        """Stress Test: Single stop with 5,000 tonnes far exceeding standard 50T vehicle capacity."""
        stops = [{"name": "Mega Farm", "latitude": 30.23, "longitude": 74.95, "biomass_tonnes": 5000.0}]
        routes = solve_capacitated_vrp(self.depot, stops, vehicle_capacity_tonnes=50.0)
        self.assertEqual(len(routes), 1)
        self.assertEqual(routes[0]["tonnage"], 5000.0)
        self.assertEqual(routes[0]["stops_count"], 1)

    def test_massive_tonnage_multiple_stops(self):
        """Stress Test: 20 stops with combined 100,000 tonnes."""
        stops = [
            {"name": f"Heavy Farm {i}", "latitude": 30.20 + (i * 0.01), "longitude": 74.90 + (i * 0.01), "biomass_tonnes": 5000.0}
            for i in range(20)
        ]
        routes = solve_capacitated_vrp(self.depot, stops, vehicle_capacity_tonnes=10000.0)
        self.assertGreater(len(routes), 0)
        total_delivered = sum(r["tonnage"] for r in routes)
        self.assertEqual(round(total_delivered, 1), 100000.0)
        total_stops_served = sum(r["stops_count"] for r in routes)
        self.assertEqual(total_stops_served, 20)

    def test_zero_capacity_resilience(self):
        """Stress Test: vehicle_capacity_tonnes is 0 or negative."""
        stops = [{"name": "Farm A", "latitude": 30.23, "longitude": 74.95, "biomass_tonnes": 15.0}]
        routes = solve_capacitated_vrp(self.depot, stops, vehicle_capacity_tonnes=0.0)
        self.assertGreater(len(routes), 0)
        self.assertEqual(routes[0]["tonnage"], 15.0)

    def test_zero_biomass_stops(self):
        """Edge Case: Stops with 0.0 biomass demand."""
        stops = [
            {"name": "Zero Farm 1", "latitude": 30.23, "longitude": 74.95, "biomass_tonnes": 0.0},
            {"name": "Zero Farm 2", "latitude": 30.24, "longitude": 74.96, "biomass_tonnes": 0.0}
        ]
        routes = solve_capacitated_vrp(self.depot, stops, vehicle_capacity_tonnes=50.0)
        self.assertGreater(len(routes), 0)
        self.assertEqual(sum(r["stops_count"] for r in routes), 2)


class TestDBSCANAndGeometryResilience(unittest.TestCase):
    """Stress testing DBSCAN clustering and convex hull geometry edge cases."""

    def test_empty_farms_dbscan(self):
        """Edge Case: 0 farms provided to DBSCAN."""
        clusters = cluster_farms_dbscan([])
        self.assertEqual(clusters, [])

    def test_fewer_than_min_samples(self):
        """Edge Case: 2 farms (min_samples=3) should be labeled noise, returning 0 clusters."""
        farms = [
            {"id": 1, "latitude": 30.22, "longitude": 74.98, "biomass_tonnes": 10.0},
            {"id": 2, "latitude": 30.23, "longitude": 74.99, "biomass_tonnes": 10.0}
        ]
        clusters = cluster_farms_dbscan(farms, min_samples=3)
        self.assertEqual(clusters, [])

    def test_collinear_farms_clustering(self):
        """Stress Test: 5 collinear farms along a straight line (latitude = 30.22)."""
        farms = [
            {"id": i, "latitude": 30.22, "longitude": 74.90 + (i * 0.01), "biomass_tonnes": 10.0}
            for i in range(5)
        ]
        clusters = cluster_farms_dbscan(farms, eps_km=8.0, min_samples=3)
        self.assertEqual(len(clusters), 1)
        self.assertEqual(clusters[0]["farms_count"], 5)

    def test_identical_coordinates(self):
        """Edge Case: 4 farms registered at the exact same point."""
        farms = [
            {"id": i, "latitude": 30.2200, "longitude": 74.9800, "biomass_tonnes": 5.0}
            for i in range(4)
        ]
        clusters = cluster_farms_dbscan(farms, eps_km=8.0, min_samples=3)
        self.assertEqual(len(clusters), 1)
        self.assertEqual(clusters[0]["farms_count"], 4)
        self.assertEqual(clusters[0]["total_biomass_tonnes"], 20.0)


class TestLiveApiWorkflow(unittest.TestCase):
    """End-to-end API testing using TestClient."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_seed_endpoint(self):
        """Verify POST /api/v1/seed/ populates baseline dataset."""
        res = self.client.post("/api/v1/seed/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

    def test_02_clusters_recompute_and_collinearity_handling(self):
        """Verify DBSCAN recompute endpoint works on baseline and handles collinear fields."""
        # 1. Recompute baseline
        res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

        # 2. Insert collinear fields directly to test recompute with collinear points
        db = SessionLocal()
        try:
            # Clear fields and insert 4 perfectly collinear fields
            db.query(Route).delete()
            db.query(Field).update({Field.cluster_id: None})
            db.query(Field).delete()
            db.query(Cluster).delete()
            for i in range(4):
                f = Field(
                    farmer_name=f"Collinear Farmer {i}",
                    phone=f"987654322{i}",
                    village="Collinear Village",
                    district="Bathinda",
                    state="Punjab",
                    acres=10.0,
                    crop_type="Paddy / Basmati",
                    harvest_date="2026-09-10",
                    biomass=5.5,
                    geom=f"SRID=4326;POINT({74.95 + i*0.01} 30.22)"  # Exactly horizontal line
                )
                db.add(f)
            db.commit()
        finally:
            db.close()

        # Recompute on collinear points — should NOT crash with QhullError!
        res_collinear = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(res_collinear.status_code, 200)
        self.assertEqual(res_collinear.json()["status"], "success")

        # Query GET /api/v1/clusters/ to verify bounding box polygon was generated
        c_list = self.client.get("/api/v1/clusters/").json()
        self.assertEqual(c_list["status"], "success")
        self.assertGreater(c_list["count"], 0)
        first_cluster = c_list["data"][0]
        # Must have at least 4 polygon vertices
        self.assertGreaterEqual(len(first_cluster["polygon"]), 4)

    def test_03_null_geometry_graceful_fallback(self):
        """Verify GET /api/v1/clusters/ does not throw IndexError on null/empty geometries."""
        db = SessionLocal()
        try:
            # Manually insert a cluster with null polygon_geom
            c_null = Cluster(
                number=99,
                name="Null Geometry Cluster",
                risk_level="Low Risk",
                risk_score=10,
                farms_count=0,
                total_biomass=0.0,
                center_geom=None,
                polygon_geom=None,
                status="Generated"
            )
            db.add(c_null)
            db.commit()
        finally:
            db.close()

        res = self.client.get("/api/v1/clusters/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        null_c = next((c for c in data if c["number"] == 99), None)
        self.assertIsNotNone(null_c)
        # Should have fallen back to a valid 4-point bounding box polygon around default center
        self.assertGreaterEqual(len(null_c["polygon"]), 4)

    def test_04_routes_optimize_normal_and_empty(self):
        """Test POST /api/v1/routes/optimize under empty and normal cluster conditions."""
        # 1. Reseed to clean state
        self.client.post("/api/v1/seed/")
        self.client.post("/api/v1/clusters/recompute")

        # Normal optimize
        res = self.client.post("/api/v1/routes/optimize")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")
        self.assertGreater(res.json()["routes_count"], 0)

        # Verify GET /api/v1/routes
        r_list = self.client.get("/api/v1/routes/").json()
        self.assertEqual(r_list["status"], "success")
        self.assertGreater(r_list["count"], 0)
        route_item = r_list["data"][0]
        self.assertIn("code", route_item)
        self.assertIn("tonnage", route_item)
        self.assertIn("path", route_item)

        # 2. Test when no clusters exist
        db = SessionLocal()
        try:
            db.query(Route).delete()
            db.query(Field).update({Field.cluster_id: None})
            db.query(Cluster).delete()
            db.commit()
        finally:
            db.close()

        res_empty = self.client.post("/api/v1/routes/optimize")
        self.assertEqual(res_empty.status_code, 200)
        self.assertEqual(res_empty.json()["status"], "error")
        self.assertIn("No clusters available", res_empty.json()["message"])

    def test_05_live_insertion_matching_pitch_guide(self):
        """Verify field registration matching the exact payload in SIH_PITCH_GUIDE.md."""
        # Reseed database first
        self.client.post("/api/v1/seed/")
        self.client.post("/api/v1/clusters/recompute")

        # Exact payload from SIH_PITCH_GUIDE.md Phase 2 Section 2
        payload = {
            "farmer_name": "Farmer",
            "phone": "+919876543210",
            "village": "Bathinda City",
            "district": "Bathinda",
            "state": "Punjab",
            "acres": 5.0,
            "crop_type": "Paddy / Basmati",
            "latitude": 30.2134,
            "longitude": 74.9472,
            "harvest_date": "2026-09-06"
        }

        res = self.client.post("/api/v1/fields/register", json=payload)
        self.assertEqual(res.status_code, 200)
        res_json = res.json()
        self.assertEqual(res_json["status"], "success")
        self.assertIn("data", res_json)
        self.assertEqual(res_json["data"]["farmer_name"], "Farmer")
        self.assertEqual(res_json["data"]["coords"], [30.2134, 74.9472])

        # Verify field persisted in database
        db = SessionLocal()
        try:
            f = db.query(Field).filter(Field.id == res_json["data"]["id"]).first()
            self.assertIsNotNone(f)
            self.assertEqual(f.village, "Bathinda City")
            self.assertEqual(f.acres, 5.0)
            self.assertEqual(f.biomass, 2.8)  # round(5.0 * 0.55, 1) = 2.8
        finally:
            db.close()

        # Recompute clusters to verify absorption
        c_res = self.client.post("/api/v1/clusters/recompute")
        self.assertEqual(c_res.status_code, 200)
        self.assertGreater(c_res.json()["active_clusters_formed"], 0)

        # Optimize routes to verify logistics update
        r_res = self.client.post("/api/v1/routes/optimize")
        self.assertEqual(r_res.status_code, 200)
        self.assertGreater(r_res.json()["routes_count"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
