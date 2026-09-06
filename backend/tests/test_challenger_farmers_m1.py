"""
Adversarial Verification Suite for backend/app/api/v1/endpoints/farmers.py
Empirical Challenger: challenger_m1_2
Testing:
1. build_farmer_profile() behavior for Completed vs Pending vs other database statuses.
2. Total earnings and biomass calculations under varied acreage, rates, and legacy states.
3. Edge cases: past vs future harvest dates, invalid dates, null biomass, >26 fields.
"""

import unittest
import sys
from pathlib import Path
from datetime import date, timedelta

backend_path = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Field, Farmer
from app.api.v1.endpoints.farmers import build_farmer_profile, field_status, normalize_phone, generate_fpo_id


class TestChallengerFarmerProfileBehavior(unittest.TestCase):
    """Adversarial stress testing of build_farmer_profile() and farmers API."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        self.db = SessionLocal()
        # Ensure clean state for test phone
        self.test_phone = "9998887770"
        self.clean_up_farmer(self.test_phone)

    def tearDown(self):
        self.clean_up_farmer(self.test_phone)
        self.db.close()

    def clean_up_farmer(self, phone):
        clean_p = normalize_phone(phone)
        self.db.query(Field).filter(Field.phone == clean_p).delete()
        self.db.query(Farmer).filter(Farmer.phone == clean_p).delete()
        self.db.commit()

    def create_farmer(self, name="Challenger Farmer", phone="9998887770"):
        clean_p = normalize_phone(phone)
        farmer = Farmer(
            name=name,
            phone=clean_p,
            village="Test Village",
            district="Bathinda",
            state="Punjab",
            fpo_id="#88991",
            tier="Green",
            joined_date="2026-09-01"
        )
        self.db.add(farmer)
        self.db.commit()
        self.db.refresh(farmer)
        return farmer

    # ─── 1. Status Mapping Tests ──────────────────────────────────────────────

    def test_completed_status_in_db_preserved_regardless_of_harvest_date(self):
        """Verify: Field with status='Completed' always yields status='Completed' and color='emerald',
        regardless of whether harvest_date is future, past, or invalid."""
        farmer = self.create_farmer()
        future_date = (date.today() + timedelta(days=30)).isoformat()
        past_date = (date.today() - timedelta(days=30)).isoformat()

        # Case 1: Completed with future harvest date
        f1 = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=10.0,
            biomass=15.0,
            status="Completed",
            harvest_date=future_date,
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        # Case 2: Completed with past harvest date
        f2 = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=5.0,
            biomass=8.0,
            status="Completed",
            harvest_date=past_date,
            geom="SRID=4326;POINT(74.99 30.23)"
        )
        # Case 3: Completed with empty harvest date
        f3 = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=4.0,
            biomass=6.0,
            status="Completed",
            harvest_date="",
            geom="SRID=4326;POINT(74.97 30.21)"
        )
        self.db.add_all([f1, f2, f3])
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        fields = profile["fields"]
        self.assertEqual(len(fields), 3)

        for f in fields:
            self.assertEqual(f["status"], "Completed", f"Field status was {f['status']}, expected 'Completed'")
            self.assertEqual(f["status_color"], "emerald", f"Status color was {f['status_color']}, expected 'emerald'")

        # Total earnings and biomass must include ALL 3 fields
        expected_biomass = 15.0 + 8.0 + 6.0
        expected_earnings = expected_biomass * 2500
        self.assertEqual(profile["total_biomass_sold"], expected_biomass)
        self.assertEqual(profile["total_earnings"], expected_earnings)

    def test_pending_status_in_db_behavior_across_harvest_dates(self):
        """Adversarial check: Probe what happens to a field with status='Pending' in the database
        under future harvest date, urgent harvest date (0-3 days), and past harvest date."""
        farmer = self.create_farmer()
        future_date = (date.today() + timedelta(days=10)).isoformat()
        urgent_date = (date.today() + timedelta(days=2)).isoformat()
        past_date = (date.today() - timedelta(days=5)).isoformat()

        f_future = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=10.0,
            biomass=10.0,
            status="Pending",
            harvest_date=future_date,
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        f_urgent = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=6.0,
            biomass=6.0,
            status="Pending",
            harvest_date=urgent_date,
            geom="SRID=4326;POINT(74.99 30.23)"
        )
        f_past = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=8.0,
            biomass=8.0,
            status="Pending",
            harvest_date=past_date,
            geom="SRID=4326;POINT(74.97 30.21)"
        )
        self.db.add_all([f_future, f_urgent, f_past])
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        fields = profile["fields"]

        # Future field: mapped to "Registered", "blue"
        self.assertEqual(fields[0]["status"], "Registered")
        self.assertEqual(fields[0]["status_color"], "blue")

        # Urgent field: mapped to "Pickup Scheduled", "amber"
        self.assertEqual(fields[1]["status"], "Pickup Scheduled")
        self.assertEqual(fields[1]["status_color"], "amber")

        # Past field: mapped to "Sold & Paid", "emerald" because field_status converts past dates to Sold & Paid
        self.assertEqual(fields[2]["status"], "Sold & Paid")
        self.assertEqual(fields[2]["status_color"], "emerald")

        # Total earnings and biomass ONLY includes the past field (Sold & Paid)
        self.assertEqual(profile["total_biomass_sold"], 8.0)
        self.assertEqual(profile["total_earnings"], 8.0 * 2500)

    def test_other_statuses_in_db_are_superseded_by_harvest_date(self):
        """Adversarial check: If a field has status='Cancelled' or 'Rejected' in DB,
        does field_status still mark it 'Sold & Paid' if harvest_date is past?"""
        farmer = self.create_farmer()
        past_date = (date.today() - timedelta(days=10)).isoformat()

        f_cancelled = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=5.0,
            biomass=5.0,
            status="Cancelled",
            harvest_date=past_date,
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        self.db.add(f_cancelled)
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        # Because build_farmer_profile only checks `if f.status == "Completed"`,
        # any other DB status with a past harvest date is evaluated as 'Sold & Paid'!
        self.assertEqual(profile["fields"][0]["status"], "Sold & Paid")
        self.assertEqual(profile["total_biomass_sold"], 5.0)

    # ─── 2. Calculations: Earnings, Biomass, and Fallbacks ────────────────────

    def test_biomass_fallback_when_f_biomass_is_none_or_zero(self):
        """Verify: When f.biomass is None or 0, fallback is round(acres * 2.5, 1)."""
        farmer = self.create_farmer()
        f_none_biomass = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=7.0,
            biomass=None,
            status="Completed",
            harvest_date="",
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        f_zero_biomass = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=4.2,
            biomass=0.0,
            status="Completed",
            harvest_date="",
            geom="SRID=4326;POINT(74.99 30.23)"
        )
        self.db.add_all([f_none_biomass, f_zero_biomass])
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        fields = profile["fields"]

        # 7.0 * 2.5 = 17.5
        self.assertEqual(fields[0]["biomass_est"], 17.5)
        # 4.2 * 2.5 = 10.5
        self.assertEqual(fields[1]["biomass_est"], 10.5)

        total_expected_biomass = 17.5 + 10.5
        self.assertEqual(profile["total_biomass_sold"], total_expected_biomass)
        self.assertEqual(profile["total_earnings"], total_expected_biomass * 2500)

    def test_zero_acres_and_zero_biomass(self):
        """Edge case: Field with 0 acres and 0 biomass produces 0 earnings and 0 biomass."""
        farmer = self.create_farmer()
        f_zero = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=0.0,
            biomass=0.0,
            status="Completed",
            harvest_date="",
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        self.db.add(f_zero)
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        self.assertEqual(profile["fields"][0]["biomass_est"], 0.0)
        self.assertEqual(profile["total_biomass_sold"], 0.0)
        self.assertEqual(profile["total_earnings"], 0.0)

    def test_fractional_tonnage_rounding(self):
        """Precision test: Verify float rounding of total_biomass_sold (1 decimal) and total_earnings (0 decimal)."""
        farmer = self.create_farmer()
        f_frac = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=3.33,
            biomass=4.555,
            status="Completed",
            harvest_date="",
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        self.db.add(f_frac)
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        self.assertEqual(profile["total_biomass_sold"], 4.6)
        # 4.555 * 2500 = 11387.5 -> rounded to 0 decimals = 11388.0
        self.assertEqual(profile["total_earnings"], 11388.0)

    # ─── 3. Field Naming Index Overflow Test ──────────────────────────────────

    def test_field_naming_overflow_beyond_26_fields(self):
        """Adversarial boundary: Register 28 fields.
        chr(65+i) produces letters A-Z for first 26 fields, then '[' and '\\' for 27th and 28th."""
        farmer = self.create_farmer()
        fields_to_add = []
        for i in range(28):
            f = Field(
                farmer_name=farmer.name,
                phone=farmer.phone,
                acres=1.0,
                biomass=1.0,
                status="Pending",
                harvest_date=(date.today() + timedelta(days=10)).isoformat(),
                geom=f"SRID=4326;POINT({74.98 + i*0.001} 30.22)"
            )
            fields_to_add.append(f)
        self.db.add_all(fields_to_add)
        self.db.commit()

        profile = build_farmer_profile(farmer, self.db)
        fields = profile["fields"]
        self.assertEqual(len(fields), 28)
        self.assertEqual(fields[0]["name"], "Farm A")
        self.assertEqual(fields[25]["name"], "Farm Z")
        # 27th field is Farm [ (chr(91)), 28th is Farm \ (chr(92))
        self.assertEqual(fields[26]["name"], "Farm [")
        self.assertEqual(fields[27]["name"], "Farm \\")

    # ─── 4. Endpoint Level Integration: GET /api/v1/farmers/me ────────────────

    def test_get_farmer_profile_endpoint_consistency(self):
        """Integration: Query GET /api/v1/farmers/me?phone=... and verify schema contract."""
        farmer = self.create_farmer()
        f = Field(
            farmer_name=farmer.name,
            phone=farmer.phone,
            acres=8.0,
            biomass=12.0,
            status="Completed",
            harvest_date="2026-09-01",
            geom="SRID=4326;POINT(74.98 30.22)"
        )
        self.db.add(f)
        self.db.commit()

        res = self.client.get(f"/api/v1/farmers/me?phone={farmer.phone}")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]

        self.assertEqual(data["name"], farmer.name)
        self.assertEqual(data["phone"], farmer.phone)
        self.assertEqual(data["total_biomass_sold"], 12.0)
        self.assertEqual(data["total_earnings"], 30000.0)
        self.assertEqual(len(data["fields"]), 1)
        self.assertEqual(data["fields"][0]["status"], "Completed")
        self.assertEqual(data["fields"][0]["status_color"], "emerald")


if __name__ == "__main__":
    unittest.main(verbosity=2)
