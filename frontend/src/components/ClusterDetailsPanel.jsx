import React from 'react';
import {
  Users,
  Sprout,
  Calendar,
  Navigation,
  Building2,
  CheckCircle2,
  Flame,
  ArrowRight,
  Share2
} from 'lucide-react';

export default function ClusterDetailsPanel({
  cluster,
  onViewFullDetails
}) {
  if (!cluster) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-xs flex flex-col items-center justify-center text-center h-full space-y-3 min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">No Cluster Selected</h3>
          <p className="text-xs text-gray-500 max-w-[220px] mt-1">
            Click any cluster polygon or badge on the map to inspect its biomass volume, burning risk score, and logistics status.
          </p>
        </div>
        <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] text-gray-400 font-medium border border-gray-100">
          Spatial Clustering (DBSCAN)
        </div>
      </div>
    );
  }

  // Calculate SVG arc parameters for semi-circular gauge
  const radius = 60;
  const strokeWidth = 10;
  const score = cluster.riskScore ?? 82;
  const percentage = Math.min(Math.max(score / 100, 0), 1);
  const farmsCount = cluster.farmsCount ?? cluster.farms_count ?? (cluster.farms ? cluster.farms.length : 8);
  const totalBiomass = cluster.totalBiomass ?? cluster.total_biomass ?? 142;
  const harvestWindow = cluster.harvestWindow || '18 – 20 Aug 2026';
  const avgDistance = cluster.avgDistance || '12.5 km';
  const nearestBuyer = cluster.nearestBuyer || 'GreenFuel Bio-CNG Plant';
  const buyerLocation = cluster.buyerLocation || 'Bathinda, Punjab';
  const status = cluster.status || 'Pending Route';
  const riskLevel = cluster.riskLevel || cluster.risk_level || (score >= 65 ? 'High Risk' : score >= 35 ? 'Moderate Risk' : 'Low Risk');
  const recommendedAction = cluster.recommendedAction || cluster.recommended_action || 'Priority collection suggested due to high burning risk.';
  
  // Circumference of half circle = PI * R
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - percentage);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header with Cluster Name & Risk Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            {cluster.name}
          </h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{riskLevel}</span>
          </div>
        </div>

        {/* Key Metrics List */}
        <div className="py-3 space-y-2.5 text-xs">
          {/* Farms */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Farms in Cluster</span>
            </div>
            <span className="font-bold text-gray-900">{farmsCount}</span>
          </div>

          {/* Biomass */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Total Biomass (Est.)</span>
            </div>
            <span className="font-bold text-gray-900">{totalBiomass} Tonnes</span>
          </div>

          {/* Harvest Window */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Harvest Window</span>
            </div>
            <span className="font-bold text-gray-900">{harvestWindow}</span>
          </div>

          {/* Avg Distance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Avg. Distance to Buyer</span>
            </div>
            <span className="font-bold text-gray-900">{avgDistance}</span>
          </div>

          {/* Nearest Buyer */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nearest Buyer</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{nearestBuyer}</div>
              <div className="text-[10px] text-gray-400">{buyerLocation}</div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Status</span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-md text-[11px] border border-emerald-200/60">
              {status}
            </span>
          </div>
        </div>

        {/* Burning Risk Score Semi-Circle Gauge */}
        <div className="pt-3 pb-2 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-800 mb-1 text-center">
            Burning Risk Score
          </div>

          <div className="flex flex-col items-center justify-center relative">
            <svg
              className="w-40 h-24 overflow-visible"
              viewBox="0 0 150 85"
            >
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="70%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 15,75 A 60,60 0 0,1 135,75"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Colored Gauge Arc */}
              <path
                d="M 15,75 A 60,60 0 0,1 135,75"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Score Text Overlay */}
            <div className="absolute top-10 flex flex-col items-center">
              <div className="flex items-baseline">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  {score}
                </span>
                <span className="text-xs font-semibold text-gray-400">/100</span>
              </div>
              <span className="text-[11px] font-bold text-red-600 mt-0.5">
                {riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Action Card */}
        <div className="mt-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-amber-100 text-amber-600 shrink-0 mt-0.5">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-900 leading-tight">
              Recommended Action
            </div>
            <div className="text-[10px] text-amber-800 leading-tight mt-0.5">
              {recommendedAction}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3">
        <button
          onClick={() => onViewFullDetails(cluster)}
          className="w-full bg-[#0a251c] hover:bg-[#12382b] active:bg-[#071c15] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs group cursor-pointer"
        >
          <span>View Cluster Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
