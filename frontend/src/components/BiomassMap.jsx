import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check
} from 'lucide-react';

const defaultCenter = [30.211, 74.9455];

// Helper component to center map when cluster changes
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.2
      });
    }
  }, [center, zoom, map]);
  return null;
}

export default function BiomassMap({ selectedCluster, setSelectedCluster, onOpenBuyerDetails, onOpenLogistics }) {
  // Live Data States
  const [localClusters, setLocalClusters] = useState([]);
  const [localFields, setLocalFields] = useState([]);
  const [localBuyers, setLocalBuyers] = useState([]);
  const [localRoutes, setLocalRoutes] = useState([]);
  const [liveTrucks, setLiveTrucks] = useState({});
  const [truckPaths, setTruckPaths] = useState({});

  useEffect(() => {
    const fetchData = () => {
      // Fetch Clusters
      fetch('http://localhost:8000/api/v1/clusters')
        .then(res => res.json())
        .then(data => {
          if(data.status === 'success') {
            const coloredData = data.data.map((cl, i) => ({
              ...cl,
              color: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][i % 5],
              borderColor: ['#059669', '#d97706', '#2563eb', '#7c3aed', '#db2777'][i % 5]
            }));
            setLocalClusters(coloredData);
          }
        });

      // Fetch Fields
      fetch('http://localhost:8000/api/v1/fields')
        .then(res => res.json())
        .then(data => {
          if(data.status === 'success') setLocalFields(data.data);
        });

      // Fetch Buyers
      fetch('http://localhost:8000/api/v1/buyers')
        .then(res => res.json())
        .then(data => {
          if(data.status === 'success') setLocalBuyers(data.data);
        });

      // Fetch Routes
      fetch('http://localhost:8000/api/v1/routes')
        .then(res => res.json())
        .then(data => {
          if(data.status === 'success') setLocalRoutes(data.data);
        });

      // Fetch Truck Paths from backend for polyline overlay
      fetch('http://localhost:8000/api/v1/trucks/paths')
        .then(res => res.json())
        .then(data => {
          if(data.status === 'success') {
            const pathMap = {};
            data.data.forEach(t => {
              if (t.path && t.path.length > 0) {
                pathMap[t.id] = t.path;
              }
            });
            setTruckPaths(pathMap);
          }
        });
    };

    fetchData();
    window.addEventListener('refresh-dashboard-data', fetchData);
    
    // WebSocket for Live Tracking
    const ws = new WebSocket('ws://localhost:8000/api/v1/ws/tracking');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'TRUCK_UPDATE') {
        setLiveTrucks(prev => ({
          ...prev,
          [message.data.truck_id]: message.data
        }));
      }
    };
    
    return () => {
      window.removeEventListener('refresh-dashboard-data', fetchData);
      ws.close();
    };
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'street' | 'terrain'
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    fields: true,
    clusters: true,
    buyers: true,
    routes: true,
    riskHeat: false
  });

  // Center around Bathinda / South-West Punjab
  const defaultZoom = 10;

  // Custom DivIcon creator for Cluster Badges (e.g., 8, 7, 9, 6, 5)
  const createClusterIcon = (number, color, isSelected) => {
    return L.divIcon({
      className: 'custom-leaflet-div-icon',
      html: `
        <div style="
          background-color: ${color};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 13px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: all 0.2s ease;
        ">
          ${number}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Custom DivIcon for Field Pins (Green circle for active/pending, Grey for completed)
  const createFieldIcon = (status) => {
    const isCompleted = status === 'Completed';
    const bgColor = isCompleted ? '#6b7280' : '#10b981';
    const borderColor = isCompleted ? '#9ca3af' : '#ffffff';
    return L.divIcon({
      className: 'custom-leaflet-div-icon',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid ${borderColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
          cursor: pointer;
          opacity: ${isCompleted ? '0.7' : '1'};
        ">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  // Custom DivIcon for Biomass Buyer Factory
  const createBuyerIcon = () => {
    return L.divIcon({
      className: 'custom-leaflet-div-icon',
      html: `
        <div style="
          background-color: #dc2626;
          padding: 4px 6px;
          border-radius: 6px;
          border: 2px solid white;
          display: flex;
          align-items: center;
          gap: 3px;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          cursor: pointer;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M18 16h2"/>
            <path d="M6 16h2"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Toggle Fullscreen on the map container
  const toggleFullscreen = () => {
    const mapElement = document.getElementById('biomass-map-wrapper');
    if (!document.fullscreenElement) {
      if (mapElement?.requestFullscreen) {
        mapElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      id="biomass-map-wrapper"
      className="relative w-full h-[460px] lg:h-[500px] rounded-xl overflow-hidden shadow-xs border border-gray-200/90 bg-slate-900"
    >
      {/* Top Left: Map View Selector Dropdown */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-gray-200/80 backdrop-blur-xs transition-all"
          >
            <span>
              {mapType === 'satellite'
                ? 'Map View'
                : mapType === 'street'
                ? 'Road Map'
                : 'Terrain View'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 text-xs">
              <button
                onClick={() => {
                  setMapType('satellite');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                  mapType === 'satellite'
                    ? 'font-bold text-emerald-700 bg-emerald-50/60'
                    : 'text-gray-700'
                }`}
              >
                <span>Satellite Imagery</span>
                {mapType === 'satellite' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setMapType('street');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                  mapType === 'street'
                    ? 'font-bold text-emerald-700 bg-emerald-50/60'
                    : 'text-gray-700'
                }`}
              >
                <span>OpenStreetMap</span>
                {mapType === 'street' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setMapType('terrain');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                  mapType === 'terrain'
                    ? 'font-bold text-emerald-700 bg-emerald-50/60'
                    : 'text-gray-700'
                }`}
              >
                <span>CartoDB Dark Matter</span>
                {mapType === 'terrain' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Right: Layer Switcher & Fullscreen Button */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowLayersModal(!showLayersModal)}
            title="Toggle Map Layers"
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-700 flex items-center justify-center shadow-md border border-gray-200/80 backdrop-blur-xs transition-all"
          >
            <Layers className="w-4 h-4 text-gray-700" />
          </button>

          {showLayersModal && (
            <div className="absolute top-full right-0 mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-2.5 z-50 text-xs">
              <div className="font-bold text-gray-900 pb-1.5 mb-1.5 border-b border-gray-100">
                Map Layers
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                  <span>Registered Fields</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.fields}
                    onChange={(e) =>
                      setLayerVisibility({
                        ...layerVisibility,
                        fields: e.target.checked
                      })
                    }
                    className="accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                  <span>Clusters & Risk</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.clusters}
                    onChange={(e) =>
                      setLayerVisibility({
                        ...layerVisibility,
                        clusters: e.target.checked
                      })
                    }
                    className="accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                  <span>Biomass Buyers</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.buyers}
                    onChange={(e) =>
                      setLayerVisibility({
                        ...layerVisibility,
                        buyers: e.target.checked
                      })
                    }
                    className="accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                  <span>Planned Routes</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.routes}
                    onChange={(e) =>
                      setLayerVisibility({
                        ...layerVisibility,
                        routes: e.target.checked
                      })
                    }
                    className="accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                  <span>Risk Hotspots</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.riskHeat}
                    onChange={(e) =>
                      setLayerVisibility({
                        ...layerVisibility,
                        riskHeat: e.target.checked
                      })
                    }
                    className="accent-red-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-700 flex items-center justify-center shadow-md border border-gray-200/80 backdrop-blur-xs transition-all"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-gray-700" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-700" />
          )}
        </button>
      </div>

      {/* Bottom Left: Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0c1e18]/90 text-white p-2.5 rounded-lg border border-[#1d4336] shadow-lg backdrop-blur-xs text-[11px] select-none">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/80 inline-block shrink-0"></span>
            <span className="text-gray-200">Registered Fields</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2.5 rounded-xs border-2 border-dashed border-emerald-400 bg-emerald-500/30 inline-block shrink-0"></span>
            <span className="text-gray-200">Clusters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-red-600 border border-white/80 flex items-center justify-center text-[8px] font-bold shrink-0">
              ⚡
            </span>
            <span className="text-gray-200">Biomass Buyers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block shrink-0"></span>
            <span className="text-gray-200">Planned Routes</span>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Custom Controller */}
        <MapViewController
          center={selectedCluster ? selectedCluster.center : defaultCenter}
          zoom={defaultZoom}
        />

        {/* Tile Layers */}
        {mapType === 'satellite' && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        {mapType === 'street' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapType === 'terrain' && (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* Cluster Polygons and Center Badges */}
        {layerVisibility.clusters &&
          localClusters.map((cl) => {
            const isSelected = selectedCluster?.id === cl.id;
            return (
              <React.Fragment key={cl.id}>
                {/* Cluster Area Boundary */}
                <Polygon
                  positions={cl.polygon}
                  pathOptions={{
                    color: cl.borderColor || cl.color,
                    weight: isSelected ? 3 : 2,
                    dashArray: '5, 5',
                    fillColor: cl.color,
                    fillOpacity: isSelected ? 0.35 : 0.22,
                  }}
                  eventHandlers={{
                    click: () => setSelectedCluster(cl),
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-xs font-sans">
                      <div className="font-bold text-gray-900">{cl.name}</div>
                      <div className="text-gray-600">
                        {cl.farmsCount ?? cl.farms_count ?? 0} Farms &bull; {cl.totalBiomass ?? cl.total_biomass ?? 0} T Biomass
                      </div>
                      <div className="text-red-600 font-semibold mt-0.5">
                        Risk Score: {cl.riskScore ?? 0}/100
                      </div>
                      <div className="text-[10px] text-blue-600 font-bold mt-1 uppercase">Click to inspect cluster &rarr;</div>
                    </div>
                  </Tooltip>
                </Polygon>

                {/* Central Cluster Badge (8, 7, 9, 6, 5) */}
                <Marker
                  position={cl.center}
                  icon={createClusterIcon(cl.number, cl.color, isSelected)}
                  eventHandlers={{
                    click: () => setSelectedCluster(cl),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="text-xs font-sans text-center">
                      <div className="font-bold">{cl.name}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Click to select</div>
                    </div>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* Risk Hotspots Overlay */}
        {layerVisibility.riskHeat &&
          localClusters
            .filter((cl) => (cl.riskScore ?? 0) >= 65 && cl.polygon && cl.polygon.length > 0)
            .map((cl) => (
              <Polygon
                key={`risk-heat-${cl.id}`}
                positions={cl.polygon}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#dc2626',
                  fillOpacity: 0.45,
                  weight: 3,
                }}
                eventHandlers={{
                  click: () => setSelectedCluster(cl),
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans font-bold text-red-700">
                    🔥 HIGH RISK THERMAL HOTSPOT: {cl.name} (Risk: {cl.riskScore}/100)
                  </div>
                </Tooltip>
              </Polygon>
            ))}

        {/* Planned Logistics Routes (Dashed Lines) */}
        {layerVisibility.routes &&
          localRoutes.map((rt) => (
            <Polyline
              key={rt.id}
              positions={rt.path}
              pathOptions={{
                color: '#38bdf8', // Cyan / Light blue
                weight: 4,
                dashArray: '6, 6',
                opacity: 0.95,
              }}
              eventHandlers={{
                click: () => {
                  if (onOpenLogistics) onOpenLogistics(rt);
                }
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans">
                  <div className="font-bold text-cyan-800">{rt.code}</div>
                  <div className="text-gray-700">
                    To: {rt.buyer} ({rt.buyerLocation})
                  </div>
                  <div className="text-gray-600">
                    {rt.stops} Stops &bull; {rt.tonnage} Tonnes
                  </div>
                  <div className="text-[10px] text-cyan-600 font-bold mt-1 uppercase">Click to inspect route in Logistics Modal &rarr;</div>
                </div>
              </Tooltip>
            </Polyline>
          ))}

        {/* Registered Farm Fields */}
        {layerVisibility.fields &&
          localFields.map((f) => (
            <Marker 
              key={f.id} 
              position={f.coords} 
              icon={createFieldIcon(f.status)}
              eventHandlers={{
                click: () => window.dispatchEvent(new CustomEvent('open-fields-directory')),
              }}
            >
              <Tooltip direction="top" offset={[0, -5]}>
                <div className="text-xs font-sans">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-800">{f.name || f.farmer_name || 'Farm Field'}</span>
                    {f.status === 'Completed' ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold text-[9px]">Completed</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">Pending</span>
                    )}
                  </div>
                  <div className="text-gray-700 font-medium">{f.farmer_name || f.farmer || 'Farmer'}</div>
                  <div className="text-gray-500">
                    {f.village} &bull; {f.acres || f.area_acres || 0} Acres &bull; {f.biomass || f.biomass_est || 0} Tonnes
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">Click for Fields Directory &rarr;</div>
                </div>
              </Tooltip>
            </Marker>
          ))}

        {/* Biomass Buyers (Red Factories) */}
        {layerVisibility.buyers &&
          localBuyers.map((b) => (
            <Marker
              key={b.id}
              position={b.coords}
              icon={createBuyerIcon()}
              eventHandlers={{
                click: () => onOpenBuyerDetails && onOpenBuyerDetails(b),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="text-xs font-sans">
                  <div className="font-bold text-red-700">{b.name}</div>
                  <div className="text-gray-600">{b.type} &bull; {b.location}</div>
                  <div className="text-gray-700 font-semibold mt-0.5">
                    Capacity: {b.currentCapacity} / {b.maxCapacity} T ({b.percentage}%)
                  </div>
                  <div className="text-[10px] text-red-600 font-bold mt-1 uppercase">Click for Off-Taker Details &rarr;</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
          
        {/* Truck Route Paths (faint ghost lines showing planned road) */}
        {Object.entries(truckPaths).map(([truckId, pathData]) => (
          <Polyline
            key={`path-${truckId}`}
            positions={pathData.path}
            pathOptions={{
              color: pathData.color || '#94a3b8',
              weight: 2,
              opacity: 0.3,
              dashArray: '4, 8',
            }}
          />
        ))}

        {/* Live Truck Tracking */}
        {Object.values(liveTrucks).map((truck) => {
          const isLate = truck.delay_status && truck.delay_status !== 'On Time';
          return (
            <Marker
              key={truck.truck_id}
              position={truck.position}
              eventHandlers={{
                click: () => onOpenLogistics && onOpenLogistics(),
              }}
              icon={L.divIcon({
                className: 'custom-truck-icon',
                html: `
                  <div style="position:relative;">
                    <div style="
                      background-color: ${truck.color || '#3b82f6'};
                      width: 34px;
                      height: 34px;
                      border-radius: 50%;
                      border: 2.5px solid white;
                      box-shadow: 0 3px 8px rgba(0,0,0,0.45);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 16px;
                      cursor: pointer;
                    ">
                      🚚
                    </div>
                    ${isLate ? `<div style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:white;border-radius:50%;width:14px;height:14px;font-size:9px;display:flex;align-items:center;justify-content:center;border:1.5px solid white;font-weight:bold;">!</div>` : ''}
                  </div>
                `,
                iconSize: [34, 34],
                iconAnchor: [17, 17],
              })}
            >
              <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                <div className="font-sans text-xs min-w-[180px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-gray-900 text-sm">{truck.truck_id}</span>
                    <span style={{ color: truck.color || '#3b82f6' }} className="font-bold text-xs">●</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-semibold text-gray-800">{truck.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination</span>
                      <span className="font-semibold text-gray-800">{truck.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Load</span>
                      <span className="font-semibold text-gray-800">{truck.tonnage}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                      <span className="text-gray-500">ETA</span>
                      <span className="font-bold text-emerald-700">{truck.eta_mins} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Schedule</span>
                      <span className={`font-bold ${isLate ? 'text-red-600' : 'text-emerald-600'}`}>
                        {truck.delay_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-blue-600 font-bold mt-1.5 pt-1 border-t border-gray-100 uppercase tracking-wide">
                    Click → Open Logistics Panel
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
