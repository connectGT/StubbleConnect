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
    village: 'Talwandi Sabo',
    acres: '10',
    cropType: 'Paddy / Basmati',
    harvestDate: '2026-09-06',
    buyerName: '',
    buyerType: 'Biogas & Bio-CNG',
    buyerCapacity: '500',
    buyerLocation: 'Bathinda City'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!actionType) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (actionType === 'register_field') {
        const coords = PUNJAB_LOCATIONS[formData.village];
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
        setSuccessMsg(`Field registered at ${formData.village}! Assigned to spatial grid.`);
      } else if (actionType === 'add_buyer') {
        const coords = PUNJAB_LOCATIONS[formData.buyerLocation] || PUNJAB_LOCATIONS["Bathinda City"];

        const payload = {
          plant_name: formData.buyerName || 'Industrial Plant',
          facility_type: formData.buyerType,
          daily_capacity_tonnes: parseFloat(formData.buyerCapacity) || 500,
          current_stored_tonnes: 0,
          location: formData.buyerLocation,
          contact: '+910000000000',
          latitude: coords.lat,
          longitude: coords.lng
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
        setSuccessMsg(data.message || 'VRP solver generated optimal pickup routes!');
      }

      // Only auto-close on actual success
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to backend server. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
          ) : errorMsg ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h4 className="text-base font-bold text-red-700">Connection Error</h4>
              <p className="text-xs text-red-600 max-w-xs">{errorMsg}</p>
              <button
                onClick={() => setErrorMsg('')}
                className="mt-2 px-4 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : actionType === 'register_field' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Select Field
                </label>
                <select
                  required
                  value={formData.village}
                  onChange={(e) => {
                    const acreLookup = {
                      'Talwandi Sabo': '10',
                      'Rampura Phul': '12',
                      'Bathinda City': '8',
                      'Mansa': '15',
                      'Goniana': '7',
                      'Bhucho Mandi': '11',
                    };
                    setFormData({
                      ...formData,
                      village: e.target.value,
                      acres: acreLookup[e.target.value] || formData.acres
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Select a saved field...</option>
                  <option value="Talwandi Sabo">Farm A – Talwandi Sabo (10 Acres)</option>
                  <option value="Rampura Phul">Farm B – Rampura Phul (12 Acres)</option>
                  <option value="Bathinda City">Farm C – Bathinda City (8 Acres)</option>
                  <option value="Mansa">Farm D – Mansa (15 Acres)</option>
                  <option value="Goniana">Farm E – Goniana (7 Acres)</option>
                  <option value="Bhucho Mandi">Farm F – Bhucho Mandi (11 Acres)</option>
                  <option value="new">+ Add New Field Location</option>
                </select>
                <p className="text-gray-500 mt-1 text-[10px]">Select a previously saved field to declare its harvest, or add a new one. Area will auto-fill.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Crop Type
                  </label>
                  <select
                    value={formData.cropType}
                    onChange={(e) =>
                      setFormData({ ...formData, cropType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <optgroup label="Paddy Varieties">
                      <option value="Paddy / Basmati">Paddy / Basmati</option>
                      <option value="Paddy / Non-Basmati">Paddy / Non-Basmati</option>
                      <option value="Paddy / PR-126">Paddy / PR-126</option>
                    </optgroup>
                    <optgroup label="Wheat Varieties">
                      <option value="Wheat / HD-3086">Wheat / HD-3086</option>
                      <option value="Wheat / PBW-343">Wheat / PBW-343</option>
                    </optgroup>
                    <optgroup label="Other Crops">
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Maize / Corn">Maize / Corn</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Mustard / Sarson">Mustard / Sarson</option>
                      <option value="Sunflower">Sunflower</option>
                      <option value="Moong Dal">Moong Dal</option>
                      <option value="Chickpea / Chana">Chickpea / Chana</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Harvestable Area (Acres)
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
                <p className="text-gray-500 mt-1 text-[10px]">Our logistics window is 0–5 days from this date. We'll assign a pickup slot accordingly.</p>
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
