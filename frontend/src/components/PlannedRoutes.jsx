import React, { useState, useEffect } from 'react';
import {
  Truck,
  Building2,
  ArrowRight,
  MapPin
} from 'lucide-react';

export default function PlannedRoutes({ onViewAll, onSelectRoute }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/routes')
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') {
          setRoutes(data.data);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading routes...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-3">
          Today's Planned Routes
        </h3>

        <div className="space-y-3">
          {routes.map((route, idx) => (
            <div
              key={route.id}
              onClick={() => onSelectRoute && onSelectRoute(route)}
              className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg hover:bg-gray-50/90 transition-colors cursor-pointer"
            >
              {/* Left Column: Route Code & Cluster */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                  {idx === 2 ? (
                    <Building2 className="w-4 h-4 text-teal-700" />
                  ) : (
                    <Truck className="w-4 h-4 text-teal-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 leading-tight">
                    {route.code}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {route.cluster}
                  </div>
                </div>
              </div>

              {/* Center Column: Destination Plant */}
              <div className="text-left min-w-0 flex-1 px-2 hidden sm:block">
                <div className="font-semibold text-gray-800 truncate leading-tight">
                  {route.buyer}
                </div>
                <div className="text-[11px] text-gray-400">
                  {route.buyerLocation}
                </div>
              </div>

              {/* Right Column: Stops & Biomass Tonnage */}
              <div className="text-right shrink-0">
                <div className="font-bold text-gray-800">
                  {route.stops} Stops
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  {route.tonnage} Tonnes
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-2 border-t border-gray-100 text-center">
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All Routes</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
