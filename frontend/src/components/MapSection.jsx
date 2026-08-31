import React from 'react';
import BiomassMap from './BiomassMap';
import ClusterDetailsPanel from './ClusterDetailsPanel';

export default function MapSection({
  selectedCluster,
  setSelectedCluster,
  onViewFullClusterDetails,
  onOpenBuyerDetails
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
      {/* Col 9: Interactive Map Container */}
      <div className="lg:col-span-9">
        <BiomassMap
          selectedCluster={selectedCluster}
          setSelectedCluster={setSelectedCluster}
          onOpenBuyerDetails={onOpenBuyerDetails}
        />
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
