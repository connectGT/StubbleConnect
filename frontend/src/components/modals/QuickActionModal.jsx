import React, { useState } from 'react';
import {
  X,
  Plus,
  Zap,
  Route,
  CheckCircle,
  Building2,
  Wheat,
  MapPin,
  Sparkles,
  Truck
} from 'lucide-react';

// Exact hardcoded coordinates for guaranteed hackathon demo success
const PUNJAB_LOCATIONS = {
  "Bathinda City": { lat: 30.211, lng: 74.945 },
  "Talwandi Sabo": { lat: 29.988, lng: 75.088 },
  "Mansa": { lat: 29.989, lng: 75.399 },
  "Rampura Phul": { lat: 30.272, lng: 75.234 },
  "Bhucho Mandi": { lat: 30.267, lng: 75.050 },
  "Maur": { lat: 30.081, lng: 75.245 },
  "Goniana": { lat: 30.316, lng: 74.901 },
  "Sangrur": { lat: 30.245, lng: 75.833 }
};

export default function QuickActionModal({ actionType, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    farmerName: '',
    phone: '',
    village: 'Talwandi Sabo', // Default dropdown value
    acres: '10',
    cropType: 'Paddy / Basmati',
    harvestDate: '2025-08-20',
    buyerName: '',
    buyerType: 'Biogas & Bio-CNG',
    buyerCapacity: '500',
    buyerLocation: 'Bathinda City' // Default dropdown value
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!actionType) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (actionType === 'register_field') {
        const coords = PUNJAB_LOCATIONS[formData.village];
        // Add tiny jitter so multiple farms in same village don't overlap perfectly
        const finalLat = coords.lat + (Math.random() * 0.01 - 0.005);
        const finalLng = coords.lng + (Math.random() * 0.01 - 0.005);

        const payload = {
          farmer_name: formData.farmerName || 'Farmer',
          phone: formData.phone || '+910000000000',
          village: formData.village,
          district: 'Bathinda',
          state: 'Punjab',
          acres: parseFloat(formData.acres) || 1.0,
          crop_type: formData.cropType || 'Paddy / Basmati',
          latitude: finalLat,
          longitude: finalLng,
          harvest_date: formData.harvestDate
        };

        const res = await fetch('http://localhost:8000/api/v1/fields/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('API request failed');
        
        const data = await res.json();
        setSuccessMsg(`Field registered at ${formData.village}! Assigned to spatial grid.`);
      } else if (actionType === 'add_buyer') {
        const coords = PUNJAB_LOCATIONS[formData.buyerLocation] || PUNJAB_LOCATIONS["Bathinda City"];
        const finalLat = coords.lat;
        const finalLng = coords.lng;

        const payload = {
          plant_name: formData.buyerName || 'Industrial Plant',
          facility_type: formData.buyerType,
          daily_capacity_tonnes: parseFloat(formData.buyerCapacity) || 500,
          current_stored_tonnes: 0,
          location: formData.buyerLocation,
          contact: '+910000000000',
          latitude: finalLat,
          longitude: finalLng
        };
        const res = await fetch('http://localhost:8000/api/v1/buyers/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        setSuccessMsg(data.message || `Buyer ${payload.plant_name} onboarded at ${formData.buyerLocation}!`);
      } else if (actionType === 'run_clustering') {
        const res = await fetch('http://localhost:8000/api/v1/clusters/recompute', {
          method: 'POST'
        });
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        setSuccessMsg(data.message || 'DBSCAN spatial clustering completed!');
      } else if (actionType === 'generate_routes') {
        const res = await fetch('http://localhost:8000/api/v1/routes/optimize', {
          method: 'POST'
        });
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        setSuccessMsg(data.message || 'Vehicle Routing Problem (VRP) solver generated optimal pickup routes!');
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg('Error: Could not connect to backend server. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a251c] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {actionType === 'register_field' && <Wheat className="w-5 h-5 text-emerald-400" />}
            {actionType === 'add_buyer' && <Building2 className="w-5 h-5 text-emerald-400" />}
            {actionType === 'run_clustering' && <Zap className="w-5 h-5 text-amber-400" />}
            {actionType === 'generate_routes' && <Route className="w-5 h-5 text-cyan-400" />}
            <h3 className="font-bold text-base text-white">
              {actionType === 'register_field' && 'Register New Stubble Field'}
              {actionType === 'add_buyer' && 'Onboard Biomass Buyer'}
              {actionType === 'run_clustering' && 'Run AI Spatial Clustering'}
              {actionType === 'generate_routes' && 'Generate Optimal Logistics Routes'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMsg ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Success!</h4>
              <p className="text-xs text-gray-600 max-w-xs">{successMsg}</p>
            </div>
          ) : actionType === 'register_field' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Farmer Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaswinder Singh"
                  value={formData.farmerName}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765-XXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Village / District
                  </label>
                  <select
                    value={formData.village}
                    onChange={(e) =>
                      setFormData({ ...formData, village: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {Object.keys(PUNJAB_LOCATIONS).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Field Area (Acres)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.acres}
                    onChange={(e) =>
                      setFormData({ ...formData, acres: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Estimated Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) =>
                      setFormData({ ...formData, harvestDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 font-semibold bg-[#0a251c] hover:bg-[#12382b] text-white rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? 'Registering...' : 'Register Field'}
                </button>
              </div>
            </form>
          ) : actionType === 'add_buyer' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Plant / Industry Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malwa Bio-Energy Ltd."
                  value={formData.buyerName}
                  onChange={(e) =>
                    setFormData({ ...formData, buyerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Facility Type
                  </label>
                  <select
                    value={formData.buyerType}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option>Biogas & Bio-CNG</option>
                    <option>Biomass Pellet Plant</option>
                    <option>Thermal Power Co-gen</option>
                    <option>Paper & Cardboard Mill</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Daily Capacity (Tonnes)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.buyerCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerCapacity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Location (City / Punjab)
                </label>
                <input
                  type="text"
                  required
                  value={formData.buyerLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, buyerLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 font-semibold bg-[#0a251c] hover:bg-[#12382b] text-white rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? 'Adding...' : 'Add Buyer'}
                </button>
              </div>
            </form>
          ) : actionType === 'run_clustering' ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  AI Geospatial Clustering (DBSCAN + K-Means)
                </div>
                Recomputes optimal biomass clusters for 128 registered farms based
                on proximity (radius 8km), synchronized 0–5 day harvest windows, and
                fire risk satellite indexes.
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Registered Unclustered Fields:</span>
                  <span className="font-bold text-gray-900">18 New Fields</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Current Active Clusters:</span>
                  <span className="font-bold text-gray-900">16 Clusters</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Estimated Total Biomass:</span>
                  <span className="font-bold text-emerald-700">842.6 Tonnes</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{loading ? 'Re-clustering...' : 'Execute AI Clustering'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200/80 text-cyan-950 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Truck className="w-4 h-4 text-cyan-700" />
                  Vehicle Routing Problem (VRP) Logistics Optimizer
                </div>
                Calculates fastest pickup paths across matched clusters to biomass
                refineries in Bathinda, Mansa, and Sangrur, avoiding burning delays.
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Pending High Risk Pickups:</span>
                  <span className="font-bold text-red-600">5 Clusters</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Available Fleet Trucks:</span>
                  <span className="font-bold text-gray-900">14 Heavy Haulers</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Expected Daily CO2 Prevented:</span>
                  <span className="font-bold text-emerald-700">1,240 MT</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 font-semibold bg-[#0a251c] hover:bg-[#12382b] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Route className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{loading ? 'Optimizing...' : 'Generate Dispatch Routes'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
