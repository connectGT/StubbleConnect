import React from 'react';
import {
  X,
  Building2,
  Route,
  History,
  Bell,
  Flame,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  recentActivities,
  routesData,
  buyersData,
  clustersData
} from '../../data/mockData';

export default function ListViewModal({ type, onClose, onSelectCluster }) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0a251c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'activity' && <History className="w-5 h-5 text-emerald-400" />}
            {type === 'routes' && <Route className="w-5 h-5 text-cyan-400" />}
            {type === 'buyers' && <Building2 className="w-5 h-5 text-emerald-400" />}
            {type === 'notifications' && <Bell className="w-5 h-5 text-amber-400" />}
            {type === 'risk' && <Flame className="w-5 h-5 text-red-400" />}

            <h3 className="font-bold text-base text-white">
              {type === 'activity' && 'Real-Time Activity Feed'}
              {type === 'routes' && 'All Planned Biomass Routes'}
              {type === 'buyers' && 'Biomass Off-Takers & Capacity Registry'}
              {type === 'notifications' && 'System Notifications & Critical Alerts'}
              {type === 'risk' && 'High Burning Risk Zones'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal List Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {type === 'activity' && (
            <div className="space-y-3">
              {[...recentActivities,
                { id: 'act-5', title: 'Route #R-07 completed delivery at EcoHeat Mansa', subtitle: '40.1 Tonnes delivered', time: '42 mins ago' },
                { id: 'act-6', title: 'Cluster #09 formed with 7 farms in Mansa', subtitle: '35.7 Tonnes total', time: '1 hr ago' },
                { id: 'act-7', title: 'Buyer Punjab Biomass Ltd updated storage capacity', subtitle: '500 Tonnes quota', time: '2 hrs ago' }
              ].map((act, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <div className="font-bold text-gray-900">{act.title}</div>
                    {act.subtitle && <div className="text-gray-500 mt-0.5">{act.subtitle}</div>}
                  </div>
                  <span className="text-gray-400 shrink-0 text-[11px]">{act.time}</span>
                </div>
              ))}
            </div>
          )}

          {type === 'routes' && (
            <div className="space-y-3">
              {routesData.map((route) => (
                <div key={route.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{route.code}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        {route.status}
                      </span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      Origin: <span className="font-semibold text-gray-800">{route.cluster}</span> &rarr; Destination:{' '}
                      <span className="font-semibold text-gray-800">{route.buyer} ({route.buyerLocation})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{route.stops} Pickup Stops</div>
                    <div className="text-emerald-700 font-semibold">{route.tonnage} Tonnes</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === 'buyers' && (
            <div className="space-y-3">
              {buyersData.map((b) => (
                <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{b.name}</h4>
                      <p className="text-gray-500">{b.location}, Punjab &bull; {b.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-gray-900">
                        {b.currentCapacity} / {b.maxCapacity} Tonnes
                      </span>
                      <p className="text-emerald-700 font-bold">{b.percentage}% Filled</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === 'risk' && (
            <div className="space-y-3">
              <p className="text-gray-600">
                5 High-Risk Agricultural Clusters identified with less than 48 hours remaining in their harvest burn window:
              </p>
              {clustersData
                .filter((c) => c.riskScore >= 65)
                .map((cl) => (
                  <div
                    key={cl.id}
                    onClick={() => {
                      if (onSelectCluster) onSelectCluster(cl);
                      onClose();
                    }}
                    className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl flex items-center justify-between hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-gray-900">{cl.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Score: {cl.riskScore}/100
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{cl.farmsCount} Farms &bull; {cl.totalBiomass} Tonnes Biomass</p>
                      <p className="text-red-700 font-medium mt-0.5">{cl.recommendedAction}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold">
                      Inspect
                    </button>
                  </div>
                ))}
            </div>
          )}

          {type === 'notifications' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="font-bold text-amber-900">High Burning Risk in Cluster #12</div>
                <p className="text-amber-800 mt-0.5">8 farms scheduled for harvest within 36 hours. Priority dispatch required.</p>
                <span className="text-[10px] text-amber-600 font-semibold">5 mins ago</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-900">New Buyer Quota Opened</div>
                <p className="text-blue-800 mt-0.5">GreenFuel Plant Bathinda increased capacity by 100 Tonnes.</p>
                <span className="text-[10px] text-blue-600 font-semibold">30 mins ago</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="font-bold text-emerald-900">Route #R-08 In Transit</div>
                <p className="text-emerald-800 mt-0.5">Driver arrived at first pickup stop in Talwandi.</p>
                <span className="text-[10px] text-emerald-600 font-semibold">1 hour ago</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#0a251c] text-white rounded-lg hover:bg-[#12382b] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
