import React from 'react';
import {
  QrCode,
  CheckCircle2,
  FileText,
  Share2,
  Truck,
  Building2,
  Printer,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function DigitalConsignmentQR({ trip }) {
  const gateToken = `PARALI-QR-${trip.tripId.replace('TRIP-', '')}-${trip.truckNumber.replace(/[^A-Z0-9]/g, '')}`;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#0a251c] border border-emerald-500/30 rounded-2xl p-5 text-white shadow-xl text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Biomass e-Way Gate Pass</span>
        </div>
        <h2 className="text-xl font-black text-white">{trip.destinationPlantName}</h2>
        <p className="text-xs text-[#9cb5a9]">Show this QR token at the plant gate weighbridge terminal scanner</p>
      </div>

      {/* Main QR Docket Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md text-center space-y-5">
        {/* Visual QR Code Container */}
        <div className="bg-slate-50 border-2 border-emerald-500/40 rounded-3xl p-6 max-w-xs mx-auto shadow-inner relative group">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            {/* SVG Simulated QR Code */}
            <svg viewBox="0 0 100 100" className="w-48 h-48 fill-slate-900">
              <rect x="0" y="0" width="30" height="30" fill="#0a251c" />
              <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
              <rect x="9" y="9" width="12" height="12" fill="#0a251c" />

              <rect x="70" y="0" width="30" height="30" fill="#0a251c" />
              <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
              <rect x="79" y="9" width="12" height="12" fill="#0a251c" />

              <rect x="0" y="70" width="30" height="30" fill="#0a251c" />
              <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
              <rect x="9" y="79" width="12" height="12" fill="#0a251c" />

              {/* Internal patterns */}
              <rect x="35" y="5" width="10" height="10" fill="#10b981" />
              <rect x="50" y="5" width="15" height="10" fill="#0a251c" />
              <rect x="35" y="20" width="25" height="10" fill="#0a251c" />

              <rect x="5" y="35" width="15" height="10" fill="#0a251c" />
              <rect x="25" y="35" width="10" height="25" fill="#10b981" />
              <rect x="40" y="35" width="20" height="15" fill="#0a251c" />
              <rect x="65" y="35" width="30" height="10" fill="#0a251c" />

              <rect x="35" y="65" width="15" height="30" fill="#0a251c" />
              <rect x="55" y="70" width="20" height="10" fill="#10b981" />
              <rect x="80" y="65" width="15" height="20" fill="#0a251c" />
              <rect x="55" y="85" width="40" height="10" fill="#0a251c" />
            </svg>

            <span className="font-mono text-[11px] font-black text-slate-800 tracking-wider mt-2">
              {gateToken}
            </span>
          </div>
        </div>

        {/* Consignment Specs */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-left">
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-semibold">Truck Number:</span>
            <strong className="text-slate-900 font-mono">{trip.truckNumber}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-semibold">Driver Name:</span>
            <strong className="text-slate-900">{trip.driverName}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-semibold">Origin Farm:</span>
            <strong className="text-slate-900">{trip.pickupClusterName}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-semibold">Cargo Load:</span>
            <strong className="text-emerald-700 font-black">{trip.targetTonnageTons} Tonnes ({trip.balesCount} Bales)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Weighbridge Bay:</span>
            <strong className="text-blue-700">{trip.plantGateCode}</strong>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Shared QR e-Way token ${gateToken} with plant gate security!`)}
            className="flex-1 py-3 bg-[#0a251c] hover:bg-[#12382b] text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Gate Token</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
