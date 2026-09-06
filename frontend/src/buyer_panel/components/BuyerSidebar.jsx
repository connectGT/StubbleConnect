import React from 'react';
import {
  Building2,
  ShoppingCart,
  Truck,
  FlaskConical,
  BarChart3,
  LogOut,
  ChevronDown,
  Sprout,
  ArrowRightLeft,
  X,
  ShieldCheck
} from 'lucide-react';

export default function BuyerSidebar({
  activeTab,
  setActiveTab,
  activePlant,
  allPlants,
  onSelectPlant,
  onExitBuyerPanel,
  isMobileOpen,
  setIsMobileOpen
}) {
  const navItems = [
    { id: 'marketplace', label: 'Procurement Marketplace', icon: ShoppingCart },
    { id: 'inbound', label: 'Inbound Fleet Radar', icon: Truck, badge: '4' },
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
              <img src="/logo.jpg?v=2" alt="StubbleConnect Logo" className="w-9 h-9 rounded-lg object-cover border border-emerald-500/30 shadow-inner" />
              <div>
                <h1 className="text-white font-bold text-base tracking-tight leading-none">
                  Stubble<span className="text-emerald-400">Connect</span>
                </h1>
                <p className="text-[11px] text-[#6b8e81] font-medium tracking-wide mt-1">
                  Biomass Buyer Portal
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

          {/* Plant Selector Dropdown */}
          <div className="mt-4 pt-3 border-t border-[#12382b]">
            <label className="block text-[10px] uppercase font-bold text-[#6b8e81] mb-1">Active Biomass Plant:</label>
            <div className="relative">
              <select
                value={activePlant.id}
                onChange={(e) => {
                  const found = allPlants.find(p => p.id === e.target.value);
                  if (found) onSelectPlant(found);
                }}
                className="w-full bg-[#071c15] text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-[#133d2e] appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {allPlants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#12382b] text-white shadow-xs font-bold border border-emerald-500/20'
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

                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Exit & Role Toggle */}
        <div className="p-3 border-t border-[#12382b] space-y-2">
          <div className="bg-[#071c15] border border-[#133d2e] rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Biomass Plant Mode</span>
              </div>
              <p className="text-[10px] text-[#6b8e81] mt-0.5">{activePlant.manager}</p>
            </div>

            <button
              onClick={onExitBuyerPanel}
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
