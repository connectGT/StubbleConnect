import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsRow from './components/StatsRow';
import MapSection from './components/MapSection';
import BottomRow from './components/BottomRow';
import ClusterModal from './components/modals/ClusterModal';
import QuickActionModal from './components/modals/QuickActionModal';
import ListViewModal from './components/modals/ListViewModal';
import { statsData, clustersData, buyersData, routesData } from './data/mockData';

export default function App() {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // 'admin' | 'farmer'
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Cluster (Defaults to Cluster #12 from reference image)
  const defaultCluster = clustersData.find((c) => c.number === 12) || clustersData[0];
  const [selectedCluster, setSelectedCluster] = useState(defaultCluster);

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

  // Switch role handler with toast
  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    showToast(`Switched to ${newRole === 'admin' ? 'Operations Admin' : 'Farmer'} Mode`);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-800 font-sans flex antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'risk_map') {
            setListViewModalType('risk');
          } else if (tab === 'alerts') {
            setListViewModalType('notifications');
          } else if (tab === 'routes') {
            setListViewModalType('routes');
          } else if (tab === 'buyers') {
            setListViewModalType('buyers');
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
          onOpenNotifications={() => setListViewModalType('notifications')}
          onOpenProfile={() =>
            showToast(`Logged in as ${userRole === 'admin' ? 'Admin (Operations)' : 'Farmer (Harjit Singh)'}`)
          }
        />

        {/* Dashboard Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1720px] w-full mx-auto">
          {/* Top Row: 6 KPI Stats Cards */}
          <StatsRow
            stats={statsData}
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
        </main>
      </div>

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0a251c] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

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
