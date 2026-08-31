import React from 'react';
import {
  Sprout,
  Package,
  Users,
  Handshake,
  Truck,
  Flame,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const iconMap = {
  Leaf: Sprout,
  Package: Package,
  Users: Users,
  Handshake: Handshake,
  Truck: Truck,
  Flame: Flame,
};

export default function StatsRow({ stats, onSelectRiskMap, onCardClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {stats.map((item) => {
        const Icon = iconMap[item.icon] || Sprout;
        const isHighRisk = item.isAlert;

        return (
          <div
            key={item.id}
            onClick={() => {
              if (item.id === 'high_risk' && onSelectRiskMap) {
                onSelectRiskMap();
              } else if (onCardClick) {
                onCardClick(item.id);
              }
            }}
            className={`relative overflow-hidden bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              isHighRisk
                ? 'border-red-200/90 hover:border-red-400 bg-linear-to-br from-white via-red-50/20 to-red-50/40 ring-1 ring-red-100'
                : 'border-gray-200/80 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Circular Badge Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${item.iconBg} ${item.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Title and Value */}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-500 truncate leading-tight">
                  {item.title}
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">
                    {item.value}
                  </span>
                  {item.unit && (
                    <span className="text-xs font-semibold text-gray-500">
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Subtext / Trend Indicator */}
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              {item.id === 'high_risk' ? (
                <button
                  type="button"
                  className="w-full font-bold text-red-600 hover:text-red-700 flex items-center justify-between group transition-colors"
                >
                  <span>{item.subtext}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : item.trendType === 'info' ? (
                <span className="font-semibold text-blue-600">
                  {item.subtext}
                </span>
              ) : item.trendType === 'teal' ? (
                <span className="font-semibold text-teal-600">
                  {item.subtext}
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span>{item.subtext}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
