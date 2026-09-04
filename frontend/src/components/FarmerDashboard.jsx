import React from 'react';
import { 
  Sprout, 
  IndianRupee, 
  Leaf, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

export default function FarmerDashboard({ onRegisterClick }) {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-5xl mx-auto w-full">
      
      {/* Header Greeting */}
      <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, Harjit Singh</h2>
          <p className="text-emerald-200 mt-1">Village Talwandi Sabo • FPO ID: #88392</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-700/50 rounded-lg border border-emerald-500/30">
          <Leaf className="w-5 h-5 text-emerald-300" />
          <span className="font-semibold text-emerald-100">Green Farmer Tier</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg"><Sprout className="w-5 h-5 text-emerald-600"/></div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Biomass Sold</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">18.5 <span className="text-base text-gray-500 font-normal">Tonnes</span></p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><IndianRupee className="w-5 h-5 text-blue-600"/></div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Estimated Payout</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹ 46,250</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Leaf className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-amber-50 rounded-lg"><Leaf className="w-5 h-5 text-amber-500"/></div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Carbon Credits Earned</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">14 <span className="text-base text-gray-500 font-normal">Credits</span></p>
        </div>
      </div>

      {/* Active Pickup Tracker */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Active Harvest Pickups</h3>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
            In Progress
          </span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">Route #R-07</h4>
              <p className="text-sm text-gray-500">Destination: GreenFuel Plant Bathinda</p>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="mt-8 flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-6 right-1/2 h-1 bg-emerald-500 -translate-y-1/2 z-0"></div>
            
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><CheckCircle2 className="w-4 h-4"/></div>
              <span className="text-xs font-semibold text-gray-900">Registered</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><CheckCircle2 className="w-4 h-4"/></div>
              <span className="text-xs font-semibold text-gray-900">Clustered</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-4 border-white shadow-xs text-emerald-600 flex items-center justify-center"><Truck className="w-4 h-4"/></div>
              <span className="text-xs font-bold text-emerald-600">Truck En Route</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"></div>
              <span className="text-xs font-semibold text-gray-400">Collected</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Fields & Actions */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">My Registered Fields</h3>
          <button 
            onClick={onRegisterClick}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Report New Harvest
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <h4 className="font-bold text-gray-900">Farm A - Talwandi Sabo</h4>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" /> Harvested: 15 Aug 2025 • 10 Acres
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">22.5 Tonnes</div>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">Sold & Paid</span>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <h4 className="font-bold text-gray-900">Farm B - Rampura Phul</h4>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" /> Est. Harvest: 22 Aug 2025 • 14 Acres
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">~ 28.0 Tonnes</div>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">Pending Collection</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
