import React from 'react';
import {
  Menu,
  Search,
  CloudSun,
  MapPin,
  Bell,
  User,
  ChevronDown
} from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
  userRole,
  onOpenNotifications,
  onOpenProfile
}) {
  return (
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
            placeholder="Search farms, clusters, buyers..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Weather, Location, Notifications, Admin Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Weather Widget */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-gray-50/80 rounded-lg border border-gray-100">
          <div className="text-amber-500">
            <CloudSun className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-bold text-gray-800">32°C</div>
            <div className="text-[10px] text-gray-500">Partly Cloudy</div>
          </div>
        </div>

        {/* Location Widget */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-50/80 rounded-lg border border-gray-100">
          <div className="text-rose-500">
            <MapPin className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-bold text-gray-800">Bathinda, Punjab</div>
            <div className="text-[10px] text-gray-500">Punjab</div>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="3 unread notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            3
          </span>
        </button>

        {/* Admin Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#0a251c] text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 shadow-xs">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-gray-900">
              {userRole === 'admin' ? 'Admin' : 'Harjit Singh'}
            </div>
            <div className="text-[10px] text-gray-500">
              {userRole === 'admin' ? 'Operations' : 'Farmer'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
