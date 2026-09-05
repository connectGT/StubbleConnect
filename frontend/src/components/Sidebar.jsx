import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wheat,
  Share2,
  Building2,
  Route,
  Flame,
  FileText,
  Bell,
  Users,
  Settings,
  Plus,
  Zap,
  Sprout,
  User,
  ArrowRightLeft,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  BarChart3,
  MapPin,
  Leaf,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onQuickAction,
  userRole,
  setUserRole,
  isMobileOpen,
  setIsMobileOpen
}) {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // -------------------------------------------------------------
  // Option 1: Full Operational / Feature-Rich Sidebar (Admin)
  // -------------------------------------------------------------
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fields', label: 'Fields', icon: Wheat },
    { id: 'clusters', label: 'Clusters', icon: Share2 },
    { id: 'buyers', label: 'Buyers', icon: Building2 },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'risk_map', label: 'Risk Map', icon: Flame },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'settings', label: 'AI Config', icon: Settings },
  ];

  const adminQuickActions = [
    { id: 'register_field', label: 'Register New Field', icon: Plus },
    { id: 'add_buyer', label: 'Add New Buyer', icon: Plus },
    { id: 'run_clustering', label: 'Run Clustering', icon: Zap },
    { id: 'generate_routes', label: 'Generate Routes', icon: Route },
  ];

  // -------------------------------------------------------------
  // Option 2: Minimal / Beginner-Friendly Sidebar (Farmer)
  // -------------------------------------------------------------
  const farmerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: MapPin },
    {
      id: 'fields_accordion',
      label: 'My Fields',
      icon: Leaf,
      subItems: [
        { id: 'overview', label: 'All Fields' },
        { id: 'report_harvest', label: 'Report Harvest' },
      ]
    },
    {
      id: 'risk_accordion',
      label: 'My Risk Status',
      icon: Shield,
      subItems: [
        { id: 'risk_level', label: 'View Risk Level' },
      ]
    },
    {
      id: 'reports',
      label: 'Payments & Reports',
      icon: TrendingUp,
      subItems: [
        { id: 'payments', label: 'View Payments' },
        { id: 'receipts', label: 'Download Receipts' },
      ]
    },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' }
  ];

  const farmerQuickActions = [
    { id: 'register_field', label: 'Register Field', icon: Plus },
  ];

  // Determine active configuration based on role
  const isFarmer = userRole === 'farmer';
  const currentNavItems = isFarmer ? farmerNavItems : adminNavItems;
  const currentQuickActions = isFarmer ? farmerQuickActions : adminQuickActions;

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
        {/* Top Branding */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight leading-none">
                  Stubble<span className="text-emerald-400">Connect</span>
                </h1>
                <p className="text-[11px] text-[#6b8e81] font-medium tracking-wide mt-1">
                  Biomass Command Center
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
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = openAccordion === item.id;
              
              // We consider it active if the main item is clicked, or any of its subItems are active
              const isActive = activeTab === item.id || (hasSubItems && item.subItems.some(sub => sub.id === activeTab));

              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={() => {
                      if (hasSubItems) {
                        toggleAccordion(item.id);
                      } else {
                        setActiveTab(item.id);
                        setOpenAccordion(null); // Close accordion if clicking a flat link
                        setIsMobileOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                      isActive && !hasSubItems
                        ? 'bg-[#12382b] text-white shadow-xs font-semibold'
                        : 'text-[#8ea99d] hover:bg-[#0f3227] hover:text-white'
                    } ${isExpanded && hasSubItems ? 'bg-[#0e2c21] text-white' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive || (isExpanded && hasSubItems)
                            ? 'text-emerald-400'
                            : 'text-[#6e8d80] group-hover:text-emerald-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {hasSubItems && (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#6e8d80]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#6e8d80]" />
                        )
                      )}
                    </div>
                  </button>

                  {/* Render Accordion Sub-items if Farmer Mode & Expanded */}
                  {hasSubItems && isExpanded && (
                    <div className="mt-1 ml-4 pl-3 border-l-2 border-[#12382b] flex flex-col space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveTab(sub.id);
                            setIsMobileOpen(false);
                          }}
                          className={`text-left text-xs px-3 py-1.5 rounded-md transition-colors ${
                            activeTab === sub.id
                              ? 'text-emerald-400 font-semibold bg-[#12382b]/50'
                              : 'text-[#8ea99d] hover:text-white hover:bg-[#12382b]/30'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick Actions Block */}
          <div className="pt-4 mt-3 border-t border-[#12382b]/80">
            <h3 className="px-3 text-[11px] font-semibold tracking-wider text-[#648477] uppercase mb-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {currentQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      onQuickAction(action.id);
                      setIsMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#9cb5a9] hover:text-white hover:bg-[#12382b]/70 rounded-md transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom User Role Toggle */}
        <div className="p-3 border-t border-[#12382b] space-y-2">
          {/* 1. Truck Driver Mode Launcher Button (ABOVE) */}
          <button
            onClick={() => setUserRole('driver')}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-[#071c15] via-[#0e2c21] to-[#071c15] hover:from-[#12382b] hover:to-[#0a251c] border border-emerald-500/50 rounded-xl text-xs font-black text-emerald-400 hover:text-white shadow-lg flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🚚</span>
              <div className="text-left">
                <div className="leading-tight text-white font-bold">Truck Driver Mode</div>
                <div className="text-[9px] text-[#6b8e81] font-normal">Parali Pickup & GPS Navigation</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* 2. Biogas Plant Buyer Portal Launcher Button (BELOW) */}
          <button
            onClick={() => setUserRole('buyer')}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-950 via-[#0a251c] to-[#0f3427] hover:from-[#12382b] hover:to-[#0a251c] border border-emerald-500/50 rounded-xl text-xs font-black text-emerald-400 hover:text-white shadow-lg flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🏭</span>
              <div className="text-left">
                <div className="leading-tight text-white font-bold">Biogas Plant Buyer</div>
                <div className="text-[9px] text-[#6b8e81] font-normal">CBG Procurement Portal</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {/* 3. Admin / Farmer Toggle */}
          <div className="bg-[#071c15] border border-[#133d2e] rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-800/60 border border-emerald-600/40 flex items-center justify-center text-emerald-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] font-semibold text-white">
                {isFarmer ? 'Farmer Mode' : 'Admin Mode'}
              </div>
            </div>
            <button
              onClick={() => {
                setUserRole(isFarmer ? 'admin' : 'farmer');
                setOpenAccordion(null);
              }}
              className="text-[10px] bg-[#0e2c21] hover:bg-[#154132] text-emerald-400 px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Switch to {isFarmer ? 'Admin' : 'Farmer'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
