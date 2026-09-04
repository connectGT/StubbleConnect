import React, { useState } from 'react';
import {
  Scale,
  PackageCheck,
  Camera,
  CheckCircle2,
  Droplets,
  Share2,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';

export default function LoadingWeighment({ trip, onConfirmLoading }) {
  const [baleCount, setBaleCount] = useState(trip.balesCount || 42);
  const [estimatedTonnage, setEstimatedTonnage] = useState(trip.targetTonnageTons || 10.4);
  const [moistureValue, setMoistureValue] = useState(trip.moistureSamplePercent || 12.2);
  const [photoUploaded, setPhotoUploaded] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveLoadingDetails = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      onConfirmLoading({
        balesCount: baleCount,
        targetTonnageTons: estimatedTonnage,
        moistureSamplePercent: moistureValue
      });
      setSavedSuccess(false);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#0a251c] border border-emerald-500/20 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Farm Field Weighment & Loading</span>
          </div>
          <h2 className="text-lg font-black text-white">{trip.pickupClusterName}</h2>
          <p className="text-xs text-[#9cb5a9] mt-0.5">Farmer: <strong>{trip.farmerName}</strong> ({trip.farmLocation})</p>
        </div>

        <div className="bg-[#0f3427] border border-[#174635] px-3.5 py-2 rounded-xl text-center">
          <p className="text-[10px] text-[#6b8e81] uppercase font-bold">Truck Capacity</p>
          <p className="text-sm font-black text-emerald-400">10.0 Tons</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-md flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Field loading ticket recorded successfully! Advancing to gate pass...</span>
        </div>
      )}

      {/* Main Loading Inputs Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
          Cargo & Bale Count Details
        </h3>

        <div className="space-y-4 text-xs">
          {/* Bales Count */}
          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Paddy Straw Bales Loaded:</span>
              <span className="text-emerald-700 font-extrabold text-sm">{baleCount} Bales</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBaleCount(Math.max(10, baleCount - 1))}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-lg flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <input
                type="range"
                min="10"
                max="60"
                value={baleCount}
                onChange={(e) => setBaleCount(parseInt(e.target.value))}
                className="flex-1 accent-emerald-600 cursor-pointer"
              />
              <button
                onClick={() => setBaleCount(baleCount + 1)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-lg flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Tonnage Estimation */}
          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Estimated Net Weight (Tonnes):</span>
              <span className="text-emerald-700 font-black text-sm">{estimatedTonnage} Tons</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={estimatedTonnage}
              onChange={(e) => setEstimatedTonnage(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
            />
          </div>

          {/* Handheld Moisture Scan */}
          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" /> Handheld Moisture Sensor Probe:
              </span>
              <span className={`font-black text-xs px-2 py-0.5 rounded ${moistureValue <= 14 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {moistureValue}% Moisture
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="20"
              step="0.1"
              value={moistureValue}
              onChange={(e) => setMoistureValue(parseFloat(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
          </div>

          {/* Photo Proof Uploader */}
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Camera className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-800">Loaded Tipper Photo Proof</p>
            <p className="text-[11px] text-slate-500">Capture photo of loaded truck bed showing strap ties</p>

            <button
              onClick={() => alert('Simulated photo capture of loaded tipper bed!')}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{photoUploaded ? 'Photo Attached (Tap to Retake)' : 'Capture Loaded Truck Photo'}</span>
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleSaveLoadingDetails}
            className="w-full py-3.5 bg-[#0a251c] hover:bg-[#12382b] text-emerald-400 font-black text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Confirm Field Loading & Generate Gate Docket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
