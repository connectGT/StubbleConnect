import React from 'react';
import {
  Flame,
  Zap,
  Sprout,
  BarChart3,
  TrendingUp,
  FileCheck,
  Award,
  Factory,
  Globe,
  Gauge
} from 'lucide-react';

export default function MethaneYieldAnalytics({ monthlyData, activePlant }) {
  const latestMonth = monthlyData[monthlyData.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0a251c] border border-emerald-500/20 rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Factory className="w-4 h-4" />
            <span>Anaerobic Digester Efficiency</span>
          </div>
          <h2 className="text-xl font-black">CBG Production & Carbon Offsets Analytics</h2>
          <p className="text-xs text-[#9cb5a9] mt-0.5">
            Biogas conversion metrics and Fermented Organic Manure (FOM) yield for <strong>{activePlant.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0f3427] border border-[#174635] px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-[#6b8e81] uppercase font-bold">Digester Operational Efficiency</p>
            <p className="text-lg font-black text-emerald-400">{activePlant.digesterEfficiencyPercent}%</p>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">CBG Produced (Daily)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activePlant.cbgDailyProductionTons} <span className="text-xs font-normal text-slate-500">Tons/Day</span></p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.4% vs last month
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">FOM Bio-Manure</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activePlant.fomDailyProductionTons} <span className="text-xs font-normal text-slate-500">Tons/Day</span></p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">High-grade organic fertilizer</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">CO₂ Emissions Avoided</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activePlant.co2AvoidedTonsThisMonth} <span className="text-xs font-normal text-slate-500">Tons CO₂e</span></p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Certified ESG Offsets</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Conversion Yield</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">320 <span className="text-xs font-normal text-slate-500">kg CBG / Ton Straw</span></p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">High Methane Purity (&gt;95%)</p>
        </div>
      </div>

      {/* Production Graph Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <span>Biomass Conversion & Output Progression</span>
            </h3>
            <p className="text-xs text-slate-500">Monthly breakdown of raw stubble input vs clean CBG output</p>
          </div>

          <button
            onClick={() => alert(`Downloaded ESG Carbon Credit Report for ${activePlant.name}!`)}
            className="px-4 py-2 bg-[#0a251c] text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Download ESG Certificate</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Stubble Input (Tons)</th>
                <th className="py-3 px-4">CBG Produced (Tons)</th>
                <th className="py-3 px-4">FOM Bio-Manure (Tons)</th>
                <th className="py-3 px-4 text-right">CO₂ Avoided (Tons)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {monthlyData.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.month}</td>
                  <td className="py-3 px-4">{row.stubbleInputTons.toLocaleString()} T</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{row.cbgProducedTons.toLocaleString()} T</td>
                  <td className="py-3 px-4 text-amber-700 font-bold">{row.fomProducedTons.toLocaleString()} T</td>
                  <td className="py-3 px-4 text-right font-black text-blue-700">{row.co2SavedTons.toLocaleString()} T</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
