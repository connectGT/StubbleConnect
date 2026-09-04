import React, { useState } from 'react';
import {
  Building2,
  Filter,
  Flame,
  Droplets,
  Truck,
  CheckCircle2,
  DollarSign,
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

export default function ProcurementMarketplace({
  clusters,
  activePlant,
  onProcureCluster
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [maxMoistureFilter, setMaxMoistureFilter] = useState(16);
  const [procureModalCluster, setProcureModalCluster] = useState(null);
  const [requestedTonnage, setRequestedTonnage] = useState(100);
  const [bidPrice, setBidPrice] = useState(1850);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const filteredClusters = clusters.filter(cluster => {
    const matchesSearch = cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cluster.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRiskFilter === 'ALL' || cluster.riskLevel === selectedRiskFilter;
    const matchesMoisture = cluster.moistureContentPercent <= maxMoistureFilter;
    return matchesSearch && matchesRisk && matchesMoisture;
  });

  const handleOpenProcureModal = (cluster) => {
    setProcureModalCluster(cluster);
    setRequestedTonnage(cluster.totalBiomassTons);
    setBidPrice(cluster.askingPricePerTon);
    setOrderConfirmed(false);
  };

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
    setTimeout(() => {
      onProcureCluster(procureModalCluster, requestedTonnage, bidPrice);
      setProcureModalCluster(null);
      setOrderConfirmed(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Marketplace Stats Header */}
      <div className="bg-gradient-to-r from-[#0a251c] via-[#0f3427] to-[#0a251c] border border-emerald-500/20 rounded-2xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Industrial Biomass Sourcing Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Raw Stubble Procurement Marketplace
          </h2>
          <p className="text-sm text-[#9cb5a9] mt-1 max-[#600px]">
            Direct sourcing interface for <strong className="text-white">{activePlant.name}</strong>. Contract harvest clusters in real-time before open burning.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#071c15]/80 border border-[#133d2e] rounded-xl p-3.5 backdrop-blur-xs">
          <div className="text-center px-3 border-r border-[#153f31]">
            <p className="text-[11px] text-[#6b8e81] uppercase font-bold">Max Preferred Moisture</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">{activePlant.preferredMoistureMax}%</p>
          </div>
          <div className="text-center px-3 border-r border-[#153f31]">
            <p className="text-[11px] text-[#6b8e81] uppercase font-bold">Base Rate</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">₹{activePlant.basePurchasePricePerTon}/T</p>
          </div>
          <div className="text-center px-3">
            <p className="text-[11px] text-[#6b8e81] uppercase font-bold">Silo Space Available</p>
            <p className="text-lg font-black text-cyan-400 mt-0.5">
              {activePlant.maxSiloCapacityTons - activePlant.currentSiloStockTons} T
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cluster or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Risk Level:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRiskFilter(risk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedRiskFilter === risk
                  ? 'bg-[#0a251c] text-emerald-400 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>

        {/* Moisture Content Range */}
        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <Droplets className="w-4 h-4 text-cyan-600" />
          <span className="text-xs font-semibold text-slate-600">Max Moisture: <strong>{maxMoistureFilter}%</strong></span>
          <input
            type="range"
            min="10"
            max="20"
            step="0.5"
            value={maxMoistureFilter}
            onChange={(e) => setMaxMoistureFilter(parseFloat(e.target.value))}
            className="w-24 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Cluster Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClusters.map((cluster) => {
          const isCritical = cluster.riskLevel === 'CRITICAL';
          const isHigh = cluster.riskLevel === 'HIGH';
          const isOptimumMoisture = cluster.moistureContentPercent <= activePlant.preferredMoistureMax;

          return (
            <div
              key={cluster.id}
              className="bg-white border border-slate-200 hover:border-emerald-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {cluster.farmCount} Registered Farms
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {cluster.name}
                    </h3>
                  </div>

                  {/* Risk Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1 shrink-0 ${
                      isCritical
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isHigh
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>{cluster.riskLevel}</span>
                  </div>
                </div>

                {/* Location & Distance */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {cluster.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    {cluster.distanceKm} km away
                  </span>
                </div>

                {/* Grid Metric Specifications */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Biomass</p>
                    <p className="text-base font-black text-slate-900 mt-0.5">{cluster.totalBiomassTons} <span className="text-xs font-normal text-slate-500">Tons</span></p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Harvest Window</p>
                    <p className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cluster.harvestWindowDays}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Moisture Content</p>
                    <p className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${isOptimumMoisture ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <Droplets className="w-3.5 h-3.5" />
                      {cluster.moistureContentPercent}%
                      {isOptimumMoisture && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-normal">Optimal</span>}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Bale Density</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {cluster.baleDensityKgM3} kg/m³
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Offer Price</p>
                  <p className="text-lg font-black text-emerald-700">
                    ₹{cluster.askingPricePerTon} <span className="text-xs font-normal text-slate-500">/ Tonne</span>
                  </p>
                </div>

                <button
                  onClick={() => handleOpenProcureModal(cluster)}
                  className="px-4 py-2.5 bg-[#0a251c] hover:bg-[#12382b] text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer group/btn"
                >
                  <span>Procure Cluster</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClusters.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700">No clusters match your current filters</h4>
          <p className="text-xs text-slate-500 mt-1">Try expanding moisture range or selecting ALL risk levels.</p>
        </div>
      )}

      {/* Procure / Bid Modal */}
      {procureModalCluster && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {orderConfirmed ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Biomass Purchase Order Confirmed!</h3>
                <p className="text-sm text-slate-600">
                  {requestedTonnage} Tonnes reserved from <strong>{procureModalCluster.name}</strong> for {activePlant.name}. Dispatch notice sent to logistics team.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase">Purchase Contract</span>
                    <h3 className="text-lg font-black text-slate-900">{procureModalCluster.name}</h3>
                  </div>
                  <button
                    onClick={() => setProcureModalCluster(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-600 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination Biogas Plant:</span>
                      <strong className="text-slate-800">{activePlant.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Farm Cluster Location:</span>
                      <strong className="text-slate-800">{procureModalCluster.location}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Moisture Content:</span>
                      <strong className="text-emerald-700">{procureModalCluster.moistureContentPercent}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Distance to Plant Gate:</span>
                      <strong className="text-slate-800">{procureModalCluster.distanceKm} km</strong>
                    </div>
                  </div>

                  {/* Quantity Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Procurement Quantity:</span>
                      <span className="text-emerald-700 font-bold">{requestedTonnage} Tonnes</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max={procureModalCluster.totalBiomassTons}
                      step="10"
                      value={requestedTonnage}
                      onChange={(e) => setRequestedTonnage(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Rate per Tonne Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contract Rate Offer (₹ / Tonne):
                    </label>
                    <input
                      type="number"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Price Calculation Summary */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-950">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-700">Total Purchase Value</p>
                      <p className="text-xl font-black text-emerald-900">
                        ₹{(requestedTonnage * bidPrice).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-200/60 px-2 py-1 rounded-full">
                        Includes ESG Carbon Credit Certificate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setProcureModalCluster(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="px-5 py-2.5 bg-[#0a251c] hover:bg-[#12382b] text-emerald-400 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Purchase Order</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
