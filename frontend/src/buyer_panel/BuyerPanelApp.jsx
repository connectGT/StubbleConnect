import React, { useState } from 'react';
import BuyerSidebar from './components/BuyerSidebar';
import ProcurementMarketplace from './components/ProcurementMarketplace';
import InboundFleetRadar from './components/InboundFleetRadar';
import QualityLabInspector from './components/QualityLabInspector';
import MethaneYieldAnalytics from './components/MethaneYieldAnalytics';

import {
  biogasPlants,
  biomassMarketplaceClusters,
  inboundDeliveries,
  qualityInspectionLogs,
  methaneAnalyticsMonthly
} from './data/buyerMockData';

import {
  Building2,
  Bell,
  Search,
  Menu,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function BuyerPanelApp({ onReturnToAdmin }) {
  const [allPlants] = useState(biogasPlants);
  const [activePlant, setActivePlant] = useState(biogasPlants[0]);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [clusters, setClusters] = useState(biomassMarketplaceClusters);
  const [deliveries, setDeliveries] = useState(inboundDeliveries);
  const [logs] = useState(qualityInspectionLogs);
  const [monthlyData] = useState(methaneAnalyticsMonthly);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProcureCluster = (cluster, tonnage, rate) => {
    // Update cluster status
    setClusters(prev =>
      prev.map(c =>
        c.id === cluster.id
          ? { ...c, status: `Ordered by ${activePlant.name}` }
          : c
      )
    );

    // Add simulated truck delivery
    const newDelivery = {
      id: `TRK-${Math.floor(100 + Math.random() * 900)}`,
      truckNumber: `PB-${Math.floor(10 + Math.random() * 80)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
      truckType: '10-Ton Hydraulic Tipper',
      driverName: 'Harjit Singh',
      driverPhone: '+91 98700 12345',
      originCluster: cluster.name,
      loadedBiomassTons: Math.min(10, tonnage),
      etaMinutes: 25,
      gateStatus: 'Dispatched from Farm',
      weighbridgeTicket: `WB-2026-${Math.floor(890 + Math.random() * 100)}`,
      moistureSampledPercent: cluster.moistureContentPercent,
      labStatus: 'Sample In-Transit',
    };

    setDeliveries(prev => [newDelivery, ...prev]);
    showToast(`Purchase order authorized! ${tonnage} Tons requested for ${activePlant.name}.`);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-800 font-sans flex antialiased">
      {/* Sidebar */}
      <BuyerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePlant={activePlant}
        allPlants={allPlants}
        onSelectPlant={(plant) => {
          setActivePlant(plant);
          showToast(`Switched portal context to ${plant.name}`);
        }}
        onExitBuyerPanel={onReturnToAdmin}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={onReturnToAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Command Center</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  {activePlant.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activePlant.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {activePlant.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-600 font-semibold">Digester Feed Stock:</span>
              <strong className="text-slate-900">{activePlant.currentSiloStockTons} / {activePlant.maxSiloCapacityTons} T</strong>
            </div>

            <button
              onClick={() => showToast("All biogas plant sensors connected & operational")}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Tab Views */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1720px] w-full mx-auto space-y-6">
          {activeTab === 'marketplace' && (
            <ProcurementMarketplace
              clusters={clusters}
              activePlant={activePlant}
              onProcureCluster={handleProcureCluster}
            />
          )}

          {activeTab === 'inbound' && (
            <InboundFleetRadar
              deliveries={deliveries}
              activePlant={activePlant}
            />
          )}

          {activeTab === 'quality' && (
            <QualityLabInspector
              logs={logs}
              activePlant={activePlant}
            />
          )}

          {activeTab === 'analytics' && (
            <MethaneYieldAnalytics
              monthlyData={monthlyData}
              activePlant={activePlant}
            />
          )}
        </main>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0a251c] text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
