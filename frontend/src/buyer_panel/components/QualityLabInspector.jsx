import React, { useState } from 'react';
import {
  FlaskConical,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  Droplets,
  Award,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export default function QualityLabInspector({ logs, activePlant }) {
  // Calculator state
  const [grossWeight, setGrossWeight] = useState(17.5);
  const [tareWeight, setTareWeight] = useState(6.5);
  const [moisturePercent, setMoisturePercent] = useState(11.8);
  const [silicaPercent, setSilicaPercent] = useState(3.8);
  const [baseRate, setBaseRate] = useState(activePlant.basePurchasePricePerTon);

  const netStrawWeight = Math.max(0, grossWeight - tareWeight);

  // Formula calculations:
  // Standard moisture target: 14%
  // Bonus: If moisture < 12%, +₹50/T bonus
  // Penalty: If moisture > 14%, -₹40/T for each 1% over 14%
  let moistureBonusOrPenalty = 0;
  if (moisturePercent < 12) {
    moistureBonusOrPenalty = 50; // Bonus
  } else if (moisturePercent > 14) {
    const excess = moisturePercent - 14;
    moistureBonusOrPenalty = -Math.round(excess * 40); // Penalty
  }

  // Silica Penalty: Standard <4.5%. If >4.5%, -₹30/T per 1%
  let silicaPenalty = 0;
  if (silicaPercent > 4.5) {
    silicaPenalty = Math.round((silicaPercent - 4.5) * 30);
  }

  const finalPayableRate = Math.max(1000, baseRate + moistureBonusOrPenalty - silicaPenalty);
  const totalPayout = Math.round(netStrawWeight * finalPayableRate);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0a251c] border border-emerald-500/20 rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Feedstock Quality Assurance</span>
          </div>
          <h2 className="text-xl font-black">Biomass Quality & Moisture Lab Inspector</h2>
          <p className="text-xs text-[#9cb5a9] mt-0.5">
            Automated quality penalty/bonus calculator for raw paddy straw entering <strong>{activePlant.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0f3427] border border-[#174635] px-4 py-2.5 rounded-xl">
          <Award className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="text-[10px] text-[#6b8e81] uppercase font-bold">Standard Moisture Cap</p>
            <p className="font-extrabold text-white">≤ 14.0% Moisture (Dry Basis)</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Interactive Calculator, Right Inspection Log History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Calculator (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <span>Gate Sample Calculator</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Formula Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Weight inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Gross Truck Wt (Tons):</label>
                <input
                  type="number"
                  step="0.1"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tare (Empty) Wt (Tons):</label>
                <input
                  type="number"
                  step="0.1"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="bg-slate-100 p-2.5 rounded-xl flex items-center justify-between font-bold text-slate-800">
              <span>Net Biomass Weight:</span>
              <span className="text-emerald-700 text-sm">{netStrawWeight.toFixed(2)} Tonnes</span>
            </div>

            {/* Moisture Content Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Moisture Content (%):</span>
                <span className={`font-black ${moisturePercent <= 14 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {moisturePercent}%
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="22"
                step="0.1"
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>8% (Dry)</span>
                <span>14% (Standard Cap)</span>
                <span>22% (Wet)</span>
              </div>
            </div>

            {/* Silica Content Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Silica / Ash Content (%):</span>
                <span className={`font-black ${silicaPercent <= 4.5 ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {silicaPercent}%
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={silicaPercent}
                onChange={(e) => setSilicaPercent(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Price Adjustments Output */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Base Contract Rate:</span>
                <span className="font-bold">₹{baseRate}/T</span>
              </div>

              <div className="flex justify-between">
                <span>Moisture Adjustment:</span>
                <span className={`font-bold flex items-center gap-1 ${moistureBonusOrPenalty >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {moistureBonusOrPenalty > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : moistureBonusOrPenalty < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : null}
                  {moistureBonusOrPenalty >= 0 ? `+₹${moistureBonusOrPenalty}/T Bonus` : `-₹${Math.abs(moistureBonusOrPenalty)}/T Penalty`}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Silica Wear Penalty:</span>
                <span className={`font-bold ${silicaPenalty > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {silicaPenalty > 0 ? `-₹${silicaPenalty}/T Penalty` : '₹0 (Clear)'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm">
                <span className="text-slate-800">Final Payable Rate:</span>
                <span className="text-emerald-700">₹{finalPayableRate}/Tonne</span>
              </div>
            </div>

            {/* Total Payout Result */}
            <div className="bg-[#0a251c] text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] text-[#6b8e81] font-bold uppercase">Net Farmer Payout</p>
                <p className="text-xl font-black text-emerald-400">
                  ₹{totalPayout.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => alert(`Generated lab voucher for ${netStrawWeight.toFixed(2)} T @ ₹${finalPayableRate}/T = ₹${totalPayout.toLocaleString('en-IN')}`)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Approve Voucher
              </button>
            </div>
          </div>
        </div>

        {/* Right: Inspection History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Recent Quality Check Logs</span>
              </h3>
              <p className="text-xs text-slate-500">Verified lab inspection tickets at gate entry</p>
            </div>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.ticketId}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                      {log.ticketId}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{log.truckNumber}</span>
                    <span className="text-xs text-slate-500">({log.clusterName})</span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {log.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">NET STRAW WT</span>
                    <span className="font-bold text-slate-800">{log.netStrawWeightTons} T</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">MOISTURE</span>
                    <span className="font-bold text-emerald-700">{log.moisturePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">FINAL RATE</span>
                    <span className="font-bold text-slate-900">₹{log.finalPayableRatePerTon}/T</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">TOTAL DOCKET</span>
                    <span className="font-black text-emerald-700">₹{log.totalPayoutRupees.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Inspector: {log.inspector}</span>
                  <span>{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
