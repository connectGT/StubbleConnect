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
    id: 'cluster-01',
    number: 1,
    name: 'Cluster #01',
    riskLevel: 'Moderate Risk',
    riskScore: 50,
    farmsCount: 4,
    totalBiomass: 51.5,
    harvestWindow: 'Today – Next 3 Days',
    avgDistance: '11.2 km',
    nearestBuyer: 'GreenFuel Bio-CNG Plant (Bathinda)',
    buyerLocation: 'Bathinda',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#10b981',
    borderColor: '#059669',
    center: [30.22, 74.98],
    polygon: [
      [30.235, 74.990],
      [30.208, 74.995],
      [30.205, 74.968],
      [30.230, 74.965],
      [30.235, 74.990],
    ],
    recommendedAction: 'Standard collection route scheduled for morning batch.',
    farmers: [
      { name: 'Gurmit Singh', village: 'Mehma Bhagwana', acres: 31.2, biomass: 14.2 },
      { name: 'Jaswinder Kaur', village: 'Sivian', acres: 25.3, biomass: 11.5 },
      { name: 'Avtar Singh', village: 'Gill Patti', acres: 21.6, biomass: 9.8 },
      { name: 'Manpreet Kaur', village: 'Jassi Pau Wali', acres: 35.2, biomass: 16.0 },
    ]
  },
  {
    id: 'cluster-02',
    number: 2,
    name: 'Cluster #02',
    riskLevel: 'Moderate Risk',
    riskScore: 48,
    farmsCount: 4,
    totalBiomass: 51.1,
    harvestWindow: 'Upcoming – 4 Days',
    avgDistance: '14.8 km',
    nearestBuyer: 'GreenFuel Bio-CNG Plant (Bathinda)',
    buyerLocation: 'Bathinda',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#f59e0b',
    borderColor: '#d97706',
    center: [30.27, 75.14],
    polygon: [
      [30.285, 75.150],
      [30.258, 75.155],
      [30.255, 75.128],
      [30.280, 75.125],
      [30.285, 75.150],
    ],
    recommendedAction: 'Standard collection route scheduled for morning batch.',
    farmers: [
      { name: 'Balwinder Singh', village: 'Rampura Phul', acres: 26.4, biomass: 12.0 },
      { name: 'Kuldeep Kaur', village: 'Bhucho Khurd', acres: 34.1, biomass: 15.5 },
      { name: 'Sukhdev Singh', village: 'Lehra Bega', acres: 22.4, biomass: 10.2 },
      { name: 'Paramjit Kaur', village: 'Nathana', acres: 29.5, biomass: 13.4 },
    ]
  },
  {
    id: 'cluster-03',
    number: 3,
    name: 'Cluster #03',
    riskLevel: 'High Risk',
    riskScore: 78,
    farmsCount: 4,
    totalBiomass: 50.5,
    harvestWindow: 'Past Due – Immediate',
    avgDistance: '18.5 km',
    nearestBuyer: 'Malwa Green Power Off-Taker (Mansa)',
    buyerLocation: 'Mansa',
    status: 'Matched',
    statusType: 'warning',
    color: '#ef4444',
    borderColor: '#dc2626',
    center: [30.02, 75.08],
    polygon: [
      [30.035, 75.090],
      [30.008, 75.095],
      [30.005, 75.068],
      [30.030, 75.065],
      [30.035, 75.090],
    ],
    recommendedAction: 'Priority collection suggested due to high burning risk.',
    farmers: [
      { name: 'Hardial Singh', village: 'Talwandi Sabo', acres: 28.6, biomass: 13.0 },
      { name: 'Karamjit Kaur', village: 'Maur Mandi', acres: 37.8, biomass: 17.2 },
      { name: 'Jagjit Singh', village: 'Kotshamir', acres: 18.7, biomass: 8.5 },
      { name: 'Surjit Kaur', village: 'Mandi Kalan', acres: 26.0, biomass: 11.8 },
    ]
  },
  {
    id: 'cluster-04',
    number: 4,
    name: 'Cluster #04',
    riskLevel: 'High Risk',
    riskScore: 82,
    farmsCount: 4,
    totalBiomass: 49.5,
    harvestWindow: 'Critical Window',
    avgDistance: '12.4 km',
    nearestBuyer: 'Malwa Green Power Off-Taker (Mansa)',
    buyerLocation: 'Mansa',
    status: 'Route Assigned',
    statusType: 'success',
    color: '#8b5cf6',
    borderColor: '#7c3aed',
    center: [29.99, 75.40],
    polygon: [
      [30.005, 75.410],
      [29.978, 75.415],
      [29.975, 75.388],
      [30.000, 75.385],
      [30.005, 75.410],
    ],
    recommendedAction: 'Urgent buyer match required to prevent open burning.',
    farmers: [
      { name: 'Amarjit Singh', village: 'Budhlada', acres: 33.0, biomass: 15.0 },
      { name: 'Rajinder Kaur', village: 'Bhikhi', acres: 23.8, biomass: 10.8 },
      { name: 'Satnam Singh', village: 'Jhunir', acres: 31.9, biomass: 14.5 },
      { name: 'Harbhajan Kaur', village: 'Sardulgarh', acres: 20.2, biomass: 9.2 },
    ]
  },
  {
    id: 'cluster-05',
    number: 5,
    name: 'Cluster #05',
    riskLevel: 'Moderate Risk',
    riskScore: 55,
    farmsCount: 4,
    totalBiomass: 53.9,
    harvestWindow: 'In Window',
    avgDistance: '16.0 km',
    nearestBuyer: 'Satluj Bio-Pellet Works (Kotkapura)',
    buyerLocation: 'Kotkapura',
    status: 'Pending Match',
    statusType: 'info',
    color: '#ec4899',
    borderColor: '#db2777',
    center: [30.35, 74.88],
    polygon: [
      [30.365, 74.890],
      [30.338, 74.895],
      [30.335, 74.868],
      [30.360, 74.865],
      [30.365, 74.890],
    ],
    recommendedAction: 'Standard collection route scheduled for morning batch.',
    farmers: [
      { name: 'Darshan Singh', village: 'Goniana Mandi', acres: 24.6, biomass: 11.2 },
      { name: 'Gurmeet Kaur', village: 'Jaitu', acres: 30.4, biomass: 13.8 },
      { name: 'Nirmal Singh', village: 'Bajakhana', acres: 36.3, biomass: 16.5 },
      { name: 'Daljit Kaur', village: 'Kotkapura Rural', acres: 27.3, biomass: 12.4 },
    ]
  },
  {
    id: 'cluster-06',
    number: 6,
    name: 'Cluster #06',
    riskLevel: 'Low Risk',
    riskScore: 35,
    farmsCount: 4,
    totalBiomass: 52.1,
    harvestWindow: 'Future Harvest',
    avgDistance: '22.4 km',
    nearestBuyer: 'Satluj Bio-Pellet Works (Kotkapura)',
    buyerLocation: 'Kotkapura',
    status: 'Matched',
    statusType: 'info',
    color: '#06b6d4',
    borderColor: '#0891b2',
    center: [30.18, 74.60],
    polygon: [
      [30.195, 74.610],
      [30.168, 74.615],
      [30.165, 74.588],
      [30.190, 74.585],
      [30.195, 74.610],
    ],
    recommendedAction: 'Harvest window clear. Normal queue dispatch.',
    farmers: [
      { name: 'Bikramjit Singh', village: 'Gidderbaha', acres: 30.8, biomass: 14.0 },
      { name: 'Kiranjit Kaur', village: 'Malout', acres: 27.7, biomass: 12.6 },
      { name: 'Tejinder Singh', village: 'Lambi', acres: 33.0, biomass: 15.0 },
      { name: 'Simranjit Kaur', village: 'Doda', acres: 23.1, biomass: 10.5 },
    ]
  }
];

export const buyersData = [
  {
    id: 'buyer-1',
    name: 'GreenFuel Bio-CNG Plant (Bathinda)',
    location: 'Bathinda',
    currentCapacity: 420,
    maxCapacity: 600,
    unit: 'Tonnes',
    percentage: 70,
    coords: [30.275, 74.880],
    type: 'Bio-CNG Facility',
    contact: '+91 98765-43210'
  },
  {
    id: 'buyer-2',
    name: 'Punjab Bio-Energy Refinery (Ludhiana)',
    location: 'Ludhiana',
    currentCapacity: 580,
    maxCapacity: 850,
    unit: 'Tonnes',
    percentage: 68.2,
    coords: [30.880, 75.830],
    type: 'Biogas Power Plant',
    contact: '+91 98765-43211'
  },
  {
    id: 'buyer-3',
    name: 'Malwa Green Power Off-Taker (Mansa)',
    location: 'Mansa',
    currentCapacity: 310,
    maxCapacity: 450,
    unit: 'Tonnes',
    percentage: 68.9,
    coords: [29.930, 75.340],
    type: 'Biomass Power Plant',
    contact: '+91 98765-43212'
  },
  {
    id: 'buyer-4',
    name: 'Verka Bio-Thermal Co-gen (Sangrur)',
    location: 'Sangrur',
    currentCapacity: 340,
    maxCapacity: 500,
    unit: 'Tonnes',
    percentage: 68,
    coords: [30.230, 75.820],
    type: 'Biogas Plant',
    contact: '+91 98765-43213'
  },
  {
    id: 'buyer-5',
    name: 'AgriPower Solutions Depot (Moga)',
    location: 'Moga',
    currentCapacity: 260,
    maxCapacity: 400,
    unit: 'Tonnes',
    percentage: 65,
    coords: [30.820, 75.180],
    type: 'Private Association Hub',
    contact: '+91 98765-43214'
  },
  {
    id: 'buyer-6',
    name: 'Satluj Bio-Pellet Works (Kotkapura)',
    location: 'Kotkapura',
    currentCapacity: 220,
    maxCapacity: 350,
    unit: 'Tonnes',
    percentage: 62.9,
    coords: [30.550, 74.750],
    type: 'FPO Aggregation Hub',
    contact: '+91 98765-43215'
  }
];

export const routesData = [
  {
    id: 'route-r08',
    code: 'Route #R-08',
    cluster: 'Cluster #01',
    buyer: 'GreenFuel Bio-CNG Plant (Bathinda)',
    buyerLocation: 'Bathinda',
    stops: 4,
    tonnage: 51.5,
    status: 'In Progress',
    path: [
      [30.275, 74.880], // GreenFuel Plant
      [30.235, 74.990], // Farm 1
      [30.208, 74.995], // Farm 2
      [30.205, 74.968], // Farm 3
      [30.230, 74.965], // Farm 4
      [30.275, 74.880]  // Return to Plant
    ]
  },
  {
    id: 'route-r09',
    code: 'Route #R-09',
    cluster: 'Cluster #04',
    buyer: 'Malwa Green Power Off-Taker (Mansa)',
    buyerLocation: 'Mansa',
    stops: 4,
    tonnage: 49.5,
    status: 'Scheduled',
    path: [
      [29.930, 75.340], // Malwa Plant
      [30.005, 75.410], // Farm 1
      [29.978, 75.415], // Farm 2
      [29.975, 75.388], // Farm 3
      [30.000, 75.385], // Farm 4
      [29.930, 75.340]  // Return to Plant
    ]
  },
  {
    id: 'route-r10',
    code: 'Route #R-10',
    cluster: 'Cluster #05',
    buyer: 'Satluj Bio-Pellet Works (Kotkapura)',
    buyerLocation: 'Kotkapura',
    stops: 4,
    tonnage: 53.9,
    status: 'Scheduled',
    path: [
      [30.550, 74.750], // Satluj Plant
      [30.365, 74.890], // Farm 1
      [30.338, 74.895], // Farm 2
      [30.335, 74.868], // Farm 3
      [30.360, 74.865], // Farm 4
      [30.550, 74.750]  // Return to Plant
    ]
  }
];

export const registeredFields = [
  { id: 'f1', name: 'Field #101', farmer: 'Harjit Singh', farmer_name: 'Harjit Singh', village: 'Talwandi', coords: [30.23, 74.94], acres: 12, biomass: '6.2 T', status: 'Pending' },
  { id: 'f2', name: 'Field #102', farmer: 'Gurpreet Kaur', farmer_name: 'Gurpreet Kaur', village: 'Bhucho Mandi', coords: [30.28, 74.97], acres: 9, biomass: '4.8 T', status: 'Pending' },
  { id: 'f3', name: 'Field #103', farmer: 'Balwinder Singh', farmer_name: 'Balwinder Singh', village: 'Kotkapura Rd', coords: [30.32, 74.82], acres: 15, biomass: '8.1 T', status: 'Pending' },
  { id: 'f4', name: 'Field #104', farmer: 'Sukhdev Singh', farmer_name: 'Sukhdev Singh', village: 'Maur Mandi', coords: [30.07, 75.24], acres: 11, biomass: '5.9 T', status: 'Pending' },
  { id: 'f5', name: 'Field #105', farmer: 'Jagtar Singh', farmer_name: 'Jagtar Singh', village: 'Longowal North', coords: [30.18, 75.22], acres: 14, biomass: '7.2 T', status: 'Pending' },
  { id: 'f6', name: 'Field #106', farmer: 'Manjit Singh', farmer_name: 'Manjit Singh', village: 'Dirba East', coords: [30.33, 75.39], acres: 8, biomass: '4.2 T', status: 'Pending' },
  { id: 'f7', name: 'Field #107', farmer: 'Kuldeep Singh', farmer_name: 'Kuldeep Singh', village: 'Abohar Border', coords: [30.14, 74.52], acres: 10, biomass: '5.1 T', status: 'Pending' },
  { id: 'f8', name: 'Field #108', farmer: 'Jaswant Singh', farmer_name: 'Jaswant Singh', village: 'Kotkapura', coords: [30.21, 74.62], acres: 13, biomass: '6.9 T', status: 'Pending' },
  { id: 'f9', name: 'Field #109', farmer: 'Davinder Singh', farmer_name: 'Davinder Singh', village: 'Talwandi Sabo', coords: [30.35, 74.93], acres: 16, biomass: '8.5 T', status: 'Pending' },
  { id: 'f10', name: 'Field #110', farmer: 'Hardip Singh', farmer_name: 'Hardip Singh', village: 'Dirba West', coords: [30.28, 75.29], acres: 11, biomass: '5.8 T', status: 'Pending' },
  { id: 'f11', name: 'Field #111', farmer: 'Surjit Singh', farmer_name: 'Surjit Singh', village: 'Mansa South', coords: [30.03, 75.38], acres: 9.5, biomass: '4.9 T', status: 'Completed' },
  { id: 'f12', name: 'Field #112', farmer: 'Bikramjit Singh', farmer_name: 'Bikramjit Singh', village: 'Bhucho Khurd', coords: [30.25, 75.03], acres: 12.5, biomass: '6.5 T', status: 'Completed' },
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
