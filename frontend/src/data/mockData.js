export const statsData = [
  {
    id: 'fields',
    title: 'Total Fields',
    value: '128',
    subtext: '+18 this week',
    trendType: 'positive',
    icon: 'Leaf',
    iconBg: 'bg-emerald-600',
    iconColor: 'text-white',
  },
  {
    id: 'biomass',
    title: 'Total Biomass (Est.)',
    value: '842.6',
    unit: 'Tonnes',
    subtext: '+124.3 this week',
    trendType: 'positive',
    icon: 'Package',
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
  },
  {
    id: 'active_clusters',
    title: 'Active Clusters',
    value: '16',
    subtext: '+3 new',
    trendType: 'positive',
    icon: 'Users',
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
  },
  {
    id: 'matched_clusters',
    title: 'Matched Clusters',
    value: '12',
    subtext: '75% of total',
    trendType: 'info',
    icon: 'Handshake',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
  },
  {
    id: 'routes_planned',
    title: 'Routes Planned',
    value: '8',
    subtext: 'Today',
    trendType: 'teal',
    icon: 'Truck',
    iconBg: 'bg-teal-600',
    iconColor: 'text-white',
  },
  {
    id: 'high_risk',
    title: 'High Risk Areas',
    value: '5',
    subtext: 'View Risk Map',
    trendType: 'danger',
    isAlert: true,
    icon: 'Flame',
    iconBg: 'bg-red-600',
    iconColor: 'text-white',
  },
];

export const clustersData = [
  {
    id: 'cluster-12',
    number: 12,
    name: 'Cluster #12',
    riskLevel: 'High Risk',
    riskScore: 85,
    farmsCount: 8,
    totalBiomass: 42.3,
    harvestWindow: '18 – 20 Aug 2025',
    avgDistance: '14.2 km',
    nearestBuyer: 'GreenFuel Plant',
    buyerLocation: 'Bathinda',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#f59e0b',
    borderColor: '#d97706',
    center: [30.22, 74.98],
    polygon: [
      [30.26, 74.93],
      [30.29, 74.99],
      [30.26, 75.05],
      [30.19, 75.04],
      [30.17, 74.96],
    ],
    recommendedAction: 'Priority collection suggested due to high burning risk.',
    farmers: [
      { name: 'Harjit Singh', village: 'Village Talwandi', acres: 12, biomass: 6.2 },
      { name: 'Gurpreet Kaur', village: 'Village Bhucho Mandi', acres: 9, biomass: 4.8 },
      { name: 'Balwinder Singh', village: 'Village Gill Patti', acres: 15, biomass: 8.1 },
      { name: 'Manjit Singh', village: 'Village Sivian', acres: 10, biomass: 5.4 },
      { name: 'Sukhdev Singh', village: 'Village Kotshamir', acres: 11, biomass: 5.9 },
      { name: 'Jagdish Ram', village: 'Village Jassi Pau Wali', acres: 8, biomass: 4.1 },
      { name: 'Amrik Singh', village: 'Village Naruana', acres: 7, biomass: 3.9 },
      { name: 'Kuldeep Singh', village: 'Village Deon', acres: 7.5, biomass: 3.9 },
    ]
  },
  {
    id: 'cluster-8',
    number: 8,
    name: 'Cluster #08',
    riskLevel: 'Moderate Risk',
    riskScore: 68,
    farmsCount: 11,
    totalBiomass: 58.4,
    harvestWindow: '19 – 22 Aug 2025',
    avgDistance: '11.5 km',
    nearestBuyer: 'GreenFuel Plant',
    buyerLocation: 'Bathinda',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#eab308',
    borderColor: '#ca8a04',
    center: [30.34, 74.92],
    polygon: [
      [30.38, 74.88],
      [30.41, 74.95],
      [30.36, 75.01],
      [30.29, 74.97],
      [30.30, 74.89],
    ],
    recommendedAction: 'Standard collection route scheduled for morning batch.'
  },
  {
    id: 'cluster-7',
    number: 7,
    name: 'Cluster #07',
    riskLevel: 'Low Risk',
    riskScore: 38,
    farmsCount: 9,
    totalBiomass: 46.8,
    harvestWindow: '21 – 24 Aug 2025',
    avgDistance: '22.0 km',
    nearestBuyer: 'GreenFuel Plant',
    buyerLocation: 'Bathinda',
    status: 'Matched',
    statusType: 'info',
    color: '#0284c7',
    borderColor: '#0369a1',
    center: [30.18, 74.58],
    polygon: [
      [30.22, 74.52],
      [30.24, 74.63],
      [30.17, 74.68],
      [30.12, 74.61],
      [30.14, 74.54],
    ],
    recommendedAction: 'Awaiting truck dispatch confirmation.'
  },
  {
    id: 'cluster-9',
    number: 9,
    name: 'Cluster #09',
    riskLevel: 'Moderate Risk',
    riskScore: 52,
    farmsCount: 7,
    totalBiomass: 35.7,
    harvestWindow: '20 – 22 Aug 2025',
    avgDistance: '16.8 km',
    nearestBuyer: 'EcoHeat Industries',
    buyerLocation: 'Mansa',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#10b981',
    borderColor: '#059669',
    center: [30.08, 74.91],
    polygon: [
      [30.13, 74.86],
      [30.14, 74.96],
      [30.07, 74.99],
      [30.02, 74.93],
      [30.04, 74.85],
    ],
    recommendedAction: 'Route #R-09 active for tomorrow morning.'
  },
  {
    id: 'cluster-6',
    number: 6,
    name: 'Cluster #06',
    riskLevel: 'Moderate Risk',
    riskScore: 61,
    farmsCount: 10,
    totalBiomass: 51.2,
    harvestWindow: '18 – 21 Aug 2025',
    avgDistance: '18.4 km',
    nearestBuyer: 'Punjab Biomass Ltd.',
    buyerLocation: 'Sangrur',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#8b5cf6',
    borderColor: '#7c3aed',
    center: [30.31, 75.32],
    polygon: [
      [30.37, 75.26],
      [30.38, 75.38],
      [30.30, 75.43],
      [30.24, 75.36],
      [30.25, 75.27],
    ],
    recommendedAction: 'Combine with Cluster #04 for heavy trailer transport.'
  },
  {
    id: 'cluster-5',
    number: 5,
    name: 'Cluster #05',
    riskLevel: 'High Risk',
    riskScore: 79,
    farmsCount: 6,
    totalBiomass: 28.9,
    harvestWindow: '17 – 19 Aug 2025',
    avgDistance: '15.1 km',
    nearestBuyer: 'EcoHeat Industries',
    buyerLocation: 'Mansa',
    status: 'Pending Match',
    statusType: 'warning',
    color: '#f97316',
    borderColor: '#ea580c',
    center: [30.02, 75.41],
    polygon: [
      [30.06, 75.36],
      [30.08, 75.46],
      [30.00, 75.49],
      [29.96, 75.43],
      [29.98, 75.35],
    ],
    recommendedAction: 'Urgent buyer match required to prevent open burning.'
  }
];

export const buyersData = [
  {
    id: 'buyer-1',
    name: 'GreenFuel Plant',
    location: 'Bathinda',
    currentCapacity: 420,
    maxCapacity: 500,
    unit: 'Tonnes',
    percentage: 84,
    coords: [30.232, 75.015],
    type: 'Biogas & Bio-CNG',
    contact: '+91 98765-43210'
  },
  {
    id: 'buyer-2',
    name: 'EcoHeat Industries',
    location: 'Mansa',
    currentCapacity: 340,
    maxCapacity: 500,
    unit: 'Tonnes',
    percentage: 68,
    coords: [30.125, 75.445],
    type: 'Biomass Pellet Plant',
    contact: '+91 98123-45678'
  },
  {
    id: 'buyer-3',
    name: 'Punjab Biomass Ltd.',
    location: 'Sangrur',
    currentCapacity: 280,
    maxCapacity: 500,
    unit: 'Tonnes',
    percentage: 56,
    coords: [30.250, 75.620],
    type: 'Thermal Power Co-generation',
    contact: '+91 98345-67890'
  }
];

export const routesData = [
  {
    id: 'route-r08',
    code: 'Route #R-08',
    cluster: 'Cluster #12',
    buyer: 'GreenFuel Plant',
    buyerLocation: 'Bathinda',
    stops: 8,
    tonnage: 42.3,
    status: 'In Progress',
    path: [
      [30.18, 74.58], // From West cluster 7
      [30.20, 74.75],
      [30.22, 74.98], // Cluster 12
      [30.232, 75.015] // GreenFuel Plant Bathinda
    ]
  },
  {
    id: 'route-r09',
    code: 'Route #R-09',
    cluster: 'Cluster #09',
    buyer: 'EcoHeat Industries',
    buyerLocation: 'Mansa',
    stops: 7,
    tonnage: 35.7,
    status: 'Scheduled',
    path: [
      [30.232, 75.015], // Bathinda
      [30.17, 75.25],   // Longowal
      [30.08, 74.91],   // Cluster 9
      [30.02, 75.41],   // Cluster 5
      [30.125, 75.445]  // EcoHeat Industries Mansa
    ]
  },
  {
    id: 'route-r10',
    code: 'Route #R-10',
    cluster: 'Cluster #04',
    buyer: 'Punjab Biomass Ltd.',
    buyerLocation: 'Sangrur',
    stops: 6,
    tonnage: 28.9,
    status: 'Scheduled',
    path: [
      [30.31, 75.32], // Cluster 6
      [30.28, 75.48],
      [30.250, 75.620] // Punjab Biomass Ltd Sangrur
    ]
  }
];

export const registeredFields = [
  { id: 'f1', name: 'Field #101', farmer: 'Harjit Singh', village: 'Talwandi', coords: [30.23, 74.94], acres: 12, biomass: '6.2 T' },
  { id: 'f2', name: 'Field #102', farmer: 'Gurpreet Kaur', village: 'Bhucho Mandi', coords: [30.28, 74.97], acres: 9, biomass: '4.8 T' },
  { id: 'f3', name: 'Field #103', farmer: 'Balwinder Singh', village: 'Kotkapura Rd', coords: [30.32, 74.82], acres: 15, biomass: '8.1 T' },
  { id: 'f4', name: 'Field #104', farmer: 'Sukhdev Singh', village: 'Maur Mandi', coords: [30.07, 75.24], acres: 11, biomass: '5.9 T' },
  { id: 'f5', name: 'Field #105', farmer: 'Jagtar Singh', village: 'Longowal North', coords: [30.18, 75.22], acres: 14, biomass: '7.2 T' },
  { id: 'f6', name: 'Field #106', farmer: 'Manjit Singh', village: 'Dirba East', coords: [30.33, 75.39], acres: 8, biomass: '4.2 T' },
  { id: 'f7', name: 'Field #107', farmer: 'Kuldeep Singh', village: 'Abohar Border', coords: [30.14, 74.52], acres: 10, biomass: '5.1 T' },
  { id: 'f8', name: 'Field #108', farmer: 'Jaswant Singh', village: 'Kotkapura', coords: [30.21, 74.62], acres: 13, biomass: '6.9 T' },
  { id: 'f9', name: 'Field #109', farmer: 'Davinder Singh', village: 'Talwandi Sabo', coords: [30.35, 74.93], acres: 16, biomass: '8.5 T' },
  { id: 'f10', name: 'Field #110', farmer: 'Hardip Singh', village: 'Dirba West', coords: [30.28, 75.29], acres: 11, biomass: '5.8 T' },
  { id: 'f11', name: 'Field #111', farmer: 'Surjit Singh', village: 'Mansa South', coords: [30.03, 75.38], acres: 9.5, biomass: '4.9 T' },
  { id: 'f12', name: 'Field #112', farmer: 'Bikramjit Singh', village: 'Bhucho Khurd', coords: [30.25, 75.03], acres: 12.5, biomass: '6.5 T' },
];

export const recentActivities = [
  {
    id: 'act-1',
    type: 'field_registered',
    icon: 'UserCheck',
    title: 'Field registered by Harjit Singh',
    subtitle: 'Village Talwandi',
    time: '10 mins ago',
  },
  {
    id: 'act-2',
    type: 'cluster_matched',
    icon: 'Share2',
    title: 'Cluster #12 matched with GreenFuel Plant',
    subtitle: null,
    time: '12 mins ago',
  },
  {
    id: 'act-3',
    type: 'route_generated',
    icon: 'Route',
    title: 'Route generated for Cluster #12',
    subtitle: null,
    time: '18 mins ago',
  },
  {
    id: 'act-4',
    type: 'field_registered',
    icon: 'UserCheck',
    title: 'Field registered by Gurpreet Kaur',
    subtitle: 'Village Bhucho Mandi',
    time: '25 mins ago',
  }
];
