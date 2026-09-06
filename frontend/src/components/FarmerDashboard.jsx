import React, { useState, useEffect } from 'react';
import {
  Sprout, IndianRupee, Leaf, MapPin, Truck, CheckCircle2,
  Calendar, Bell, MessageCircle, Phone, ChevronRight,
  X, Wheat, Plus, TrendingUp, Shield, CheckCircle, PlayCircle
} from 'lucide-react';
import { Joyride, STATUS } from 'react-joyride';

// ─── Price Trend Data ──────────────────────────────────────────────────────────
const PRICE_POINTS = [2200, 2350, 2300, 2450, 2500, 2480, 2500];

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#10b981' }) {
  const w = 120, h = 36, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(',');
        return i === pts.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill={color} />
          : null;
      })}
    </svg>
  );
}

// ─── Inline Modals ──────────────────────────────────────────────────────────────
function FieldDetailModal({ field, onClose, onShowToast }) {
  if (!field) return null;
  const colors = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700', gray: 'bg-gray-100 text-gray-700', grey: 'bg-gray-100 text-gray-700' };
  const statusColor = field.status_color || field.statusColor || 'blue';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0a251c] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">{field.name} — {field.location}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[statusColor] || colors.blue}`}>{field.status}</span>
          </div>
          {[
            ['Area', `${field.acres || 0} Acres`],
            ['Crop Type', field.crop_type || field.crop || 'Paddy'],
            ['Harvest Date', field.harvest_date || field.harvestDate || 'Not set'],
            ['Est. Biomass', `${field.biomass_est ?? field.biomassEst ?? field.biomass ?? 0} Tonnes`],
            ['Nearest Buyer', field.nearestBuyer || 'GreenFuel Bio-CNG Plant'],
            ['Distance to Buyer', field.distance || '12 km'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-gray-900">{v}</span>
            </div>
          ))}
          <div className="pt-2 flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer hover:bg-gray-200">Close</button>
            <button onClick={() => { if (onShowToast) onShowToast('Map view coming soon!'); onClose(); }}
              className="flex-1 py-2 bg-[#0a251c] text-white font-semibold rounded-lg text-xs cursor-pointer hover:bg-[#12382b] flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PickupOTPModal({ onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0a251c] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Pickup Confirmation</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 text-center space-y-4">
          {!confirmed ? (
            <>
              <p className="text-xs text-gray-500">Share this code with the truck driver to confirm your biomass pickup</p>
              <div className="py-4">
                <div className="text-5xl font-black text-[#0a251c] tracking-[0.3em]">7482</div>
                <p className="text-xs text-gray-400 mt-2">Expires in 15 minutes</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                🔐 Only share this code after the truck has arrived at your farm and you have verified the driver's ID.
              </div>
              <button onClick={() => setConfirmed(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm cursor-pointer transition-colors">
                ✓ Pickup Confirmed
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900">Pickup Confirmed!</h4>
              <p className="text-xs text-gray-500">Your biomass pickup from Farm A has been confirmed. Payment will be processed within 24 hours.</p>
              <button onClick={onClose}
                className="w-full py-2.5 bg-[#0a251c] text-white font-bold rounded-xl text-sm cursor-pointer">
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterHarvestModal({ farmerUser, onClose, onSuccess, t }) {
  const [formData, setFormData] = useState({
    field: 'Farm A — Talwandi Sabo',
    customVillage: '',
    crop: 'Paddy / Basmati',
    acres: '10',
    harvestDate: '2026-09-06'
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fieldLocations = {
    'Farm A — Talwandi Sabo': { village: 'Talwandi Sabo', acres: '10', lat: 29.988, lng: 75.088 },
    'Farm B — Rampura Phul': { village: 'Rampura Phul', acres: '14', lat: 30.272, lng: 75.234 },
    'Farm C — Goniana': { village: 'Goniana', acres: '7', lat: 30.316, lng: 74.901 },
    'Farm D — Bathinda City': { village: 'Bathinda City', acres: '8', lat: 30.211, lng: 74.945 },
    'Farm E — Mansa': { village: 'Mansa', acres: '12', lat: 29.989, lng: 75.399 }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const isCustom = formData.field === 'new';
      const locInfo = isCustom
        ? { village: formData.customVillage.trim() || 'Bathinda Area', lat: 30.211, lng: 74.945 }
        : (fieldLocations[formData.field] || { village: 'Bathinda City', lat: 30.211, lng: 74.945 });

      const rawPhone = (farmerUser?.phone || '9876543210').replace(/[\s-+]/g, '');
      const normalizedPhone = rawPhone.length > 10 && rawPhone.startsWith('91') ? rawPhone.slice(2) : (rawPhone || '9876543210');

      const finalLat = locInfo.lat + (Math.random() * 0.01 - 0.005);
      const finalLng = locInfo.lng + (Math.random() * 0.01 - 0.005);

      const payload = {
        farmer_name: farmerUser?.name || 'Farmer',
        phone: normalizedPhone,
        village: locInfo.village,
        district: farmerUser?.district || 'Bathinda',
        state: farmerUser?.state || 'Punjab',
        acres: parseFloat(formData.acres) || 5.0,
        crop_type: formData.crop || 'Paddy / Basmati',
        latitude: finalLat,
        longitude: finalLng,
        harvest_date: formData.harvestDate,
        status: 'Pending'
      };

      const res = await fetch(`http://${window.location.hostname}:8000/api/v1/fields/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to register field with backend');
      }

      setDone(true);
      window.dispatchEvent(new CustomEvent('refresh-dashboard-data'));
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not register field. Please ensure backend server is reachable on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0a251c] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Wheat className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">{t('report_harvest')}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          {errorMsg && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {errorMsg}
            </div>
          )}
          {done ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-bold text-gray-900">Harvest Registered!</p>
              <p className="text-xs text-gray-500">Your harvest has been saved to the database. We'll assign a pickup slot soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Select Field</label>
                <select required value={formData.field}
                  onChange={e => setFormData({
                    ...formData,
                    field: e.target.value,
                    acres: fieldLocations[e.target.value]?.acres || formData.acres
                  })}
                  className={inputClass}>
                  <option value="">Choose a saved field...</option>
                  {Object.keys(fieldLocations).map(f => <option key={f} value={f}>{f}</option>)}
                  <option value="new">+ Add New Field Location</option>
                </select>
              </div>

              {formData.field === 'new' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Custom Village / Field Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sangat Mandi, Bathinda"
                    value={formData.customVillage}
                    onChange={e => setFormData({ ...formData, customVillage: e.target.value })}
                    className={inputClass}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Crop Type</label>
                  <select value={formData.crop} onChange={e => setFormData({ ...formData, crop: e.target.value })} className={inputClass}>
                    <optgroup label="Paddy"><option>Paddy / Basmati</option><option>Paddy / Non-Basmati</option><option>Paddy / PR-126</option></optgroup>
                    <optgroup label="Wheat"><option>Wheat / HD-3086</option><option>Wheat / PBW-343</option></optgroup>
                    <optgroup label="Other"><option>Sugarcane</option><option>Maize / Corn</option><option>Cotton</option><option>Mustard / Sarson</option><option>Sunflower</option><option>Moong Dal</option><option>Chickpea / Chana</option></optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Harvestable Area (Acres)</label>
                  <input type="number" required min="0.5" step="0.5" value={formData.acres}
                    onChange={e => setFormData({ ...formData, acres: e.target.value })}
                    className={inputClass} placeholder="e.g. 10" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Estimated Harvest Date</label>
                <input type="date" required value={formData.harvestDate}
                  onChange={e => setFormData({ ...formData, harvestDate: e.target.value })}
                  className={inputClass} />
                <p className="text-gray-400 mt-1 text-[10px]">Logistics window: 0–5 days from this date.</p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg cursor-pointer">
                  {loading ? 'Submitting...' : 'Register Harvest'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function FarmerDashboard({
  farmerUser,
  fields: propFields,
  activeTab: propActiveTab,
  onTabChange,
  onLogout: _onLogout,
  onRegisterClick: _onRegisterClick
}) {
  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = propActiveTab || internalTab;

  const setActiveTab = (tab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (propActiveTab) {
      setInternalTab(propActiveTab);
    }
  }, [propActiveTab]);
  const [selectedField, setSelectedField] = useState(null);
  const [showPickupOTP, setShowPickupOTP] = useState(false);
  const [showRegisterHarvest, setShowRegisterHarvest] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('stubble_tutorial_done') ? false : true;
  });
  const [etaMinutes, setEtaMinutes] = useState(47);
  const [toast, setToast] = useState('');
  const [lang, _setLang] = useState('en');

  const dict = {
    en: {
      overview: 'Overview',
      fields: 'My Fields',
      payments: 'Payments',
      alerts: 'Alerts',
      welcome: 'Welcome back',
      welcome_title: 'Welcome to StubbleConnect!',
      welcome_desc: 'To start earning, you need to register your first field location and estimated harvest date.',
      register_first: 'Register Your First Field',
      total_biomass_sold: 'Total Biomass Sold',
      total_earnings: 'Total Earnings',
      carbon_credits: 'Carbon Credits Earned',
      biomass_price: 'Current Biomass Price (MSP)',
      active_pickup: 'Active Harvest Pickup',
      recent_transactions: 'Payment History',
      registered_fields: 'registered fields',
      report_harvest: 'Report New Harvest',
      no_fields: 'No Fields Registered'
    },
    pb: {
      overview: 'ਸੰਖੇਪ',
      fields: 'ਮੇਰੇ ਖੇਤ',
      payments: 'ਭੁਗਤਾਨ',
      alerts: 'ਸੂਚਨਾਵਾਂ',
      welcome: 'ਵਾਪਸ ਸੁਆਗਤ ਹੈ',
      welcome_title: 'StubbleConnect ਵਿੱਚ ਸੁਆਗਤ ਹੈ!',
      welcome_desc: 'ਕਮਾਈ ਸ਼ੁਰੂ ਕਰਨ ਲਈ, ਆਪਣੇ ਪਹਿਲੇ ਖੇਤ ਦੀ ਸਥਿਤੀ ਅਤੇ ਅਨੁਮਾਨਿਤ ਵਾਢੀ ਦੀ ਤਾਰੀਖ ਦਰਜ ਕਰੋ।',
      register_first: 'ਆਪਣਾ ਪਹਿਲਾ ਖੇਤ ਰਜਿਸਟਰ ਕਰੋ',
      total_biomass_sold: 'ਕੁੱਲ ਬਾਇਓਮਾਸ ਵੇਚਿਆ',
      total_earnings: 'ਕੁੱਲ ਕਮਾਈ',
      carbon_credits: 'ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ ਕਮਾਏ',
      biomass_price: 'ਮੌਜੂਦਾ ਬਾਇਓਮਾਸ ਕੀਮਤ (MSP)',
      active_pickup: 'ਸਰਗਰਮ ਵਾਢੀ ਪਿਕਅੱਪ',
      recent_transactions: 'ਭੁਗਤਾਨ ਇਤਿਹਾਸ',
      registered_fields: 'ਰਜਿਸਟਰਡ ਖੇਤ',
      report_harvest: 'ਨਵੀਂ ਵਾਢੀ ਰਿਪੋਰਟ ਕਰੋ',
      no_fields: 'ਕੋਈ ਖੇਤ ਰਜਿਸਟਰਡ ਨਹੀਂ'
    },
    hi: {
      overview: 'सारांश',
      fields: 'मेरे खेत',
      payments: 'भुगतान',
      alerts: 'सूचनाएं',
      welcome: 'वापस स्वागत है',
      welcome_title: 'StubbleConnect में स्वागत है!',
      welcome_desc: 'कमाई शुरू करने के लिए, अपने पहले खेत की जगह और अनुमानित कटाई की तारीख दर्ज करें।',
      register_first: 'अपना पहला खेत पंजीकृत करें',
      total_biomass_sold: 'कुल बायोमास बेचा',
      total_earnings: 'कुल कमाई',
      carbon_credits: 'अर्जित कार्बन क्रेडिट',
      biomass_price: 'वर्तमान बायोमास मूल्य (MSP)',
      active_pickup: 'सक्रिय फसल पिकअप',
      recent_transactions: 'भुगतान इतिहास',
      registered_fields: 'पंजीकृत खेत',
      report_harvest: 'नई फसल रिपोर्ट करें',
      no_fields: 'कोई खेत पंजीकृत नहीं'
    }
  };
  const t = (k) => dict[lang] ? (dict[lang][k] || dict.en[k] || k) : (dict.en[k] || k);


  // Simulate live truck ETA countdown (bug #4)
  useEffect(() => {
    const interval = setInterval(() => {
      setEtaMinutes(m => (m > 1 ? m - 1 : m));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const name = farmerUser?.name || 'Farmer';
  const village = farmerUser?.village || 'Punjab';
  const fpoId = farmerUser?.fpoId || farmerUser?.fpo_id || '#88392';
  const tier = farmerUser?.tier || 'Green';
  const _joinedDate = farmerUser?.joinedDate || farmerUser?.joined_date || '—';
  
  const myFields = propFields || farmerUser?.fields || [];
  const hasFields = myFields.length > 0;

  // Calculate payments dynamically from completed fields (R1 Acceptance Criteria)
  const completedFields = myFields
    .filter(f => f.status === 'Completed' || f.status === 'Sold & Paid')
    .map(f => {
      const tonnes = Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0);
      const rate = Number(f.rate || 2500);
      const calculatedPayout = tonnes * rate;
      return {
        ...f,
        calculatedTonnes: tonnes,
        calculatedRate: rate,
        calculatedPayout
      };
    });

  const totalPaid = completedFields.reduce((acc, f) => acc + (f.calculatedPayout || (Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0) * Number(f.rate || 2500))), 0);

  // Dynamically generate notifications from real field states (R1 Acceptance Criteria)
  const dynamicAlerts = React.useMemo(() => {
    const alerts = [];
    let id = 1;

    myFields.forEach((field, i) => {
      const fieldName = field.name || `Farm ${String.fromCharCode(65 + i)}`;
      const location = field.location || field.village || village;
      const status = field.status || 'Registered';
      const tonnes = Number(field.biomass_est || field.biomass || ((field.acres || 0) * 2.5) || 0);
      const rate = Number(field.rate || 2500);
      const payout = tonnes * rate;
      const harvestDate = field.harvest_date || field.harvestDate || 'Upcoming';

      if (status === 'Completed' || status === 'Sold & Paid') {
        alerts.push({
          id: id++,
          icon: '💰',
          text: `Biomass collection completed for ${fieldName}. Payout of ₹${payout.toLocaleString()} processed.`,
          time: `Completed (${harvestDate})`,
          type: 'success'
        });
        alerts.push({
          id: id++,
          icon: '✅',
          text: `Field collection verified and closed for ${fieldName} in ${location} (${tonnes}T collected).`,
          time: 'Verified',
          type: 'success'
        });
      } else if (status === 'Pickup Scheduled') {
        alerts.push({
          id: id++,
          icon: '🚛',
          text: `Logistics scheduled for ${fieldName} — Pickup pending. Truck assigned for collection.`,
          time: `Target Date: ${harvestDate}`,
          type: 'info'
        });
        alerts.push({
          id: id++,
          icon: '📋',
          text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'}).`,
          time: 'Active',
          type: 'neutral'
        });
      } else {
        // Pending or Registered
        alerts.push({
          id: id++,
          icon: '📋',
          text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'}). Pending cluster assignment.`,
          time: `Harvest: ${harvestDate}`,
          type: 'info'
        });
        alerts.push({
          id: id++,
          icon: '🌱',
          text: `${fieldName} queued for biomass cluster aggregation & buyer matching.`,
          time: 'Pending Route',
          type: 'neutral'
        });
      }

      // Check for approaching harvest window
      if (field.harvest_date || field.harvestDate) {
        try {
          const hdStr = field.harvest_date || field.harvestDate;
          const diff = Math.ceil((new Date(hdStr) - new Date()) / (1000 * 60 * 60 * 24));
          if (diff <= 3 && status !== 'Completed' && status !== 'Sold & Paid') {
            alerts.push({
              id: id++,
              icon: '⚠️',
              text: `Harvest window closing in ${Math.max(0, diff)} days for ${fieldName}`,
              time: 'Urgent',
              type: 'warning'
            });
          }
        } catch { /* ignore date parse errors */ }
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        id: id++,
        icon: '🌾',
        text: `Welcome to StubbleConnect, ${name}! Your profile is verified with FPO ${fpoId}.`,
        time: 'Just now',
        type: 'neutral'
      });
      alerts.push({
        id: id++,
        icon: '📢',
        text: 'No active fields found. Register your field to begin biomass collection and logistics matching.',
        time: 'Action Required',
        type: 'info'
      });
    }

    return alerts;
  }, [myFields, name, village, fpoId]);

  const tabs = [
    { id: 'overview', label: t('overview') },
    { id: 'fields', label: t('fields') },
    { id: 'payments', label: t('payments') },
    { id: 'alerts', label: t('alerts'), badge: dynamicAlerts.length },
  ];

  const statusColors = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    grey: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4 pb-8">
      <Joyride
        steps={[
          {
            target: '.tour-welcome',
            content: 'Welcome to your dashboard! This is your control center for selling crop residue.',
            disableBeacon: true,
          },
          {
            target: '.tour-tabs',
            content: 'Use these tabs to switch between your fields, payments, and notifications.',
          },
          {
            target: '.tour-register-btn',
            content: 'Start by registering your first field and harvest date here so buyers can match with you.',
          }
        ]}
        run={showTutorial}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={(data) => {
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
            setShowTutorial(false);
            localStorage.setItem('stubble_tutorial_done', 'true');
          }
        }}
        styles={{
          options: { primaryColor: '#059669', zIndex: 1000 }
        }}
      />

      {/* ── Welcome Banner (bug #3, #6, #16 fixed) ── */}
      <div className="tour-welcome bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t('welcome')}, {name} 👋</h2>
          <p className="text-emerald-100 text-sm mt-1">{village} • FPO ID: {fpoId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTutorial(true)}
            className="px-3 py-1.5 bg-emerald-600/50 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-sm">
            <PlayCircle className="w-3.5 h-3.5" /> Tutorial
          </button>
          <button className="px-4 py-2 bg-white text-emerald-800 font-bold text-sm rounded-lg shadow-sm">
            My Tier: {tier}
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="tour-tabs bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              {tab.label}
              {tab.badge && <span className="w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <div className="p-5 space-y-5">
            {!hasFields && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl mt-0.5">🌱</span>
                <div>
                  <h3 className="font-bold text-emerald-900">{t('welcome_title')}</h3>
                  <p className="text-xs text-emerald-700 mt-1">{t('welcome_desc')}</p>
                  <button onClick={() => setShowRegisterHarvest(true)}
                    className="tour-register-btn mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                    Register Your First Field
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards (bug #5 — clickable) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2 bg-emerald-100 rounded-lg w-fit mb-2"><Sprout className="w-4 h-4 text-emerald-600" /></div>
                <p className="text-xs text-gray-500">{t('total_biomass_sold')}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{farmerUser?.total_biomass_sold || 0} <span className="text-sm font-normal text-gray-500">T</span></p>
              </div>
              <button onClick={() => setActiveTab('payments')}
                className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg"><IndianRupee className="w-4 h-4 text-blue-600" /></div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-500">{t('total_earnings')}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">₹{(farmerUser?.total_earnings || 0).toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">View Payment History →</p>
              </button>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2 bg-amber-100 rounded-lg w-fit mb-2"><Leaf className="w-4 h-4 text-amber-600" /></div>
                <p className="text-xs text-gray-500">{t('carbon_credits')}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{(farmerUser?.total_biomass_sold || 0) * 0.75} <span className="text-sm font-normal text-gray-500">Credits</span></p>
                <p className="text-[10px] text-gray-400 mt-0.5">≈ ₹{((farmerUser?.total_biomass_sold || 0) * 0.75 * 50).toLocaleString()} redeemable value</p>
              </div>
            </div>

            {/* Biomass Price Sparkline (feature #10) */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{t('biomass_price')}</p>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">₹2,500<span className="text-sm font-normal text-gray-500">/tonne</span></p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +13.6% from last season
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Sparkline data={PRICE_POINTS} color="#059669" />
                <p className="text-[9px] text-gray-400">7-day trend</p>
              </div>
            </div>

            {/* Active Pickup Tracker (bug #4 — live ETA, bug #18 — responsive flex) */}
            {hasFields && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">{t('active_pickup')}</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wide">In Progress</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Route #R-07</h4>
                    <p className="text-xs text-gray-500">Destination: GreenFuel Plant, Bathinda</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-700">{etaMinutes} min</p>
                    <p className="text-[10px] text-gray-400">ETA</p>
                  </div>
                </div>

                {/* Responsive flex-based timeline (bug #18 fixed) */}
                <div className="flex items-center gap-0">
                  {['Registered', 'Clustered', 'En Route', 'Collected'].map((label, i) => {
                    const done = i < 2;
                    const active = i === 2;
                    return (
                      <React.Fragment key={label}>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-500 text-white' : 'bg-gray-200'
                          }`}>
                            {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Truck className="w-3.5 h-3.5" /> : null}
                          </div>
                          <span className={`text-[10px] font-semibold ${done ? 'text-emerald-700' : active ? 'text-amber-700' : 'text-gray-400'}`}>{label}</span>
                        </div>
                        {i < 3 && (
                          <div className={`flex-1 h-1 mx-1 rounded-full ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Confirm Pickup OTP button (feature #7) */}
                <button onClick={() => setShowPickupOTP(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Shield className="w-4 h-4" /> Confirm Pickup with OTP
                </button>
              </div>
            </div>
            )}

            {/* WhatsApp / SMS toggles (feature #8) */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" /> Notification Preferences
              </h3>
              {[
                { label: 'WhatsApp Updates', desc: 'Pickup alerts, match notifications', icon: MessageCircle, color: 'text-green-500', state: whatsappEnabled, setState: setWhatsappEnabled },
                { label: 'SMS Alerts', desc: 'OTPs, payment confirmations', icon: Phone, color: 'text-blue-500', state: smsEnabled, setState: setSmsEnabled },
              ].map(({ label, desc, icon: Icon, color, state, setState }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <button onClick={() => { setState(!state); showToast(`${label} ${!state ? 'enabled' : 'disabled'}`); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${state ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${state ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ MY FIELDS TAB ═══════════ */}
        {activeTab === 'fields' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{myFields.length} {t('registered_fields')}</p>
              {/* Bug #1 fixed — opens farmer-specific harvest modal */}
              <button onClick={() => setShowRegisterHarvest(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" /> Report New Harvest
              </button>
            </div>

            {hasFields ? (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {myFields.map(field => (
                  <button key={field.id} onClick={() => setSelectedField(field)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{field.name} — {field.location}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> {field.harvest_date || field.harvestDate || 'Not set'} · {field.acres} Acres · {field.crop_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <span className="font-bold text-gray-900 text-sm">{field.biomass_est} T</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[field.status_color] || statusColors.blue}`}>
                        {field.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('no_fields')}</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">Register your first field to start selling biomass and earning carbon credits.</p>
                <button onClick={() => setShowRegisterHarvest(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors">
                  Register Your First Field →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ PAYMENTS TAB (feature #9) ═══════════ */}
        {activeTab === 'payments' && (
          <div className="p-5 space-y-4">
            {completedFields.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IndianRupee className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No Completed Field Payouts</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Payouts are calculated dynamically once biomass collection is marked Completed.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">{t('recent_transactions')}</h3>
                  <span className="text-xs text-gray-400">All amounts in ₹</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border border-gray-100 rounded-lg">
                        {['Date', 'Field', 'Tonnes', 'Rate/T', 'Total', 'Mode', 'Status'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-600 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {completedFields.map((f, i) => {
                        const tonnes = f.calculatedTonnes;
                        const rate = f.calculatedRate;
                        const total = f.calculatedPayout;
                        const dateVal = f.harvest_date || f.harvestDate || 'Completed';
                        const fieldName = f.name || `Farm ${String.fromCharCode(65 + i)}`;
                        const mode = f.payment_mode || (i % 2 === 0 ? 'UPI' : 'Direct Bank Transfer');
                        return (
                          <tr key={f.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2.5 text-gray-600">{dateVal}</td>
                            <td className="px-3 py-2.5 font-medium text-gray-900">{fieldName}</td>
                            <td className="px-3 py-2.5 text-gray-700">{tonnes}</td>
                            <td className="px-3 py-2.5 text-gray-700">₹{rate.toLocaleString()}</td>
                            <td className="px-3 py-2.5 font-bold text-gray-900">₹{total.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-gray-600">{mode}</td>
                            <td className="px-3 py-2.5">
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-700">
                                Paid
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50">
                        <td colSpan={4} className="px-3 py-2.5 font-bold text-gray-700">Total Paid</td>
                        <td className="px-3 py-2.5 font-black text-emerald-700">
                          ₹{totalPaid.toLocaleString()}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════ ALERTS TAB (feature #11) ═══════════ */}
        {activeTab === 'alerts' && (
          <div className="p-5 space-y-3">
            {dynamicAlerts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No Alerts</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">You're all caught up! Notifications will appear here when you have activity.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Recent Notifications</h3>
                  <span className="text-xs text-gray-400">{dynamicAlerts.length} updates</span>
                </div>
                {dynamicAlerts.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
                    n.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
                    n.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    n.type === 'info' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <span className="text-base mt-0.5 shrink-0">{n.icon}</span>
                    <div className="flex-1">
                      <p className={`font-medium leading-relaxed ${
                        n.type === 'success' ? 'text-emerald-800' :
                        n.type === 'warning' ? 'text-amber-800' :
                        n.type === 'info' ? 'text-blue-800' :
                        'text-gray-700'
                      }`}>{n.text}</p>
                      <p className="text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>



      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0a251c] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* ── Modals ── */}
      {selectedField && <FieldDetailModal field={selectedField} onClose={() => setSelectedField(null)} onShowToast={showToast} />}
      {showPickupOTP && <PickupOTPModal onClose={() => setShowPickupOTP(false)} />}
      {showRegisterHarvest && (
        <RegisterHarvestModal
          farmerUser={farmerUser}
          onClose={() => setShowRegisterHarvest(false)}
          onSuccess={() => {
            showToast('Harvest registered successfully!');
            window.dispatchEvent(new CustomEvent('refresh-dashboard-data'));
          }}
          t={t}
        />
      )}
      
    </div>
  );
}
