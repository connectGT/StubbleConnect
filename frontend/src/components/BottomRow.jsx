import React from 'react';
import RecentActivity from './RecentActivity';
import PlannedRoutes from './PlannedRoutes';
import TopBuyers from './TopBuyers';

export default function BottomRow({
  onViewAllActivity,
  onViewAllRoutes,
  onViewAllBuyers,
  onSelectRoute,
  onSelectBuyer
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      <RecentActivity onViewAll={onViewAllActivity} />
      <PlannedRoutes
        onViewAll={onViewAllRoutes}
        onSelectRoute={onSelectRoute}
      />
      <TopBuyers
        onViewAll={onViewAllBuyers}
        onSelectBuyer={onSelectBuyer}
      />
    </div>
  );
}
