import React, { useState } from 'react';
import {
  Menu,
  Search,
  CloudSun,
  MapPin,
  Bell,
  User,
  LogOut,
  X,
  Shield,
} from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
  userRole,
  farmerUser,
  onLogout,
  onSwitchRole,
  onOpenNotifications,
  onOpenProfile,
  onSearchSubmit
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const isFarmer = userRole === 'farmer';
  const displayName = isFarmer && farmerUser
    ? farmerUser.name.split(' ')[0]
    : 'Admin';
  const displaySub = isFarmer && farmerUser
    ? farmerUser.village
    : 'Operations';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200/80 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xs">
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  if (onSearchSubmit) {
                    onSearchSubmit(searchTerm.trim());
                  } else {
                    window.dispatchEvent(new CustomEvent('open-fields-directory'));
                  }
                }
              }}
              placeholder={isFarmer ? 'Search your fields, pickups... (Press Enter)' : 'Search farms, clusters, buyers... (Press Enter)'}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Weather Widget — hidden in farmer mode on small screens */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-gray-50/80 rounded-lg border border-gray-100">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-gray-800">32°C</div>
              <div className="text-[10px] text-gray-500">Partly Cloudy</div>
            </div>
          </div>

          {/* Location Widget */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-50/80 rounded-lg border border-gray-100">
            <MapPin className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-gray-800">
                {isFarmer && farmerUser ? farmerUser.village : 'Bathinda'}
              </div>
              <div className="text-[10px] text-gray-500">Punjab</div>
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile + Logout */}
          <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
            <button
              onClick={() => {
                setShowProfileModal(true);
                if (onOpenProfile) onOpenProfile();
              }}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0a251c] text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 shadow-xs">
                {isFarmer && farmerUser
                  ? farmerUser.name.charAt(0).toUpperCase()
                  : <User className="w-4 h-4 text-emerald-400" />
                }
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-gray-900">{displayName}</div>
                <div className="text-[10px] text-gray-500">{displaySub}</div>
              </div>
            </button>

            {/* Logout — shown in farmer mode */}
            {isFarmer && onLogout && (
              <button
                onClick={onLogout}
                title="Logout"
                className="ml-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#0a251c] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Active Session Profile</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-11 h-11 rounded-full bg-[#0a251c] text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30 shrink-0">
                  {isFarmer && farmerUser ? farmerUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-sm truncate">
                    {isFarmer && farmerUser ? farmerUser.name : 'Operations Administrator'}
                  </div>
                  <div className="text-gray-500 truncate">
                    {isFarmer && farmerUser ? `${farmerUser.phone} • ${farmerUser.village}` : 'State Command Control • Punjab'}
                  </div>
                </div>
              </div>

              {/* Portal Switcher Actions */}
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Switch Portal Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('admin');
                      setShowProfileModal(false);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      userRole === 'admin'
                        ? 'border-emerald-500 bg-emerald-50/60 font-bold text-emerald-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">Admin Center</div>
                    <div className="text-[10px] text-gray-500">Fleet & Clustering</div>
                  </button>

                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('farmer');
                      setShowProfileModal(false);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      userRole === 'farmer'
                        ? 'border-emerald-500 bg-emerald-50/60 font-bold text-emerald-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">Farmer Portal</div>
                    <div className="text-[10px] text-gray-500">Harvest & Subsidies</div>
                  </button>

                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('buyer');
                      setShowProfileModal(false);
                    }}
                    className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-left text-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-xs">Buyer Portal</div>
                    <div className="text-[10px] text-gray-500">Bio-CNG Plants</div>
                  </button>

                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('driver');
                      setShowProfileModal(false);
                    }}
                    className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-left text-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-xs">Driver Portal</div>
                    <div className="text-[10px] text-gray-500">Live Logistics</div>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex gap-2 border-t border-gray-100">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      onLogout();
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
