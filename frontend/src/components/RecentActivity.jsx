import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Share2,
  Route,
  ArrowRight,
  Clock,
  Wheat
} from 'lucide-react';

const iconMap = {
  field_registered: Wheat,
  cluster_matched: Share2,
  route_generated: Route,
  default: UserCheck
};

export default function RecentActivity({ onViewAll }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analytics/activity-feed')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-3 flex items-center justify-between">
          <span>Live Activity Feed</span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
          </div>
        </h3>

        <div className="space-y-3">
          {activities.map((act) => {
            const Icon = iconMap[act.type] || iconMap.default;
            return (
              <div key={act.id} className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 leading-tight truncate">
                      {act.title}
                    </p>
                    {act.subtitle && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {act.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">
                  {act.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-2 border-t border-gray-100 text-center">
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All Activity</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
