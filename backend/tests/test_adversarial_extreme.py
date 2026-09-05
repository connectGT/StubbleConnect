"""
Advanced Stress & Adversarial Test Harness for StubbleConnect Backend
"""

import sys
import os
import time
import math
import unittest
from pathlib import Path

backend_path = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_path))

from app.ml_engine.routing.vrp_solver import (
    solve_capacitated_vrp,
    solve_vrp_heuristic,
    haversine_distance,
    create_data_model
)
from app.ml_engine.clustering.dbscan_cluster import cluster_farms_dbscan
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Field, Cluster, Route, Buyer, Farmer


class TestAdversarialExtreme(unittest.TestCase):

    def test_vrp_scalability_500_stops(self):
        """Stress Test: 500 farm stops distributed across Punjab. Must complete in < 2 seconds."""
        depot = {"name": "Central Hub", "latitude": 30.22, "longitude": 74.98}
        stops = [
            {
                "id": i,
                "name": f"Farm {i}",
                "latitude": 30.0 + (i % 50) * 0.01,
                "longitude": 74.5 + (i // 50) * 0.05,
                "biomass_tonnes": round(5.0 + (i % 15) * 1.5, 1)
            }
            for i in range(500)
        ]
        start_t = time.time()
        routes = solve_capacitated_vrp(depot, stops, vehicle_capacity_tonnes=50.0)
        elapsed = time.time() - start_t

        self.assertGreater(len(routes), 0)
        total_stops = sum(r["stops_count"] for r in routes)
        self.assertEqual(total_stops, 500)
        self.assertLess(elapsed, 2.0, f"VRP took {elapsed:.2f}s, expected < 2.0s")
        print(f"\n[BENCHMARK] VRP 500 stops solved in {elapsed:.3f}s into {len(routes)} routes.")

    def test_dbscan_scalability_1000_farms(self):
        """Stress Test: 1,000 farms clustered with DBSCAN. Must complete in < 1 second."""
        farms = [
            {
                "id": i,
                "latitude": 30.22 + (i % 20) * 0.005 + (i // 200) * 0.5,
                "longitude": 74.98 + (i % 10) * 0.005 + (i // 200) * 0.5,
                "biomass_tonnes": 10.0
            }
            for i in range(1000)
        ]
        start_t = time.time()
        clusters = cluster_farms_dbscan(farms, eps_km=8.0, min_samples=3)
        elapsed = time.time() - start_t

        self.assertGreater(len(clusters), 0)
        self.assertLess(elapsed, 1.0, f"DBSCAN took {elapsed:.2f}s, expected < 1.0s")
        print(f"[BENCHMARK] DBSCAN 1000 farms clustered in {elapsed:.3f}s into {len(clusters)} clusters.")

    def test_dbscan_vertical_collinear_farms(self):
        """Stress Test: Exactly vertical collinear points (identical longitude, varying latitude)."""
        farms = [
            {"id": i, "latitude": 30.20 + (i * 0.02), "longitude": 74.9800, "biomass_tonnes": 8.0}
            for i in range(6)
        ]
        clusters = cluster_farms_dbscan(farms, eps_km=8.0, min_samples=3)
        self.assertEqual(len(clusters), 1)
        self.assertEqual(clusters[0]["farms_count"], 6)

    def test_dbscan_diagonal_collinear_farms(self):
        """Stress Test: Diagonal collinear points (lat = lng offset)."""
        farms = [
            {"id": i, "latitude": 30.20 + (i * 0.01), "longitude": 74.90 + (i * 0.01), "biomass_tonnes": 10.0}
            for i in range(5)
        ]
        clusters = cluster_farms_dbscan(farms, eps_km=8.0, min_samples=3)
        self.assertEqual(len(clusters), 1)
        self.assertEqual(clusters[0]["farms_count"], 5)

    def test_dbscan_isolated_outliers_all_noise(self):
        """Stress Test: 5 farms spread hundreds of kilometers apart. All must be classified as noise (-1)."""
        farms = [
            {"id": 1, "latitude": 30.22, "longitude": 74.98, "biomass_tonnes": 10.0}, # Bathinda
            {"id": 2, "latitude": 31.63, "longitude": 74.87, "biomass_tonnes": 10.0}, # Amritsar (~160km)
            {"id": 3, "latitude": 28.61, "longitude": 77.20, "biomass_tonnes": 10.0}, # Delhi (~300km)
            {"id": 4, "latitude": 32.72, "longitude": 74.85, "biomass_tonnes": 10.0}, # Jammu (~280km)
            {"id": 5, "latitude": 26.91, "longitude": 75.78, "biomass_tonnes": 10.0}, # Jaipur (~400km)
        ]
        clusters = cluster_farms_dbscan(farms, eps_km=8.0, min_samples=3)
        self.assertEqual(clusters, [], "All isolated farms should be rejected as noise without forming clusters.")

    def test_websocket_broadcast_disconnection_resilience(self):
        """Stress Test: Simulate active WebSocket connection, sudden disconnect, and broadcast."""
        from app.api.v1.endpoints.websockets import manager
        import asyncio

        class MockWebSocket:
            def __init__(self, should_fail=False):
                self.should_fail = should_fail
                self.sent = []

            async def send_text(self, text):
                if self.should_fail:
                    raise RuntimeError("Client abruptly disconnected")
                self.sent.append(text)

        ws_good = MockWebSocket(should_fail=False)
        ws_bad = MockWebSocket(should_fail=True)

        manager.active_connections = [ws_good, ws_bad]
        asyncio.run(manager.broadcast("test message"))

        self.assertIn(ws_good, manager.active_connections)
        self.assertNotIn(ws_bad, manager.active_connections)
        self.assertEqual(len(ws_good.sent), 1)
        print("[TEST] WebSocket broadcast successfully pruned dead connection and preserved healthy client.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
