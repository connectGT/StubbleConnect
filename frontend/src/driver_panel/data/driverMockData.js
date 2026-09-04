export const driverProfiles = [
  {
    id: 'drv-01',
    name: 'Gurpreet Singh',
    phone: '+91 98721 00112',
    truckNumber: 'PB-13-AB-4921',
    truckType: '10-Ton Hydraulic Tipper',
    capacityTons: 10.0,
    depotLocation: 'Sangrur Logistics Hub',
    rating: 4.9,
    tripsCompletedThisMonth: 28,
    earningsThisMonthRupees: 42500,
    totalTonnageDelivered: 294.0,
    status: 'ON_ACTIVE_TRIP',
  },
  {
    id: 'drv-02',
    name: 'Balwinder Singh',
    phone: '+91 98144 33221',
    truckNumber: 'PB-11-CB-8812',
    truckType: '12-Ton Multi-Axle Tipper',
    capacityTons: 12.0,
    depotLocation: 'Patiala Central Depot',
    rating: 4.8,
    tripsCompletedThisMonth: 24,
    earningsThisMonthRupees: 38200,
    totalTonnageDelivered: 276.0,
    status: 'ON_ACTIVE_TRIP',
  },
  {
    id: 'drv-03',
    name: 'Jagjit Singh',
    phone: '+91 99155 77665',
    truckNumber: 'PB-03-XY-3304',
    truckType: '10-Ton Tipper',
    capacityTons: 10.0,
    depotLocation: 'Barnala Logistics Yard',
    rating: 4.7,
    tripsCompletedThisMonth: 19,
    earningsThisMonthRupees: 31000,
    totalTonnageDelivered: 190.0,
    status: 'AVAILABLE_FOR_DISPATCH',
  }
];

export const activeTripData = {
  tripId: 'TRIP-2026-8012',
  dispatchCode: 'DISP-SANGRUR-012',
  status: 'NAVIGATING_TO_FARM', // NAVIGATING_TO_FARM | AT_FARM_LOADING | IN_TRANSIT_TO_PLANT | WEIGHBRIDGE_GATE
  driverName: 'Gurpreet Singh',
  truckNumber: 'PB-13-AB-4921',
  truckType: '10-Ton Tipper',

  // Pickup Details
  pickupClusterName: 'Cluster #12 - Sangrur East',
  farmerName: 'S. Harnek Singh',
  farmerPhone: '+91 98711 22334',
  farmLocation: 'Field No. 4, Sunam Road, Sangrur',
  landmarkNote: 'Near Sunam Electricity Substation, Turn Left at Green Tubewell Gate',
  estDistanceToFarmKm: 6.2,
  estDriveTimeToFarmMins: 12,

  // Destination Plant Details
  destinationPlantName: 'Verbio India Bio-CNG Plant',
  destinationLocation: 'Lehragaga Bypass, Sangrur',
  plantGateCode: 'GATE-01 (Weighbridge Bay 2)',
  estDistanceFarmToPlantKm: 18.5,
  estDriveTimeFarmToPlantMins: 32,

  // Biomass Cargo
  targetTonnageTons: 10.4,
  balesCount: 42,
  moistureSamplePercent: 12.2,

  // Financials & Allowance
  tripBasePayRupees: 1450,
  dieselAllowanceRupees: 450,
  totalTripPayoutRupees: 1900,
};

export const driverCompletedTripsHistory = [
  {
    tripId: 'TRIP-8011',
    date: 'Today, 11:30 AM',
    originCluster: 'Cluster #15 - Patiala West',
    destinationPlant: 'Verbio Bio-CNG Sangrur',
    netStrawTons: 10.8,
    payoutRupees: 1950,
    status: 'Completed & Paid',
    weighbridgeDocket: 'WB-2026-881',
  },
  {
    tripId: 'TRIP-8009',
    date: 'Yesterday, 04:15 PM',
    originCluster: 'Cluster #08 - Barnala North',
    destinationPlant: 'Mahindra Bio-CNG Hub',
    netStrawTons: 9.8,
    payoutRupees: 1800,
    status: 'Completed & Paid',
    weighbridgeDocket: 'WB-2026-874',
  },
  {
    tripId: 'TRIP-8004',
    date: '02 Sep 2026',
    originCluster: 'Cluster #04 - Malerkotla South',
    destinationPlant: 'EverEnviro CBG Ludhiana',
    netStrawTons: 11.2,
    payoutRupees: 2100,
    status: 'Completed & Paid',
    weighbridgeDocket: 'WB-2026-860',
  }
];

export const driverDieselLog = [
  { date: 'Today, 08:00 AM', station: 'Indian Oil Sunam', liters: 45, ratePerLiter: 87.5, amount: 3937 },
  { date: '01 Sep 2026', station: 'BPCL Sangrur Bypass', liters: 50, ratePerLiter: 87.5, amount: 4375 },
];
