import React from 'react';
import {
  Wallet,
  Fuel,
  CheckCircle2,
  TrendingUp,
  Award,
  Truck,
  FileText,
  DollarSign
} from 'lucide-react';

export default function DriverEarningsHistory({ driver, tripsHistory, dieselLog }) {
  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#0a251c] border border-emerald-500/20 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Driver Payouts & Performance</span>
          </div>
          <h2 className="text-xl font-black text-white">{driver.name}</h2>
          <p className="text-xs text-[#9cb5a9] mt-0.5">Assigned Tipper: <strong>{driver.truckNumber}</strong> ({driver.truckType})</p>
        </div>

        <div className="bg-[#0f3427] border border-[#174635] px-4 py-2.5 rounded-xl">
          <p className="text-[10px] text-[#6b8e81] uppercase font-bold">This Month Payout</p>
          <p className="text-xl font-black text-emerald-400">₹{driver.earningsThisMonthRupees.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* 3 Key Metric Cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Trips Completed</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{driver.tripsCompletedThisMonth}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Parali Delivered</p>
          <p className="text-lg font-black text-emerald-700 mt-0.5">{driver.totalTonnageDelivered} T</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Driver Rating</p>
          <p className="text-lg font-black text-amber-600 mt-0.5">⭐ {driver.rating}</p>
        </div>
      </div>

      {/* Completed Trips Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Recent Completed Collection Trips</span>
          </h3>
        </div>

        <div className="space-y-3">
          {tripsHistory.map((t) => (
            <div key={t.tripId} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-800">{t.tripId}</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">{t.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">PICKUP / DESTINATION</span>
                  <span className="font-bold text-slate-800">{t.originCluster} → {t.destinationPlant}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">CARGO / PAYOUT</span>
                  <span className="font-black text-emerald-800">{t.netStrawTons} T (₹{t.payoutRupees})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diesel Fill-up Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Fuel className="w-4 h-4 text-amber-600" />
          <span>Fuel & Diesel Reimbursements</span>
        </h3>

        <div className="space-y-2">
          {dieselLog.map((fuel, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{fuel.station}</p>
                <p className="text-[10px] text-slate-500">{fuel.date} • {fuel.liters} Liters @ ₹{fuel.ratePerLiter}/L</p>
              </div>
              <span className="font-black text-slate-900">₹{fuel.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
