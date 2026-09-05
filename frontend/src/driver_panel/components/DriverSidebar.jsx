import React from 'react';
import {
  Truck,
  Navigation,
  Scale,
  QrCode,
  Wallet,
  ArrowRightLeft,
  X,
  ChevronDown,
  ShieldCheck,
  User
} from 'lucide-react';

export default function DriverSidebar({
  activeTab,
  setActiveTab,
  activeDriver,
  allDrivers,
  onSelectDriver,
  onExitDriverPanel,
  isMobileOpen,
  setIsMobileOpen
}) {
  const navItems = [
    { id: 'navigation', label: 'Active Route & GPS', icon: Navigation },
    { id: 'loading', label: 'Field Loading & Weighment', icon: Scale },
    { id: 'qr_pass', label: 'Digital Consignment QR Pass', icon: QrCode },
    { id: 'earnings', label: 'Earnings & Trip Log', icon: Wallet },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a251c] text-[#9cb5a9] flex flex-col justify-between border-r border-[#153f31] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-base tracking-tight leading-none">
                  Stubble<span className="text-emerald-400">Connect</span>
                </h1>
                <p className="text-[11px] text-[#6b8e81] font-medium tracking-wide mt-1">
                  Parali Driver App
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Driver Selector */}
          <div className="mt-4 pt-3 border-t border-[#12382b]">
            <label className="block text-[10px] uppercase font-bold text-[#6b8e81] mb-1">Active Driver Account:</label>
            <div className="relative">
              <select
                value={activeDriver.id}
                onChange={(e) => {
                  const found = allDrivers.find(d => d.id === e.target.value);
                  if (found) onSelectDriver(found);
                }}
                className="w-full bg-[#071c15] text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-[#133d2e] appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {allDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.truckNumber})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#12382b] text-white shadow-xs border border-emerald-500/30'
                      : 'text-[#8ea99d] hover:bg-[#0f3227] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-[#6e8d80] group-hover:text-emerald-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Exit & Role Toggle */}
        <div className="p-3 border-t border-[#12382b]">
          <div className="bg-[#071c15] border border-[#133d2e] rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Driver Mode</span>
              </div>
              <p className="text-[10px] text-[#6b8e81] mt-0.5">{activeDriver.truckNumber}</p>
            </div>

            <button
              onClick={onExitDriverPanel}
              title="Return to Command Center"
              className="p-2 rounded-lg bg-[#0e2c21] hover:bg-[#154132] text-emerald-400 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
