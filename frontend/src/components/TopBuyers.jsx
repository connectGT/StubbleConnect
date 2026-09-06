import React, { useState, useEffect } from 'react';
import {
  Building2,
  ArrowRight,
  Factory
} from 'lucide-react';

export default function TopBuyers({ onViewAll, onSelectBuyer }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch(`http://${window.location.hostname}:8000/api/v1/buyers`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setBuyers(data.data.slice(0, 4)); // Show top 4
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };
    
    fetchData();
    window.addEventListener('refresh-dashboard-data', fetchData);
    return () => window.removeEventListener('refresh-dashboard-data', fetchData);
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading buyers...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-3">
          Top Buyers by Capacity
        </h3>

        <div className="space-y-3.5">
          {buyers.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-semibold text-gray-700">No Buyers Registered</div>
              <p className="text-[11px] text-gray-400 max-w-[200px]">Onboard biomass off-takers and processing plants.</p>
            </div>
          ) : (
            buyers.map((buyer) => {
              const percentage = Math.round(
                (buyer.currentCapacity / buyer.maxCapacity) * 100
              );

              return (
                <div
                  key={buyer.id}
                  onClick={() => onSelectBuyer && onSelectBuyer(buyer)}
                  className="group cursor-pointer"
                >
                  {/* Name & Capacity Numbers */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Factory className="w-3 h-3 text-emerald-700" />
                      </div>
                      <span className="font-bold text-gray-800 truncate group-hover:text-emerald-800 transition-colors">
                        {buyer.name}, {buyer.location}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600 shrink-0 ml-2">
                      {buyer.currentCapacity} / {buyer.maxCapacity} Tonnes
                    </span>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500 group-hover:bg-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-2 border-t border-gray-100 text-center">
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All Buyers</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
