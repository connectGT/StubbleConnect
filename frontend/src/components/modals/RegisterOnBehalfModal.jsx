import React, { useState } from 'react';
import { X, Users, Phone, MapPin, User, CheckCircle, ChevronDown, BadgeInfo, ChevronsRight } from 'lucide-react';

const PUNJAB_VILLAGES = [
  'Talwandi Sabo', 'Rampura Phul', 'Bathinda City', 'Mansa', 'Goniana',
  'Bhucho Mandi', 'Maur', 'Sangrur', 'Barnala', 'Fazilka',
  'Muktsar', 'Faridkot', 'Ferozpur', 'Tarn Taran', 'Patiala',
];

const RELATIONSHIPS = [
  { value: 'self', label: 'Village Level Entrepreneur (VLE)' },
  { value: 'csc', label: 'Common Service Centre (CSC) Worker' },
  { value: 'ngo', label: 'NGO / Krishi Mitra' },
  { value: 'relative', label: 'Relative / Family Member' },
  { value: 'neighbour', label: 'Neighbour / Fellow Farmer' },
  { value: 'fpo', label: 'FPO / Cooperative Member' },
  { value: 'panchayat', label: 'Gram Panchayat Member' },
];

export default function RegisterOnBehalfModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = Your Info, 2 = Farmer Info, 3 = Field Info
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [registrarData, setRegistrarData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const [farmerData, setFarmerData] = useState({
    name: '',
    phone: '',
    aadhaarLast4: '',
    village: '',
    district: 'Bathinda',
    state: 'Punjab',
  });

  const [fieldData, setFieldData] = useState({
    acres: '',
    cropType: 'Paddy / Basmati',
    harvestDate: '2026-09-06',
    soilType: 'Alluvial',
    irrigationSource: 'Canal',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const coords = { lat: 29.988 + (Math.random() * 0.05 - 0.025), lng: 75.088 + (Math.random() * 0.05 - 0.025) };
      const payload = {
        farmer_name: farmerData.name,
        phone: farmerData.phone || '+910000000000',
        village: farmerData.village,
        district: farmerData.district,
        state: farmerData.state,
        acres: parseFloat(fieldData.acres) || 5.0,
        crop_type: fieldData.cropType,
        latitude: coords.lat,
        longitude: coords.lng,
        harvest_date: fieldData.harvestDate,
        registered_by: registrarData.name,
        registered_by_phone: registrarData.phone,
        registration_type: 'assisted',
      };
      await fetch(`http://${window.location.hostname}:8000/api/v1/fields/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600';
  const labelClass = 'block text-xs font-semibold text-gray-700 mb-1.5';

  const steps = ['Your Details', "Farmer's Info", 'Field Info'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0a251c] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Assisted Registration</h3>
              <p className="text-emerald-400/70 text-[10px]">Registering on behalf of another farmer</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-5 pt-4 pb-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                    step > i + 1 ? 'bg-emerald-500 text-white' :
                    step === i + 1 ? 'bg-[#0a251c] text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${step === i + 1 ? 'text-gray-800' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {done ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900">Farmer Registered!</h4>
              <p className="text-xs text-gray-500 max-w-xs">
                <strong>{farmerData.name || 'The farmer'}</strong> from {farmerData.village} has been successfully registered.
                They'll receive an SMS confirmation on <strong>{farmerData.phone || 'their number'}</strong>.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 font-medium">
                📋 Registered by: {registrarData.name} ({RELATIONSHIPS.find(r => r.value === registrarData.relationship)?.label || 'Assistant'})
              </div>
            </div>
          ) : (
            <>
              {/* Step 1 — Registrar (Your) Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed flex gap-2">
                    <BadgeInfo className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      You are registering <strong>on behalf of another farmer</strong>. Please fill in your own details first so we can track this assisted registration.
                    </span>
                  </div>

                  <div>
                    <label className={labelClass}>Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gurpreet Kaur (CSC Operator)"
                      value={registrarData.name}
                      onChange={(e) => setRegistrarData({ ...registrarData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Your Phone Number</label>
                      <div className="flex">
                        <span className="flex items-center px-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm font-semibold text-gray-600 text-xs">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={registrarData.phone}
                          onChange={(e) => setRegistrarData({ ...registrarData, phone: e.target.value.replace(/\D/, '') })}
                          placeholder="98765XXXXX"
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Your Role / Relationship</label>
                      <select
                        required
                        value={registrarData.relationship}
                        onChange={(e) => setRegistrarData({ ...registrarData, relationship: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select role...</option>
                        {RELATIONSHIPS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Farmer Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed flex gap-2">
                    <User className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                    <span>
                      Now enter the <strong>farmer's personal details</strong>. Aadhaar is optional but helps with government subsidy linkage.
                    </span>
                  </div>

                  <div>
                    <label className={labelClass}>Farmer's Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Balwinder Singh"
                      value={farmerData.name}
                      onChange={(e) => setFarmerData({ ...farmerData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Farmer's Mobile Number</label>
                      <div className="flex">
                        <span className="flex items-center px-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-xs font-semibold text-gray-600">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={farmerData.phone}
                          onChange={(e) => setFarmerData({ ...farmerData, phone: e.target.value.replace(/\D/, '') })}
                          placeholder="(Optional)"
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Aadhaar Last 4 Digits <span className="font-normal text-gray-400">(optional)</span></label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="XXXX"
                        value={farmerData.aadhaarLast4}
                        onChange={(e) => setFarmerData({ ...farmerData, aadhaarLast4: e.target.value.replace(/\D/, '') })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Village / Area</label>
                      <select
                        required
                        value={farmerData.village}
                        onChange={(e) => setFarmerData({ ...farmerData, village: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select village...</option>
                        {PUNJAB_VILLAGES.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>District</label>
                      <select
                        value={farmerData.district}
                        onChange={(e) => setFarmerData({ ...farmerData, district: e.target.value })}
                        className={inputClass}
                      >
                        {['Bathinda', 'Mansa', 'Sangrur', 'Faridkot', 'Muktsar', 'Barnala', 'Fazilka', 'Ferozpur', 'Tarn Taran', 'Patiala'].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Field Info */}
              {step === 3 && (
                <form id="field-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed flex gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                      Enter details about <strong>{farmerData.name || "the farmer"}'s field</strong> in {farmerData.village || 'their village'}.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Field Area (Acres)</label>
                      <input
                        type="number"
                        required
                        min="0.5"
                        step="0.5"
                        placeholder="e.g. 8"
                        value={fieldData.acres}
                        onChange={(e) => setFieldData({ ...fieldData, acres: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Crop Type</label>
                      <select
                        value={fieldData.cropType}
                        onChange={(e) => setFieldData({ ...fieldData, cropType: e.target.value })}
                        className={inputClass}
                      >
                        <optgroup label="Paddy Varieties">
                          <option>Paddy / Basmati</option>
                          <option>Paddy / Non-Basmati</option>
                          <option>Paddy / PR-126</option>
                        </optgroup>
                        <optgroup label="Wheat Varieties">
                          <option>Wheat / HD-3086</option>
                          <option>Wheat / PBW-343</option>
                        </optgroup>
                        <optgroup label="Other Crops">
                          <option>Sugarcane</option>
                          <option>Maize / Corn</option>
                          <option>Cotton</option>
                          <option>Mustard / Sarson</option>
                          <option>Sunflower</option>
                          <option>Moong Dal</option>
                          <option>Chickpea / Chana</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Soil Type</label>
                      <select
                        value={fieldData.soilType}
                        onChange={(e) => setFieldData({ ...fieldData, soilType: e.target.value })}
                        className={inputClass}
                      >
                        <option>Alluvial</option>
                        <option>Sandy Loam</option>
                        <option>Clay</option>
                        <option>Black Cotton</option>
                        <option>Red Laterite</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Irrigation Source</label>
                      <select
                        value={fieldData.irrigationSource}
                        onChange={(e) => setFieldData({ ...fieldData, irrigationSource: e.target.value })}
                        className={inputClass}
                      >
                        <option>Canal</option>
                        <option>Tube Well</option>
                        <option>Rainwater / Barani</option>
                        <option>Drip Irrigation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Estimated Harvest Date</label>
                    <input
                      type="date"
                      required
                      value={fieldData.harvestDate}
                      onChange={(e) => setFieldData({ ...fieldData, harvestDate: e.target.value })}
                      className={inputClass}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Our logistics window is 0–5 days from this date.</p>
                  </div>
                </form>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={step === 1 ? onClose : () => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {step === 1 ? 'Cancel' : '← Back'}
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!registrarData.name || !registrarData.phone || !registrarData.relationship)) return;
                      if (step === 2 && (!farmerData.name || !farmerData.village)) return;
                      setStep(step + 1);
                    }}
                    className="px-5 py-2 text-xs font-bold bg-[#0a251c] hover:bg-[#12382b] text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    Next <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="field-form"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? 'Registering...' : (
                      <><CheckCircle className="w-3.5 h-3.5" /> Complete Registration</>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
