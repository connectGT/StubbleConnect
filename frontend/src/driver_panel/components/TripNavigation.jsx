import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building2,
  Radio,
  Share2
} from 'lucide-react';

export default function TripNavigation({ trip, onUpdateTripStage, onTriggerSOS }) {
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState('Flat Tyre / Mechanical Breakdown');

  const stageStepMap = {
    'NAVIGATING_TO_FARM': 1,
    'AT_FARM_LOADING': 2,
    'IN_TRANSIT_TO_PLANT': 3,
    'WEIGHBRIDGE_GATE': 4,
  };

  const currentStepNum = stageStepMap[trip.status] || 1;

  const handleNextStage = () => {
    if (trip.status === 'NAVIGATING_TO_FARM') onUpdateTripStage('AT_FARM_LOADING');
    else if (trip.status === 'AT_FARM_LOADING') onUpdateTripStage('IN_TRANSIT_TO_PLANT');
    else if (trip.status === 'IN_TRANSIT_TO_PLANT') onUpdateTripStage('WEIGHBRIDGE_GATE');
  };

  return (
    <div className="space-y-5">
      {/* Top Trip Banner Header */}
      <div className="bg-[#0a251c] border border-emerald-500/30 rounded-2xl p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
              Active Dispatch: {trip.dispatchCode}
            </span>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            ₹{trip.totalTripPayoutRupees} Payout
          </span>
        </div>

        <div>
          <h2 className="text-xl font-black text-white">{trip.pickupClusterName}</h2>
          <p className="text-xs text-[#9cb5a9] mt-0.5">
            Destination: <strong className="text-white">{trip.destinationPlantName}</strong>
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-2">
          {[
            { step: 1, label: 'To Farm' },
            { step: 2, label: 'Loading' },
            { step: 3, label: 'To Plant' },
            { step: 4, label: 'Plant Gate' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div
                className={`h-2 rounded-full mb-1 transition-all ${
                  s.step < currentStepNum
                    ? 'bg-emerald-400'
                    : s.step === currentStepNum
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-[#153f31]'
                }`}
              />
              <span className={`text-[10px] font-bold ${s.step <= currentStepNum ? 'text-emerald-300' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main GPS Route Navigation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {currentStepNum <= 2 ? 'Stage 1: Farmer Pickup Navigation' : 'Stage 2: Plant Delivery Navigation'}
              </h3>
              <p className="text-[11px] text-slate-500">Live GPS tracking active on vehicle OBD unit</p>
            </div>
          </div>
        </div>

        {/* Location Details Card */}
        {currentStepNum <= 2 ? (
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Farmer / Pickup Contact</span>
                <h4 className="text-base font-black text-emerald-950 mt-0.5">{trip.farmerName}</h4>
                <p className="text-xs text-emerald-900 mt-0.5">{trip.farmLocation}</p>
              </div>

              <a
                href={`tel:${trip.farmerPhone}`}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Farmer</span>
              </a>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl text-xs text-slate-700 border border-emerald-200/50">
              <strong className="text-emerald-900">Landmark Note:</strong> {trip.landmarkNote}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">Est. Distance to Farm: <strong>{trip.estDistanceToFarmKm} km</strong></span>
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {trip.estDriveTimeToFarmMins} mins away
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Destination Biogas Plant</span>
                <h4 className="text-base font-black text-blue-950 mt-0.5">{trip.destinationPlantName}</h4>
                <p className="text-xs text-blue-900 mt-0.5">{trip.destinationLocation}</p>
              </div>

              <div className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0">
                {trip.plantGateCode}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">Distance to Plant: <strong>{trip.estDistanceFarmToPlantKm} km</strong></span>
              <span className="text-blue-700 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {trip.estDriveTimeFarmToPlantMins} mins ETA
              </span>
            </div>
          </div>
        )}

        {/* Large Touch Action Buttons */}
        <div className="space-y-2 pt-2">
          {currentStepNum < 4 && (
            <button
              onClick={handleNextStage}
              className="w-full py-3.5 bg-[#0a251c] hover:bg-[#12382b] text-emerald-400 font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {currentStepNum === 1 && 'Arrived at Farm (Start Loading) 🚜'}
                {currentStepNum === 2 && 'Finish Loading & Drive to Plant 🚚'}
                {currentStepNum === 3 && 'Arrived at Biogas Plant Gate 🏭'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                currentStepNum <= 2 ? trip.farmLocation : trip.destinationLocation
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              <span>Google Maps Navigation</span>
            </a>

            <button
              onClick={() => setSosModalOpen(true)}
              className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>SOS Breakdown Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* SOS Emergency Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-black text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency Breakdown SOS</span>
              </div>
              <button onClick={() => setSosModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Notify StubbleConnect dispatch center immediately. A mobile mechanical unit or backup vehicle will be rerouted to your coordinates.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Breakdown Type:</label>
              <select
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="Flat Tyre / Mechanical Breakdown">Flat Tyre / Mechanical Breakdown</option>
                <option value="Engine Overheating / Hydraulic Failure">Engine Overheating / Hydraulic Failure</option>
                <option value="Road Blocked / Traffic Obstruction">Road Blocked / Traffic Obstruction</option>
                <option value="Farmer Delay / Access Issue">Farmer Delay / Access Issue</option>
              </select>
            </div>

            <button
              onClick={() => {
                onTriggerSOS(sosReason);
                setSosModalOpen(false);
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              Broadcast Emergency Signal Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
