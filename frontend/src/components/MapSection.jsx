import React from 'react';
import BiomassMap from './BiomassMap';
import ClusterDetailsPanel from './ClusterDetailsPanel';

export default function MapSection({
  selectedCluster,
  setSelectedCluster,
  onViewFullClusterDetails,
  onOpenBuyerDetails,
  onOpenLogistics
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      
      {/* 9-Column Map Area */}
      <div className="xl:col-span-9 bg-white rounded-xl shadow-xs border border-gray-200 p-2 lg:p-3 relative flex flex-col h-full">
        {/* Absolute header over map */}
        <div className="absolute top-5 left-5 z-10 hidden sm:block pointer-events-none">
          <h2 className="text-xl font-bold text-gray-900 drop-shadow-md">Live Command Map</h2>
          <p className="text-sm font-semibold text-gray-700 drop-shadow-md">Real-time GPS tracking & risk zoning</p>
        </div>
        
        {/* Leaflet Map Component */}
        <div className="flex-1 w-full h-full rounded-lg overflow-hidden min-h-[400px]">
          <BiomassMap
            selectedCluster={selectedCluster}
            setSelectedCluster={setSelectedCluster}
            onOpenBuyerDetails={onOpenBuyerDetails}
            onOpenLogistics={onOpenLogistics}
          />
        </div>
      </div>

      {/* Col 3: Cluster Details Panel */}
      <div className="lg:col-span-3">
        <ClusterDetailsPanel
          cluster={selectedCluster}
          onViewFullDetails={onViewFullClusterDetails}
        />
      </div>
    </div>
  );
}
