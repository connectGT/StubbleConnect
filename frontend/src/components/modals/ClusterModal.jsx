import React from 'react';
import {
  X,
  Flame,
  Users,
  Sprout,
  Calendar,
  Navigation,
  Building2,
  CheckCircle2,
  Truck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ClusterModal({ cluster, onClose, onDispatchRoute }) {
  if (!cluster) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0a251c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{cluster.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {cluster.riskLevel}
                </span>
              </div>
              <p className="text-xs text-[#9cb5a9]">
                AI-Aggregated Biomass Harvest Zone &bull; Punjab Agricultural Belt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500">Total Biomass</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">
                {cluster.totalBiomass} Tonnes
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500">Farms in Cluster</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">
                {cluster.farmsCount} Farms
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500">Harvest Window</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">
                {cluster.harvestWindow}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500">Risk Score</div>
              <div className="text-base font-bold text-red-600 mt-0.5">
                {cluster.riskScore} / 100
              </div>
            </div>
          </div>

          {/* AI Match & Route Section */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
              Logistics & Buyer Matching
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Designated Plant:</span>{' '}
                <span className="font-bold text-gray-800">
                  {cluster.nearestBuyer} ({cluster.buyerLocation})
                </span>
              </div>
              <div>
                <span className="text-gray-500">Average Distance:</span>{' '}
                <span className="font-bold text-gray-800">{cluster.avgDistance}</span>
              </div>
              <div>
                <span className="text-gray-500">Assigned Route:</span>{' '}
                <span className="font-bold text-emerald-800">Route #R-08 (8 Stops)</span>
              </div>
              <div>
                <span className="text-gray-500">Estimated Collection Time:</span>{' '}
                <span className="font-bold text-gray-800">3 hrs 45 mins</span>
              </div>
            </div>
          </div>

          {/* Participating Farmers List */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Participating Farmers in Cluster ({cluster.farmsCount})
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-3.5 py-2">Farmer Name</th>
                    <th className="px-3.5 py-2">Village / Location</th>
                    <th className="px-3.5 py-2">Field Size</th>
                    <th className="px-3.5 py-2 text-right">Est. Biomass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {cluster.farmers && cluster.farmers.length > 0 ? (
                    cluster.farmers.map((farmer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60">
                        <td className="px-3.5 py-2 font-medium text-gray-900">
                          {farmer.name}
                        </td>
                        <td className="px-3.5 py-2 text-gray-500">
                          {farmer.village}
                        </td>
                        <td className="px-3.5 py-2">{farmer.acres} Acres</td>
                        <td className="px-3.5 py-2 text-right font-bold text-emerald-700">
                          {farmer.biomass} T
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3.5 py-4 text-center text-gray-400">
                        8 farms registered under this cluster
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (onDispatchRoute) onDispatchRoute(cluster);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#0a251c] hover:bg-[#12382b] text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirm & Dispatch Logistics Route</span>
          </button>
        </div>
      </div>
    </div>
  );
}
