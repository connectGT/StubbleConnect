import React, { useState } from 'react';
import {
  Truck,
  Clock,
  MapPin,
  Phone,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Radio,
  Search,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export default function InboundFleetRadar({ deliveries, activePlant }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const filteredDeliveries = deliveries.filter(item =>
    item.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.originCluster.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGatePass = (truck) => {
    setSelectedTruck(truck);
  };

  const handleSimulateAction = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0a251c] border border-emerald-500/20 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>Gate & Logistics Control</span>
          </div>
          <h2 className="text-xl font-black">Inbound Biomass Fleet Radar</h2>
          <p className="text-xs text-[#9cb5a9] mt-0.5">
            Real-time telemetry of incoming tippers & hydraulic trucks approaching <strong>{activePlant.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0f3427] border border-[#174635] px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-[#6b8e81] uppercase font-bold">Active Deliveries</p>
            <p className="text-base font-extrabold text-white">{deliveries.length} Trucks</p>
          </div>
          <div className="bg-[#0f3427] border border-[#174635] px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-[#6b8e81] uppercase font-bold">Today's Inbound Tonnage</p>
            <p className="text-base font-extrabold text-emerald-400">
              {deliveries.reduce((sum, d) => sum + d.loadedBiomassTons, 0).toFixed(1)} T
            </p>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-md flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Control & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search truck number, driver or cluster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Live Inbound Deliveries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDeliveries.map((truck) => {
          const isArriving = truck.etaMinutes <= 15 && truck.etaMinutes > 0;
          const isAtGate = truck.etaMinutes === 0;

          return (
            <div
              key={truck.id}
              className="bg-white border border-slate-200 hover:border-emerald-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Truck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{truck.truckNumber}</h3>
                    <p className="text-xs text-slate-500">{truck.truckType}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    isAtGate
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isArriving
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{truck.gateStatus}</span>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Origin Cluster</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {truck.originCluster}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Loaded Biomass</span>
                  <span className="font-black text-emerald-700 mt-0.5 block text-sm">
                    {truck.loadedBiomassTons} Tonnes
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Driver</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {truck.driverName}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Arrival</span>
                  <span className="font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {truck.etaMinutes === 0 ? 'ARRIVED AT GATE' : `${truck.etaMinutes} mins away`}
                  </span>
                </div>
              </div>

              {/* Lab & Weighbridge Quick Status */}
              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 flex items-center justify-between text-xs mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Weighbridge Ticket:</span>
                  <span className="font-mono font-bold text-emerald-950 ml-1.5">{truck.weighbridgeTicket}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">QA Lab Check:</span>
                  <span className="font-semibold text-emerald-900 ml-1.5">{truck.labStatus}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleGatePass(truck)}
                  className="flex-1 px-3 py-2 bg-[#0a251c] hover:bg-[#12382b] text-emerald-400 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Issue Weighbridge Ticket</span>
                </button>

                <a
                  href={`tel:${truck.driverPhone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSimulateAction(`Calling driver ${truck.driverName} (${truck.driverPhone})...`);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  title="Call Driver"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Modal */}
      {selectedTruck && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900">Digital Gate Pass & Weighbridge Ticket</h3>
              <button
                onClick={() => setSelectedTruck(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs text-slate-700 mb-6">
              <div className="text-center pb-2 border-b border-slate-200">
                <p className="font-bold text-sm text-slate-900 uppercase">{activePlant.name}</p>
                <p className="text-[10px] text-slate-500">GATE 01 - WEIGHBRIDGE DOCKET</p>
              </div>
              <div className="flex justify-between">
                <span>Docket Ref:</span>
                <strong>{selectedTruck.weighbridgeTicket}</strong>
              </div>
              <div className="flex justify-between">
                <span>Truck Number:</span>
                <strong>{selectedTruck.truckNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Driver:</span>
                <strong>{selectedTruck.driverName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Origin Cluster:</span>
                <strong>{selectedTruck.originCluster}</strong>
              </div>
              <div className="flex justify-between">
                <span>Estimated Net Weight:</span>
                <strong className="text-emerald-700">{selectedTruck.loadedBiomassTons} Tons</strong>
              </div>
              <div className="flex justify-between">
                <span>Moisture Sample:</span>
                <strong>{selectedTruck.moistureSampledPercent || 'Pending Gate Scan'}%</strong>
              </div>
            </div>

            <button
              onClick={() => {
                handleSimulateAction(`Printed weighbridge docket ${selectedTruck.weighbridgeTicket}!`);
                setSelectedTruck(null);
              }}
              className="w-full py-2.5 bg-[#0a251c] text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirm Gate Entry & Print Pass</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
