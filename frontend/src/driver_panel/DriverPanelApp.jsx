import React, { useState } from 'react';
import DriverSidebar from './components/DriverSidebar';
import TripNavigation from './components/TripNavigation';
import LoadingWeighment from './components/LoadingWeighment';
import DigitalConsignmentQR from './components/DigitalConsignmentQR';
import DriverEarningsHistory from './components/DriverEarningsHistory';

import {
  driverProfiles,
  activeTripData,
  driverCompletedTripsHistory,
  driverDieselLog
} from './data/driverMockData';

import {
  Truck,
  Menu,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function DriverPanelApp({ onReturnToAdmin }) {
  const [allDrivers] = useState(driverProfiles);
  const [activeDriver, setActiveDriver] = useState(driverProfiles[0]);
  const [activeTab, setActiveTab] = useState('navigation');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [trip, setTrip] = useState(activeTripData);
  const [tripsHistory] = useState(driverCompletedTripsHistory);
  const [dieselLog] = useState(driverDieselLog);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateTripStage = (newStatus) => {
    setTrip(prev => ({ ...prev, status: newStatus }));
    const stageNames = {
      'AT_FARM_LOADING': 'Arrived at Farm! Please log loaded bales.',
      'IN_TRANSIT_TO_PLANT': 'Departed Farm! En route to Biogas Plant.',
      'WEIGHBRIDGE_GATE': 'Arrived at Plant Gate! QR Pass Ready.',
    };
    showToast(stageNames[newStatus] || 'Trip status updated!');
    if (newStatus === 'AT_FARM_LOADING') setActiveTab('loading');
    else if (newStatus === 'WEIGHBRIDGE_GATE') setActiveTab('qr_pass');
  };

  const handleConfirmLoading = (loadingData) => {
    setTrip(prev => ({
      ...prev,
      balesCount: loadingData.balesCount,
      targetTonnageTons: loadingData.targetTonnageTons,
      moistureSamplePercent: loadingData.moistureSamplePercent,
      status: 'IN_TRANSIT_TO_PLANT'
    }));
    showToast(`Loading logged! ${loadingData.targetTonnageTons} Tons (${loadingData.balesCount} Bales). Driving to plant...`);
    setActiveTab('navigation');
  };

  const handleTriggerSOS = (reason) => {
    showToast(`🔴 SOS ALERT DISPATCHED: ${reason}. Emergency team notified.`);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-800 font-sans flex antialiased">
      {/* Sidebar */}
      <DriverSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDriver={activeDriver}
        allDrivers={allDrivers}
        onSelectDriver={(drv) => {
          setActiveDriver(drv);
          showToast(`Driver context switched to ${drv.name} (${drv.truckNumber})`);
        }}
        onExitDriverPanel={onReturnToAdmin}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
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
                  {activeDriver.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeDriver.truckNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">{activeDriver.truckType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast("GPS Telemetry & OBD Unit Active")}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Tab Views */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1200px] w-full mx-auto space-y-5">
          {activeTab === 'navigation' && (
            <TripNavigation
              trip={trip}
              onUpdateTripStage={handleUpdateTripStage}
              onTriggerSOS={handleTriggerSOS}
            />
          )}

          {activeTab === 'loading' && (
            <LoadingWeighment
              trip={trip}
              onConfirmLoading={handleConfirmLoading}
            />
          )}

          {activeTab === 'qr_pass' && (
            <DigitalConsignmentQR
              trip={trip}
            />
          )}

          {activeTab === 'earnings' && (
            <DriverEarningsHistory
              driver={activeDriver}
              tripsHistory={tripsHistory}
              dieselLog={dieselLog}
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
