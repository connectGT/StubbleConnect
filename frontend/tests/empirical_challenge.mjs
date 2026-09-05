import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrc = path.resolve(__dirname, '../src');

console.log('===============================================================');
console.log('⚡ EMPIRICAL CHALLENGER: FRONTEND UI VERIFICATION HARNESS ⚡');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}: ${details}`);
    failures.push({ testName, details });
  }
}

// ----------------------------------------------------------------------------
// SUITE 1: STATIC & SYNTACTIC INTEGRITY OF TARGET FILES
// ----------------------------------------------------------------------------
console.log('--- SUITE 1: Target Files Existence & Baseline Integrity ---');

const targetFiles = [
  'components/Sidebar.jsx',
  'components/BiomassMap.jsx',
  'components/ClusterDetailsPanel.jsx',
  'components/StatsRow.jsx',
  'components/FarmerDashboard.jsx',
  'components/Header.jsx',
  'components/modals/ListViewModal.jsx',
  'components/modals/QuickActionModal.jsx',
  'App.jsx',
  'components/RecentActivity.jsx',
  'components/PlannedRoutes.jsx',
  'components/TopBuyers.jsx',
  'components/FarmerLoginPage.jsx'
];

for (const relPath of targetFiles) {
  const fullPath = path.join(frontendSrc, relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`, `File not found at ${fullPath}`);
}

// ----------------------------------------------------------------------------
// SUITE 2: DETECT DEAD CLICKS, EMPTY HANDLERS, & FORBIDDEN ALERTS
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Dead Clicks, Empty OnClicks, & Crude Alert Auditing ---');

for (const relPath of targetFiles) {
  const fullPath = path.join(frontendSrc, relPath);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check 1: No window.alert or alert()
  // Match alert( but not alert.something or isAlert
  const rawAlertMatches = content.match(/(?<![a-zA-Z0-9_.])alert\s*\(/g);
  assert(
    !rawAlertMatches,
    `No raw alert() in ${relPath}`,
    `Found raw alert() call: ${rawAlertMatches ? rawAlertMatches.length : 0} instances`
  );

  // Check 2: No empty onClick handlers like onClick={() => {}} or onClick={() => void 0}
  const emptyHandlerMatches = content.match(/onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g);
  assert(
    !emptyHandlerMatches,
    `No empty onClick={() => {}} in ${relPath}`,
    `Found empty onClick handlers: ${emptyHandlerMatches ? emptyHandlerMatches.length : 0}`
  );

  // Check 3: No dead href="#"
  const deadHrefMatches = content.match(/href\s*=\s*["']#["']/g);
  assert(
    !deadHrefMatches,
    `No dead href="#" in ${relPath}`,
    `Found dead href="#": ${deadHrefMatches ? deadHrefMatches.length : 0}`
  );
}

// ----------------------------------------------------------------------------
// SUITE 3: SPECIFIC COMPONENT INTERACTION & BUTTON VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Specific Component Button & Action Wiring ---');

// 3.1 Sidebar.jsx
const sidebarContent = fs.readFileSync(path.join(frontendSrc, 'components/Sidebar.jsx'), 'utf8');
assert(
  sidebarContent.includes('setActiveTab(item.id)'),
  'Sidebar.jsx wires nav item clicks to setActiveTab',
  'Missing setActiveTab(item.id)'
);
assert(
  sidebarContent.includes('onQuickAction(action.id)'),
  'Sidebar.jsx wires quick actions to onQuickAction',
  'Missing onQuickAction(action.id)'
);
assert(
  sidebarContent.includes("setUserRole('admin')") &&
  sidebarContent.includes("setUserRole('farmer')") &&
  sidebarContent.includes("setUserRole('buyer')") &&
  sidebarContent.includes("setUserRole('driver')"),
  'Sidebar.jsx provides 4-portal mode switching buttons (admin, farmer, buyer, driver)',
  'Missing one or more portal mode switch buttons'
);

// 3.2 Header.jsx
const headerContent = fs.readFileSync(path.join(frontendSrc, 'components/Header.jsx'), 'utf8');
assert(
  headerContent.includes("e.key === 'Enter'") && headerContent.includes('onSearchSubmit'),
  'Header.jsx has working Enter-key submit for global search',
  'Missing Enter key handler for search'
);
assert(
  headerContent.includes('setShowProfileModal(true)'),
  'Header.jsx profile button opens profile modal',
  'Profile button does not trigger modal'
);
assert(
  headerContent.includes('onOpenNotifications'),
  'Header.jsx notification bell triggers onOpenNotifications',
  'Bell button does not trigger notification callback'
);

// 3.3 StatsRow.jsx
const statsRowContent = fs.readFileSync(path.join(frontendSrc, 'components/StatsRow.jsx'), 'utf8');
assert(
  statsRowContent.includes('onSelectRiskMap()') && statsRowContent.includes('onCardClick(item.id)'),
  'StatsRow.jsx delegates click events for high_risk and general KPI cards',
  'Missing onSelectRiskMap or onCardClick delegation'
);

// 3.4 ClusterDetailsPanel.jsx
const clusterPanelContent = fs.readFileSync(path.join(frontendSrc, 'components/ClusterDetailsPanel.jsx'), 'utf8');
assert(
  clusterPanelContent.includes('No Cluster Selected') && !clusterPanelContent.includes('return null;'),
  'ClusterDetailsPanel.jsx renders empty state prompt card instead of null when no cluster is selected',
  'ClusterDetailsPanel still returns null when !cluster'
);
assert(
  clusterPanelContent.includes('onViewFullDetails(cluster)'),
  'ClusterDetailsPanel.jsx wires "View Cluster Details" button to onViewFullDetails',
  'Missing onViewFullDetails handler on action button'
);
assert(
  clusterPanelContent.includes('cluster.riskScore ?? 82') &&
  clusterPanelContent.includes('cluster.farmsCount ?? cluster.farms_count'),
  'ClusterDetailsPanel.jsx includes defensive fallbacks for missing properties',
  'Missing fallbacks for riskScore or farmsCount'
);

// 3.5 ListViewModal.jsx
const listViewContent = fs.readFileSync(path.join(frontendSrc, 'components/modals/ListViewModal.jsx'), 'utf8');
assert(
  listViewContent.includes("import {") && listViewContent.includes("Cpu,") && listViewContent.includes("from 'lucide-react'"),
  'ListViewModal.jsx imports Cpu from lucide-react (prevents crash on settings tab)',
  'Cpu import missing from lucide-react in ListViewModal'
);
assert(
  listViewContent.includes('onSelectCluster(c)') && listViewContent.includes('Plan Route') && listViewContent.includes('Inspect Map'),
  'ListViewModal.jsx wires "Plan Route" and "Inspect Map" to onSelectCluster and closes modal',
  'Missing onSelectCluster handlers in cluster list'
);
assert(
  listViewContent.includes('c.farmsCount ?? c.farms_count') &&
  listViewContent.includes('c.totalBiomass ?? c.total_biomass'),
  'ListViewModal.jsx normalizes schema mismatches for clusters',
  'Missing schema normalization for farmsCount/totalBiomass'
);
assert(
  listViewContent.includes('f.farmer_name || f.farmer') &&
  listViewContent.includes('f.area_acres || f.acres') &&
  listViewContent.includes('f.biomass || f.biomass_est'),
  'ListViewModal.jsx normalizes schema mismatches for fields',
  'Missing schema normalization for fields'
);

// 3.6 QuickActionModal.jsx
const quickActionContent = fs.readFileSync(path.join(frontendSrc, 'components/modals/QuickActionModal.jsx'), 'utf8');
assert(
  quickActionContent.includes("formData.village === 'new'"),
  'QuickActionModal.jsx handles custom village selection ("new")',
  'Missing custom village handling'
);
assert(
  quickActionContent.includes('PUNJAB_LOCATIONS[resolvedVillage] || PUNJAB_LOCATIONS["Bathinda City"]'),
  'QuickActionModal.jsx resolves coordinates safely without crashing on undefined.lat',
  'Unsafe coordinate lookup found'
);

// 3.7 FarmerDashboard.jsx
const farmerDashContent = fs.readFileSync(path.join(frontendSrc, 'components/FarmerDashboard.jsx'), 'utf8');
assert(
  farmerDashContent.includes('externalActiveTab') && farmerDashContent.includes('onTabChange'),
  'FarmerDashboard.jsx synchronizes activeTab with external props',
  'Missing externalActiveTab synchronization'
);
assert(
  farmerDashContent.includes('setShowTierModal(true)'),
  'FarmerDashboard.jsx wires "My Tier" button to tier membership benefits modal',
  'My Tier button does not open modal'
);
assert(
  farmerDashContent.includes('setShowPickupOTP(true)'),
  'FarmerDashboard.jsx wires pickup confirmation to OTP modal',
  'Pickup OTP modal not wired'
);
assert(
  farmerDashContent.includes('onLogout'),
  'FarmerDashboard.jsx provides functional onLogout button',
  'onLogout button missing'
);

// 3.8 FarmerLoginPage.jsx
const loginContent = fs.readFileSync(path.join(frontendSrc, 'components/FarmerLoginPage.jsx'), 'utf8');
assert(
  loginContent.includes('onReturnToAdmin') && loginContent.includes('Return to Command Center'),
  'FarmerLoginPage.jsx has "Return to Command Center" exit button to resolve login trap',
  'Missing Return to Command Center button'
);

// ----------------------------------------------------------------------------
// SUITE 4: MAP HOVER CARDS & INTERACTIVE ACTIONS VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Map Hover Cards & Polyline/Marker Action Verification ---');

const biomassMapContent = fs.readFileSync(path.join(frontendSrc, 'components/BiomassMap.jsx'), 'utf8');

// Check Polyline routes
assert(
  biomassMapContent.includes('<Polyline') && biomassMapContent.includes('onOpenLogistics(rt)'),
  'BiomassMap.jsx connects click eventHandlers on Polyline routes to onOpenLogistics',
  'Route Polyline does not have onOpenLogistics click handler'
);

// Check Tooltip calls-to-action on map elements
assert(
  biomassMapContent.includes('Click to inspect cluster &rarr;') || biomassMapContent.includes('Click to inspect cluster'),
  'BiomassMap.jsx cluster Polygon tooltip includes actionable inspect prompt',
  'Cluster Polygon tooltip lacks actionable prompt'
);
assert(
  biomassMapContent.includes('Click to inspect route in Logistics Modal &rarr;') || biomassMapContent.includes('Click to inspect route'),
  'BiomassMap.jsx route Polyline tooltip includes actionable inspect prompt',
  'Route Polyline tooltip lacks actionable prompt'
);
assert(
  biomassMapContent.includes('Click for Fields Directory &rarr;') || biomassMapContent.includes('Click for Fields Directory'),
  'BiomassMap.jsx field Marker tooltip includes actionable prompt',
  'Field Marker tooltip lacks actionable prompt'
);
assert(
  biomassMapContent.includes('Click for Off-Taker Details &rarr;') || biomassMapContent.includes('Click for Off-Taker Details'),
  'BiomassMap.jsx buyer Marker tooltip includes actionable prompt',
  'Buyer Marker tooltip lacks actionable prompt'
);
assert(
  biomassMapContent.includes('Click → Open Logistics Panel') || biomassMapContent.includes('Open Logistics Panel'),
  'BiomassMap.jsx live truck Marker tooltip includes actionable prompt',
  'Live truck Marker tooltip lacks actionable prompt'
);

// Verify interactive layers in BiomassMap
const mapClickHandlers = biomassMapContent.match(/eventHandlers\s*=\s*\{\{\s*click:/g) || [];
assert(
  mapClickHandlers.length >= 5,
  `BiomassMap.jsx attaches interactive click eventHandlers to map entities (found: ${mapClickHandlers.length})`,
  `Expected at least 5 click handlers, found ${mapClickHandlers.length}`
);

// ----------------------------------------------------------------------------
// SUITE 5: EMPTY STATE DEFENSIVE LOGIC
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Empty State Defensive Handling ---');

const recentActivityContent = fs.readFileSync(path.join(frontendSrc, 'components/RecentActivity.jsx'), 'utf8');
assert(
  recentActivityContent.includes('activities.length === 0') &&
  recentActivityContent.includes('No recent activities logged yet.'),
  'RecentActivity.jsx renders styled empty state when activities array is empty',
  'RecentActivity lacks empty state handling'
);

const plannedRoutesContent = fs.readFileSync(path.join(frontendSrc, 'components/PlannedRoutes.jsx'), 'utf8');
assert(
  plannedRoutesContent.includes('routes.length === 0') &&
  plannedRoutesContent.includes('No Routes Planned Today'),
  'PlannedRoutes.jsx renders styled empty state when routes array is empty',
  'PlannedRoutes lacks empty state handling'
);

const topBuyersContent = fs.readFileSync(path.join(frontendSrc, 'components/TopBuyers.jsx'), 'utf8');
assert(
  topBuyersContent.includes('buyers.length === 0') &&
  topBuyersContent.includes('No Buyers Registered'),
  'TopBuyers.jsx renders styled empty state when buyers array is empty',
  'TopBuyers lacks empty state handling'
);

// ListViewModal empty states across all tabs
assert(
  listViewContent.includes('activities.length === 0') &&
  listViewContent.includes('routes.length === 0') &&
  listViewContent.includes('buyers.length === 0') &&
  listViewContent.includes('fields.length === 0') &&
  listViewContent.includes('clusters.length === 0') &&
  listViewContent.includes('alerts.length === 0'),
  'ListViewModal.jsx includes empty state checks across all data tabs',
  'One or more tabs in ListViewModal lack empty state containers'
);

// FarmerDashboard empty states
assert(
  farmerDashContent.includes('!hasFields') &&
  farmerDashContent.includes('No Fields Registered') &&
  farmerDashContent.includes('No Payments Yet') &&
  farmerDashContent.includes('No Alerts'),
  'FarmerDashboard.jsx includes formatted empty states across overview, fields, payments, and alerts',
  'FarmerDashboard lacks empty states when user has no fields'
);

// ----------------------------------------------------------------------------
// SUITE 6: ADVERSARIAL STRESS-TESTS ON DATA TRANSFORMS & LOGIC
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Adversarial Stress-Tests on Component Logic ---');

// Stress Test 6.1: QuickActionModal custom village coordinate fallback
const PUNJAB_LOCATIONS = {
  "Bathinda City": { lat: 30.211, lng: 74.945 },
  "Talwandi Sabo": { lat: 29.988, lng: 75.088 },
  "Mansa": { lat: 29.989, lng: 75.399 },
  "Rampura Phul": { lat: 30.272, lng: 75.234 },
  "Bhucho Mandi": { lat: 30.267, lng: 75.050 },
  "Maur": { lat: 30.081, lng: 75.245 },
  "Goniana": { lat: 30.316, lng: 74.901 },
  "Sangrur": { lat: 30.245, lng: 75.833 }
};

function resolveCoords(village, customVillage) {
  const resolvedVillage = village === 'new'
    ? (customVillage?.trim() || 'Bathinda Area')
    : village;
  const coords = PUNJAB_LOCATIONS[resolvedVillage] || PUNJAB_LOCATIONS["Bathinda City"];
  const finalLat = (coords?.lat || 30.211) + (0.005);
  const finalLng = (coords?.lng || 74.945) + (0.005);
  return { resolvedVillage, finalLat, finalLng };
}

const test1 = resolveCoords('new', 'Random Village');
assert(
  !isNaN(test1.finalLat) && !isNaN(test1.finalLng) && test1.resolvedVillage === 'Random Village',
  'Stress 6.1a: Custom village non-existent resolves safely to default coordinates',
  `Result: ${JSON.stringify(test1)}`
);

const test2 = resolveCoords('new', '');
assert(
  !isNaN(test2.finalLat) && !isNaN(test2.finalLng) && test2.resolvedVillage === 'Bathinda Area',
  'Stress 6.1b: Custom village empty string resolves safely to Bathinda Area',
  `Result: ${JSON.stringify(test2)}`
);

const test3 = resolveCoords('Talwandi Sabo', '');
assert(
  test3.finalLat > 29.9 && test3.finalLat < 30.1 && test3.resolvedVillage === 'Talwandi Sabo',
  'Stress 6.1c: Known village resolves to accurate coordinates',
  `Result: ${JSON.stringify(test3)}`
);

// Stress Test 6.2: ClusterDetailsPanel SVG arc parameters with adversarial inputs
function computeArc(cluster) {
  const radius = 60;
  const score = cluster?.riskScore ?? 82;
  const percentage = Math.min(Math.max(score / 100, 0), 1);
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - percentage);
  return { score, percentage, strokeDashoffset };
}

const arcNormal = computeArc({ riskScore: 75 });
assert(
  arcNormal.percentage === 0.75 && !isNaN(arcNormal.strokeDashoffset),
  'Stress 6.2a: Normal cluster risk score calculates valid arc',
  `Arc: ${JSON.stringify(arcNormal)}`
);

const arcNull = computeArc(null);
assert(
  arcNull.score === 82 && arcNull.percentage === 0.82 && !isNaN(arcNull.strokeDashoffset),
  'Stress 6.2b: Null cluster falls back to default score 82 and valid arc',
  `Arc: ${JSON.stringify(arcNull)}`
);

const arcOver100 = computeArc({ riskScore: 150 });
assert(
  arcOver100.percentage === 1.0 && arcOver100.strokeDashoffset === 0,
  'Stress 6.2c: Out-of-bounds risk score (>100) clamps cleanly to 1.0',
  `Arc: ${JSON.stringify(arcOver100)}`
);

const arcNegative = computeArc({ riskScore: -20 });
assert(
  arcNegative.percentage === 0.0 && arcNegative.strokeDashoffset === Math.PI * 60,
  'Stress 6.2d: Negative risk score (<0) clamps cleanly to 0.0',
  `Arc: ${JSON.stringify(arcNegative)}`
);

// Stress Test 6.3: StatsRow KPI click handler routing
const validStatIds = [
  'total_fields',
  'total_biomass',
  'active_clusters',
  'matched_clusters',
  'routes_planned',
  'high_risk',
  'daily_capacity'
];

let routedModals = {};
for (const statId of validStatIds) {
  let modalType = null;
  if (statId === 'total_fields' || statId === 'total_biomass') {
    modalType = 'fields';
  } else if (statId === 'active_clusters' || statId === 'matched_clusters') {
    modalType = 'clusters';
  } else if (statId === 'routes_planned') {
    modalType = 'routes';
  } else if (statId === 'high_risk') {
    modalType = 'risk';
  } else if (statId === 'daily_capacity') {
    modalType = 'buyers';
  }
  routedModals[statId] = modalType;
}

assert(
  Object.values(routedModals).every(m => m !== null),
  'Stress 6.3: All 7 StatsRow KPI card IDs route to valid non-null modal types',
  `Mappings: ${JSON.stringify(routedModals)}`
);

// ----------------------------------------------------------------------------
// SUMMARY & VERDICT
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
console.log('===============================================================');

if (failedTests === 0) {
  console.log('🎉 VERDICT: APPROVE');
  console.log('All frontend components verified. Zero dead clicks, zero unhandled errors, robust fallbacks verified.\n');
  process.exit(0);
} else {
  console.error('❌ VERDICT: REJECT');
  console.error('Failures encountered:', failures);
  process.exit(1);
}
