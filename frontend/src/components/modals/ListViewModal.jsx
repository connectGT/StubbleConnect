import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Route,
  History,
  Bell,
  Flame,
  Wheat,
  Share2,
  Cpu,
  Check,
} from 'lucide-react';

export default function ListViewModal({ type, onClose, onSelectCluster }) {
  const [routes, setRoutes] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [fields, setFields] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [minBiomassThreshold, setMinBiomassThreshold] = useState(50);
  const [maxRoutingDistance, setMaxRoutingDistance] = useState(35);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [satelliteSync, setSatelliteSync] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      if (type === 'activity') {
        fetch('http://localhost:8000/api/v1/analytics/activity-feed')
          .then(res => res.json())
          .then(data => setActivities(data))
          .catch(err => console.error(err));
      }
      if (type === 'notifications') {
        fetch('http://localhost:8000/api/v1/analytics/alerts')
          .then(res => res.json())
          .then(data => setAlerts(data))
          .catch(err => console.error(err));
      }
      if (type === 'routes') {
        fetch('http://localhost:8000/api/v1/routes')
          .then(res => res.json())
          .then(data => setRoutes(data.data || []))
          .catch(err => console.error(err));
      }
      if (type === 'buyers') {
        fetch('http://localhost:8000/api/v1/buyers')
          .then(res => res.json())
          .then(data => setBuyers(data.data || []))
          .catch(err => console.error(err));
      }
      if (type === 'fields') {
        fetch('http://localhost:8000/api/v1/fields')
          .then(res => res.json())
          .then(data => setFields(data.data || []))
          .catch(err => console.error(err));
      }
      if (type === 'clusters' || type === 'risk') {
        fetch('http://localhost:8000/api/v1/clusters')
          .then(res => res.json())
          .then(data => setClusters(data.data || []))
          .catch(err => console.error(err));
      }
    };
    
    fetchData();
    window.addEventListener('refresh-dashboard-data', fetchData);
    return () => window.removeEventListener('refresh-dashboard-data', fetchData);
  }, [type]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0a251c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'activity' && <History className="w-5 h-5 text-emerald-400" />}
            {type === 'routes' && <Route className="w-5 h-5 text-cyan-400" />}
            {type === 'buyers' && <Building2 className="w-5 h-5 text-emerald-400" />}
            {type === 'notifications' && <Bell className="w-5 h-5 text-amber-400" />}
            {type === 'risk' && <Flame className="w-5 h-5 text-red-400" />}
            {type === 'fields' && <Wheat className="w-5 h-5 text-amber-400" />}
            {type === 'clusters' && <Share2 className="w-5 h-5 text-blue-400" />}
            {type === 'settings' && <Cpu className="w-5 h-5 text-purple-400" />}

            <h3 className="font-bold text-base text-white">
              {type === 'activity' && 'Real-Time Activity Feed'}
              {type === 'routes' && 'All Planned Biomass Routes'}
              {type === 'buyers' && 'Biomass Off-Takers & Capacity Registry'}
              {type === 'notifications' && 'System Notifications & Critical Alerts'}
              {type === 'risk' && 'High Burning Risk Zones'}
              {type === 'fields' && 'Registered Fields Directory'}
              {type === 'clusters' && 'Active Collection Clusters'}
              {type === 'settings' && 'AI Logistics Engine Settings'}
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
              {activities.length === 0 ? (
                <div className="text-center p-4 text-gray-500 italic">No recent activity found.</div>
              ) : (
                activities.map((act, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">{act.title}</div>
                      {act.subtitle && <div className="text-gray-500 mt-0.5">{act.subtitle}</div>}
                    </div>
                    <span className="text-gray-400 shrink-0 text-[11px]">{act.time}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {type === 'routes' && (
            <div className="space-y-3">
              {routes.length === 0 ? (
                <div className="text-center p-8 text-gray-500 italic">No planned biomass collection routes found.</div>
              ) : (
                routes.map((route) => (
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
                ))
              )}
            </div>
          )}

          {type === 'buyers' && (
            <div className="space-y-3">
              {buyers.length === 0 ? (
                <div className="text-center p-8 text-gray-500 italic">No registered biomass off-takers or plants found.</div>
              ) : (
                buyers.map((b) => (
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
                ))
              )}
            </div>
          )}

          {type === 'fields' && (
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="text-center p-8 text-gray-500 italic">No farm fields registered yet.</div>
              ) : (
                fields.map((f) => {
                  const isCompleted = f.status === 'Completed';
                  return (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                        isCompleted
                          ? 'opacity-60 bg-gray-100/70 border-gray-200'
                          : 'bg-gray-50 border-gray-200/80'
                      }`}
                    >
                      <div>
                        <h4 className={`font-bold text-sm ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                          {f.farmer_name || f.farmer || 'Farmer'}
                        </h4>
                        <p className="text-gray-500">Location: {f.village || f.location} &bull; Size: {f.area_acres || f.acres || 0} Acres</p>
                        <p className={`font-semibold mt-1 ${isCompleted ? 'text-gray-500' : 'text-emerald-700'}`}>
                          Est. Biomass: {f.biomass || f.biomass_est || 0} Tonnes
                        </p>
                      </div>
                      <div>
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px]">Completed</span>
                        ) : f.is_clustered ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">Clustered</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {type === 'clusters' && (
            <div className="space-y-3">
              {clusters.length === 0 ? (
                <div className="text-center p-8 text-gray-500 italic">No active collection clusters found. Run spatial clustering to group nearby fields.</div>
              ) : (
                clusters.map((c) => (
                  <div key={c.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Cluster {c.name}</h4>
                        <p className="text-gray-500 mt-0.5">{c.farmsCount ?? c.farms_count ?? (c.farms ? c.farms.length : 0)} Farms Combined</p>
                      </div>
                      <div className="text-right">
                         <span className="font-bold text-sm text-emerald-700">{c.totalBiomass ?? c.total_biomass ?? 0} Tonnes</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          if (onSelectCluster) onSelectCluster(c);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold flex gap-1 items-center cursor-pointer transition-colors"
                      >
                         <Route className="w-3.5 h-3.5" /> Plan Route
                      </button>
                      <button
                        onClick={() => {
                          if (onSelectCluster) onSelectCluster(c);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold flex gap-1 items-center cursor-pointer transition-colors"
                      >
                         Inspect Map
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {type === 'settings' && (
            <div className="space-y-6">
              <div className="p-5 border border-purple-100 bg-purple-50/30 rounded-xl">
                 <h4 className="font-bold text-purple-900 text-sm mb-4 flex gap-2 items-center"><Cpu className="w-4 h-4"/> VRP Optimization Parameters</h4>
                 
                 <div className="space-y-5">
                    <div>
                       <div className="flex justify-between mb-1">
                          <label className="font-semibold text-gray-700">Min. Biomass Threshold for Clustering</label>
                          <span className="font-bold text-purple-700">{minBiomassThreshold} Tonnes</span>
                       </div>
                       <input
                         type="range"
                         min="10"
                         max="100"
                         value={minBiomassThreshold}
                         onChange={(e) => setMinBiomassThreshold(Number(e.target.value))}
                         className="w-full accent-purple-600"
                       />
                       <p className="text-[10px] text-gray-500 mt-1">Algorithm will not form a cluster until this threshold is met.</p>
                    </div>

                    <div>
                       <div className="flex justify-between mb-1">
                          <label className="font-semibold text-gray-700">Max Truck Routing Distance</label>
                          <span className="font-bold text-purple-700">{maxRoutingDistance} km</span>
                       </div>
                       <input
                         type="range"
                         min="10"
                         max="100"
                         value={maxRoutingDistance}
                         onChange={(e) => setMaxRoutingDistance(Number(e.target.value))}
                         className="w-full accent-purple-600"
                       />
                       <p className="text-[10px] text-gray-500 mt-1">Maximum radius for fleet dispatch from a central buyer facility.</p>
                    </div>
                 </div>
              </div>

              <div className="p-5 border border-gray-200 bg-white shadow-xs rounded-xl space-y-4">
                 <h4 className="font-bold text-gray-900 text-sm mb-2">Automation Integrations</h4>
                 
                 <label className="flex items-center justify-between cursor-pointer">
                    <div>
                       <div className="font-semibold text-gray-800">Auto-Dispatch Fleet on Match</div>
                       <div className="text-[10px] text-gray-500 mt-0.5">Automatically ping trucks when a route is generated</div>
                    </div>
                    <div className="relative">
                       <input
                         type="checkbox"
                         checked={autoDispatch}
                         onChange={(e) => setAutoDispatch(e.target.checked)}
                         className="sr-only peer"
                       />
                       <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                 </label>

                 <label className="flex items-center justify-between cursor-pointer">
                    <div>
                       <div className="font-semibold text-gray-800">ISRO/NASA Fire Satellite Sync</div>
                       <div className="text-[10px] text-gray-500 mt-0.5">Ingest VIIRS/MODIS thermal anomalies for risk mapping</div>
                    </div>
                    <div className="relative">
                       <input
                         type="checkbox"
                         checked={satelliteSync}
                         onChange={(e) => setSatelliteSync(e.target.checked)}
                         className="sr-only peer"
                       />
                       <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </div>
                 </label>

                 <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        localStorage.setItem('stubble_vrp_params', JSON.stringify({ minBiomassThreshold, maxRoutingDistance, autoDispatch, satelliteSync }));
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 3000);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {settingsSaved ? <Check className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                      {settingsSaved ? 'Configuration Saved!' : 'Save AI Parameters'}
                    </button>
                 </div>
              </div>
            </div>
          )}

          {type === 'risk' && (
            <div className="space-y-3">
              <p className="text-gray-600">
                {clusters.filter(c => (c.riskScore ?? 0) >= 65).length} High-Risk Agricultural Clusters identified with less than 48 hours remaining in their harvest burn window:
              </p>
              {clusters.filter(c => (c.riskScore ?? 0) >= 65).length === 0 ? (
                <div className="text-center p-6 text-gray-500 italic">No high-risk agricultural clusters identified.</div>
              ) : (
                clusters
                  .filter((c) => (c.riskScore ?? 0) >= 65)
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
                            Score: {cl.riskScore ?? 0}/100
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{cl.farmsCount ?? cl.farms_count ?? 0} Farms &bull; {cl.totalBiomass ?? cl.total_biomass ?? 0} Tonnes Biomass</p>
                        <p className="text-red-700 font-medium mt-0.5">{cl.recommendedAction || 'Priority collection suggested due to high burning risk.'}</p>
                      </div>
                      <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                        Inspect
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}

          {type === 'notifications' && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center p-4 text-gray-500 italic">No critical alerts or notifications right now.</div>
              ) : (
                alerts.map((al, i) => (
                  <div key={i} className={`p-3 border rounded-xl ${
                    al.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    al.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                    'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="font-bold">{al.title}</div>
                    <p className={`mt-0.5 ${
                      al.type === 'warning' ? 'text-amber-800' :
                      al.type === 'info' ? 'text-blue-800' :
                      'text-emerald-800'
                    }`}>{al.message}</p>
                    <span className={`text-[10px] font-semibold ${
                      al.type === 'warning' ? 'text-amber-600' :
                      al.type === 'info' ? 'text-blue-600' :
                      'text-emerald-600'
                    }`}>{al.time}</span>
                  </div>
                ))
              )}
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
