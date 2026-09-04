import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsRow from './components/StatsRow';
import MapSection from './components/MapSection';
import BottomRow from './components/BottomRow';
import ClusterModal from './components/modals/ClusterModal';
import QuickActionModal from './components/modals/QuickActionModal';
import ListViewModal from './components/modals/ListViewModal';
import FarmerDashboard from './components/FarmerDashboard';
import FarmerLoginPage from './components/FarmerLoginPage';
import BuyerPanelApp from './buyer_panel/BuyerPanelApp';
import DriverPanelApp from './driver_panel/DriverPanelApp';
import { statsData, clustersData, buyersData, routesData } from './data/mockData';

export default function App() {
  // Auth state — load from localStorage for persistence
  const [farmerUser, setFarmerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stubble_farmer_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  // If we already have a logged-in farmer, start in farmer role
  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = localStorage.getItem('stubble_farmer_user');
      return saved ? 'farmer' : 'admin';
    } catch { return 'admin'; }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  
  // Selected Cluster (Defaults to Cluster #12 from reference image)
  const defaultCluster = clustersData.find((c) => c.number === 12) || clustersData[0];
  const [selectedCluster, setSelectedCluster] = useState(defaultCluster);

  // Live Stats State
  const [stats, setStats] = useState(statsData);

  React.useEffect(() => {
    // Fetch live dashboard KPIs from FastAPI
    fetch('http://localhost:8000/api/v1/analytics/dashboard-kpi')
      .then(res => res.json())
      .then(data => {
        setStats([
          { id: 'total_fields', title: 'Total Registered Fields', value: data.total_fields.toString(), subtext: 'Farms registered', trend: 'up', icon: 'Leaf', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { id: 'total_biomass', title: 'Est. Biomass Available', value: data.total_biomass_tonnes, unit: 'T', subtext: 'Ready for harvest', trend: 'up', icon: 'Package', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
          { id: 'active_clusters', title: 'Active Field Clusters', value: data.active_clusters.toString(), subtext: 'Grouped collection zones', trend: 'up', icon: 'Users', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', trendType: 'info' },
          { id: 'routes_planned', title: 'Logistics Routes Planned', value: data.routes_planned.toString(), subtext: 'Pending dispatch', trend: 'down', icon: 'Truck', iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', trendType: 'teal' },
          { id: 'high_risk', title: 'High Risk Areas', value: data.high_risk_areas.toString(), subtext: 'Immediate action required', trend: 'down', icon: 'Flame', iconBg: 'bg-red-50', iconColor: 'text-red-600', isAlert: true },
          { id: 'daily_capacity', title: 'Buyer Processing Cap.', value: data.total_buyer_capacity, unit: 'T', subtext: 'Across active plants', trend: 'up', icon: 'Handshake', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' }
        ]);
      })
      .catch(err => console.error("Could not fetch live stats:", err));
  }, []);

  // Modal States
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [listViewModalType, setListViewModalType] = useState(null); // 'activity' | 'routes' | 'buyers' | 'notifications' | 'risk'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Quick Action Handler
  const handleQuickAction = (actionId) => {
    setActiveQuickAction(actionId);
  };

  // Login handler — saves to localStorage for persistence
  const handleLogin = (user) => {
    setFarmerUser(user);
    localStorage.setItem('stubble_farmer_user', JSON.stringify(user));
  };

  // Logout handler — clears localStorage, returns to admin
  const handleLogout = () => {
    setFarmerUser(null);
    setUserRole('admin');
    localStorage.removeItem('stubble_farmer_user');
    showToast('Logged out successfully');
  };

  // Switch role handler
  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    const roleLabels = {
      admin: 'Operations Admin',
      buyer: 'Biogas Plant Buyer',
      driver: 'Truck Driver Logistics',
      farmer: 'Farmer'
    };
    showToast(`Switched to ${roleLabels[newRole] || newRole} Mode`);
  };

  // If buyer role — launch dedicated Biogas Plant Buyer Portal
  if (userRole === 'buyer') {
    return (
      <BuyerPanelApp
        onReturnToAdmin={() => setUserRole('admin')}
      />
    );
  }

  // If driver role — launch dedicated Truck Driver Logistics Portal
  if (userRole === 'driver') {
    return (
      <DriverPanelApp
        onReturnToAdmin={() => setUserRole('admin')}
      />
    );
  }

  // If farmer role but not logged in — show login gate
  if (userRole === 'farmer' && !farmerUser) {
    return (
      <FarmerLoginPage
        onLogin={(user) => { handleLogin(user); }}
      />
    );
  }


  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-800 font-sans flex antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'reports') {
            showToast("Generating AI Carbon Impact Report...");
            setTimeout(() => showToast("Report downloaded successfully!"), 2000);
            return;
          }
          const modalMap = {
            'risk_map': 'risk',
            'alerts': 'notifications',
            'routes': 'routes',
            'buyers': 'buyers',
            'fields': 'fields',
            'clusters': 'clusters',
            'settings': 'settings'
          };
          if (modalMap[tab]) {
            setListViewModalType(modalMap[tab]);
          }
        }}
        onQuickAction={handleQuickAction}
        userRole={userRole}
        setUserRole={handleRoleChange}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          userRole={userRole}
          farmerUser={farmerUser}
          onLogout={handleLogout}
          onSwitchRole={handleRoleChange}
          onOpenNotifications={() => setListViewModalType('notifications')}
          onOpenProfile={() =>
            showToast(`Logged in as ${userRole === 'admin' ? 'Admin (Operations)' : farmerUser?.name || 'Farmer'}`)
          }
        />

        {/* Dashboard Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1720px] w-full mx-auto">
          {userRole === 'admin' ? (
            <>
              {/* Top Row: 6 KPI Stats Cards */}
              <StatsRow
                stats={stats}
                onSelectRiskMap={() => setListViewModalType('risk')}
                onCardClick={(statId) => {
                  if (statId === 'routes_planned') setListViewModalType('routes');
                  if (statId === 'active_clusters' || statId === 'matched_clusters') {
                    setIsClusterModalOpen(true);
                  }
                }}
              />

              {/* Middle Row: 12-Column Grid (9 Col Map + 3 Col Cluster #12 Details Panel) */}
              <MapSection
                selectedCluster={selectedCluster}
                setSelectedCluster={(cl) => {
                  setSelectedCluster(cl);
                  showToast(`Focused on ${cl.name}`);
                }}
                onViewFullClusterDetails={(cl) => {
                  setSelectedCluster(cl);
                  setIsClusterModalOpen(true);
                }}
                onOpenBuyerDetails={(buyer) => {
                  setListViewModalType('buyers');
                }}
              />

              {/* Bottom Row: 3 Equal-Width Panels (Recent Activity, Planned Routes, Top Buyers) */}
              <BottomRow
                onViewAllActivity={() => setListViewModalType('activity')}
                onViewAllRoutes={() => setListViewModalType('routes')}
                onViewAllBuyers={() => setListViewModalType('buyers')}
                onSelectRoute={(route) => {
                  const matchedCl = clustersData.find(
                    (c) => c.name.toLowerCase() === route.cluster.toLowerCase()
                  );
                  if (matchedCl) setSelectedCluster(matchedCl);
                  showToast(`Inspecting ${route.code} -> ${route.buyer}`);
                }}
                onSelectBuyer={(buyer) => {
                  showToast(`Offtaker: ${buyer.name} (${buyer.currentCapacity}/${buyer.maxCapacity} T)`);
                }}
              />
            </>
          ) : (
            <FarmerDashboard
              onRegisterClick={() => setActiveQuickAction('register_field')}
              farmerUser={farmerUser}
              onLogout={handleLogout}
            />
          )}
        </main>

      </div>

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0a251c] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* High-Visibility Floating Role Launchers */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {/* Driver Button (Above) */}
        <button
          onClick={() => handleRoleChange('driver')}
          className="bg-gradient-to-r from-[#071c15] via-[#0e2c21] to-[#071c15] hover:from-[#12382b] text-white font-extrabold text-xs px-4.5 py-3 rounded-2xl shadow-2xl border border-emerald-400/80 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-500/20 group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">🚚</span>
          <div className="text-left">
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Parali Pickup</div>
            <div className="text-xs font-black text-white">Truck Driver Mode</div>
          </div>
        </button>

        {/* Biogas Plant Buyer Button (Below) */}
        <button
          onClick={() => handleRoleChange('buyer')}
          className="bg-gradient-to-r from-[#0a251c] via-[#0f3427] to-[#0a251c] hover:from-[#12382b] text-white font-extrabold text-xs px-4.5 py-3 rounded-2xl shadow-2xl border border-emerald-400/80 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-500/20 group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">🏭</span>
          <div className="text-left">
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Buyer Portal</div>
            <div className="text-xs font-black text-white">Biogas Plant Mode</div>
          </div>
        </button>
      </div>

      {/* Modal: Full Cluster Breakdown & Logistics Dispatch */}
      {isClusterModalOpen && (
        <ClusterModal
          cluster={selectedCluster}
          onClose={() => setIsClusterModalOpen(false)}
          onDispatchRoute={(cluster) => {
            showToast(`Logistics route dispatched for ${cluster.name}!`);
          }}
        />
      )}

      {/* Modal: Quick Actions (Register Field, Add Buyer, Run Clustering, Generate Routes) */}
      {activeQuickAction && (
        <QuickActionModal
          actionType={activeQuickAction}
          onClose={() => setActiveQuickAction(null)}
          onSuccess={() => {
            showToast('Action completed successfully!');
          }}
        />
      )}

      {/* Modal: List Views (All Activity, All Routes, All Buyers, Alerts, Risk Map) */}
      {listViewModalType && (
        <ListViewModal
          type={listViewModalType}
          onClose={() => setListViewModalType(null)}
          onSelectCluster={(cl) => {
            setSelectedCluster(cl);
            setIsClusterModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
