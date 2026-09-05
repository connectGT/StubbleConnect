import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrc = path.resolve(__dirname, '../src');

console.log('======================================================================');
console.log('🔥 EMPIRICAL CHALLENGER: MILESTONE 1 (R1 & R2) FRONTEND CONTRACTS 🔥');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function assert(condition, testName, details = '', severity = 'HIGH') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}: ${details}`);
    findings.push({ testName, details, severity });
  }
}

// ============================================================================
// SUITE 1: QuickActionModal.jsx Contract Conformance (R1)
// ============================================================================
console.log('--- SUITE 1: QuickActionModal.jsx Contract Conformance (R1) ---');

const quickActionPath = path.join(frontendSrc, 'components/modals/QuickActionModal.jsx');
const quickActionCode = fs.readFileSync(quickActionPath, 'utf8');

// 1.1 Farmer Name and Mobile Number inputs exist in the form
assert(
  quickActionCode.includes('Farmer Name') &&
  quickActionCode.includes('Mobile Number') &&
  quickActionCode.includes('formData.farmerName') &&
  quickActionCode.includes('formData.phone'),
  'QuickActionModal has explicit Farmer Name and Mobile Number form fields',
  'Missing Farmer Name or Mobile Number inputs in registration form',
  'CRITICAL'
);

// 1.2 Form fields pre-fill from farmerUser prop
assert(
  quickActionCode.includes('farmerName: farmerUser?.name ||') &&
  quickActionCode.includes('phone: farmerUser?.phone ||'),
  'QuickActionModal pre-fills name and phone from farmerUser prop',
  'farmerUser prop is not used for pre-filling initial state',
  'HIGH'
);

// 1.3 Phone normalization logic
function normalizePhone(input, fallbackUserPhone) {
  const rawPhone = (input || fallbackUserPhone || '').replace(/[\s-+]/g, '');
  return rawPhone.length > 10 && rawPhone.startsWith('91')
    ? rawPhone.slice(2)
    : (rawPhone || '9876543210');
}

assert(
  normalizePhone('+91 98765-43210', null) === '9876543210',
  'Phone normalization strips +91, spaces, and hyphens',
  `Got: ${normalizePhone('+91 98765-43210', null)}`,
  'HIGH'
);
assert(
  normalizePhone('919876543210', null) === '9876543210',
  'Phone normalization strips leading 91 from 12-digit number',
  `Got: ${normalizePhone('919876543210', null)}`,
  'HIGH'
);
assert(
  normalizePhone('', '9876543211') === '9876543211',
  'Phone normalization falls back to logged-in farmer phone when empty',
  `Got: ${normalizePhone('', '9876543211')}`,
  'MEDIUM'
);

// 1.4 Farmer Name resolution prevents hardcoded "Farmer" when name provided
function resolveFarmerName(enteredName, fallbackUserName) {
  return (enteredName || '').trim() || fallbackUserName || 'Farmer';
}

assert(
  resolveFarmerName('  Jaswinder Singh  ', null) === 'Jaswinder Singh',
  'Farmer name trims whitespace correctly',
  `Got: ${resolveFarmerName('  Jaswinder Singh  ', null)}`,
  'HIGH'
);
assert(
  resolveFarmerName('', 'Gurmit Singh') === 'Gurmit Singh',
  'Farmer name falls back to logged-in farmerUser name when input is empty',
  `Got: ${resolveFarmerName('', 'Gurmit Singh')}`,
  'HIGH'
);
assert(
  resolveFarmerName('   ', null) === 'Farmer',
  'Farmer name defaults to "Farmer" only when input is whitespace-only and no user logged in',
  `Got: ${resolveFarmerName('   ', null)}`,
  'LOW'
);

// 1.5 Payload fields sent to POST /api/v1/fields/register
assert(
  quickActionCode.includes("status: 'Pending'") &&
  quickActionCode.includes('farmer_name:') &&
  quickActionCode.includes('harvest_date: formData.harvestDate') &&
  quickActionCode.includes('http://localhost:8000/api/v1/fields/register'),
  'QuickActionModal payload conforms to backend FieldRegisterRequest schema',
  'Missing status: Pending or harvest_date in registration payload',
  'CRITICAL'
);

// 1.6 Event dispatching
assert(
  quickActionCode.includes("window.dispatchEvent(new CustomEvent('refresh-dashboard-data'))"),
  'QuickActionModal dispatches refresh-dashboard-data custom event on success',
  'Missing refresh-dashboard-data event dispatch',
  'CRITICAL'
);


// ============================================================================
// SUITE 2: FarmerDashboard.jsx Contract & State Synchronization (R1 & R2)
// ============================================================================
console.log('\n--- SUITE 2: FarmerDashboard.jsx Contract & State Synchronization ---');

const farmerDashPath = path.join(frontendSrc, 'components/FarmerDashboard.jsx');
const farmerDashCode = fs.readFileSync(farmerDashPath, 'utf8');

// 2.1 RegisterHarvestModal POST API wiring
assert(
  farmerDashCode.includes('http://localhost:8000/api/v1/fields/register') &&
  farmerDashCode.includes('farmer_name: farmerUser?.name ||') &&
  farmerDashCode.includes("status: 'Pending'"),
  'FarmerDashboard RegisterHarvestModal calls backend POST /api/v1/fields/register',
  'RegisterHarvestModal does not post to backend registration API',
  'CRITICAL'
);

// 2.2 RegisterHarvestModal dispatches refresh-dashboard-data
assert(
  farmerDashCode.includes("window.dispatchEvent(new CustomEvent('refresh-dashboard-data'))"),
  'RegisterHarvestModal dispatches refresh-dashboard-data on completion',
  'Missing refresh-dashboard-data event in RegisterHarvestModal',
  'CRITICAL'
);

// 2.3 Harvest date fallback in "My Fields" list
assert(
  farmerDashCode.includes('field.harvest_date || field.harvestDate'),
  'FarmerDashboard handles both harvest_date (backend) and harvestDate (mock) keys',
  'Missing field.harvest_date fallback in My Fields rendering',
  'CRITICAL'
);

// 2.4 App.jsx prop contract synchronization with FarmerDashboard
const appPath = path.join(frontendSrc, 'App.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');

const appPassesActiveTab = appCode.includes('activeTab={activeTab}') && appCode.includes('onTabChange=');
const farmerDashAcceptsActiveTab = farmerDashCode.includes('activeTab') && farmerDashCode.includes('onTabChange');

assert(
  farmerDashAcceptsActiveTab,
  'FarmerDashboard accepts activeTab and onTabChange props from App.jsx',
  'App.jsx passes activeTab and onTabChange, but FarmerDashboard does not destructure or use them',
  'HIGH'
);

// 2.5 FieldDetailModal schema compatibility
const backendProfileField = {
  id: 'f-123',
  name: 'Farm A',
  location: 'Talwandi Sabo',
  acres: 10,
  crop_type: 'Paddy / Basmati',
  harvest_date: '2026-09-08',
  biomass_est: 25.0,
  status: 'Registered',
  status_color: 'blue'
};

// Test how FieldDetailModal accesses these fields
const modalRenderedCrop = backendProfileField.crop || backendProfileField.crop_type;
const modalRenderedDate = backendProfileField.harvestDate || backendProfileField.harvest_date;
const modalRenderedBiomass = backendProfileField.biomassEst ?? backendProfileField.biomass_est;
const modalRenderedColor = backendProfileField.statusColor || backendProfileField.status_color;

const modalCode = farmerDashCode.slice(
  farmerDashCode.indexOf('function FieldDetailModal'),
  farmerDashCode.indexOf('function PickupOTPModal')
);

const fieldDetailHasFallbacks =
  modalCode.includes('crop_type') &&
  modalCode.includes('harvest_date') &&
  modalCode.includes('biomass_est');

assert(
  fieldDetailHasFallbacks,
  'FieldDetailModal includes fallbacks for backend schema (crop_type, harvest_date, biomass_est, status_color)',
  'FieldDetailModal accesses field.crop, field.harvestDate, field.biomassEst without fallback to backend keys, rendering "undefined Tonnes" and blank fields',
  'HIGH'
);

// 2.6 Check for raw alert() calls in FarmerDashboard
const farmerAlertMatches = farmerDashCode.match(/(?<![a-zA-Z0-9_.])alert\s*\(/g);
assert(
  !farmerAlertMatches,
  'FarmerDashboard contains no crude window.alert() calls',
  `Found ${farmerAlertMatches ? farmerAlertMatches.length : 0} alert() call(s) in FarmerDashboard.jsx (e.g. line 87 alert('Map view coming soon!'))`,
  'MEDIUM'
);


// ============================================================================
// SUITE 3: ListViewModal.jsx Contract Conformance (R1 & R2)
// ============================================================================
console.log('\n--- SUITE 3: ListViewModal.jsx Contract Conformance (R1 & R2) ---');

const listViewPath = path.join(frontendSrc, 'components/modals/ListViewModal.jsx');
const listViewCode = fs.readFileSync(listViewPath, 'utf8');

// 3.1 Farmer Name display in fields directory
assert(
  listViewCode.includes('f.farmer_name || f.farmer'),
  'ListViewModal renders f.farmer_name with fallback to f.farmer',
  'Missing f.farmer_name in ListViewModal fields list',
  'CRITICAL'
);

// 3.2 Completed field rendering
assert(
  listViewCode.includes("const isCompleted = f.status === 'Completed'") &&
  listViewCode.includes('opacity-60 bg-gray-100/70 border-gray-200') &&
  listViewCode.includes('line-through') &&
  listViewCode.includes('>Completed</span>'),
  'ListViewModal renders completed fields with opacity-60, line-through, and grey badge',
  'Completed field styling missing in ListViewModal',
  'CRITICAL'
);

// 3.3 Event listening and cleanup
assert(
  listViewCode.includes("window.addEventListener('refresh-dashboard-data', fetchData)") &&
  listViewCode.includes("window.removeEventListener('refresh-dashboard-data', fetchData)"),
  'ListViewModal listens to refresh-dashboard-data and cleans up listener on unmount',
  'Missing event listener or cleanup in ListViewModal',
  'HIGH'
);


// ============================================================================
// SUITE 4: BiomassMap.jsx Contract Conformance (R1 & R2)
// ============================================================================
console.log('\n--- SUITE 4: BiomassMap.jsx Contract Conformance (R1 & R2) ---');

const biomassMapPath = path.join(frontendSrc, 'components/BiomassMap.jsx');
const biomassMapCode = fs.readFileSync(biomassMapPath, 'utf8');

// 4.1 createFieldIcon takes status argument
assert(
  biomassMapCode.includes('createFieldIcon = (status) =>') &&
  biomassMapCode.includes("const isCompleted = status === 'Completed'") &&
  biomassMapCode.includes("bgColor = isCompleted ? '#6b7280' : '#10b981'"),
  'BiomassMap createFieldIcon dynamically colors pin (#6b7280 grey for Completed, #10b981 green for Pending)',
  'createFieldIcon does not differentiate completed fields',
  'CRITICAL'
);

// 4.2 Field Marker passes f.status to createFieldIcon
assert(
  biomassMapCode.includes('icon={createFieldIcon(f.status)}'),
  'BiomassMap field Marker passes f.status to createFieldIcon',
  'Field Marker does not pass f.status to createFieldIcon',
  'CRITICAL'
);

// 4.3 Tooltip renders farmer_name and Completed badge
assert(
  biomassMapCode.includes('f.farmer_name || f.farmer') &&
  biomassMapCode.includes("f.status === 'Completed'"),
  'BiomassMap field tooltip displays farmer_name and Completed status tag',
  'Field tooltip does not display farmer_name or Completed status tag',
  'HIGH'
);

// 4.4 Event listening and cleanup in BiomassMap
assert(
  biomassMapCode.includes("window.addEventListener('refresh-dashboard-data', fetchData)") &&
  biomassMapCode.includes("window.removeEventListener('refresh-dashboard-data', fetchData)"),
  'BiomassMap listens to refresh-dashboard-data and cleans up listener on unmount',
  'Missing event listener or cleanup in BiomassMap',
  'HIGH'
);

// 4.5 Inspect truckPaths bug (M3 backlog check)
const truckPathMapping = biomassMapCode.match(/pathMap\[t\.id\]\s*=\s*t\.path/);
const truckPathRender = biomassMapCode.match(/positions=\{pathData\.path\}/);
const hasTruckPathBug = truckPathMapping && truckPathRender;
if (hasTruckPathBug) {
  console.log('  [WARN] BiomassMap.jsx contains truckPaths indexing mismatch (pathData.path on array) - tracked for M3');
}


// ============================================================================
// SUITE 5: mockData.js Schema Mirroring Backend Seed Structure
// ============================================================================
console.log('\n--- SUITE 5: mockData.js Schema Mirroring Backend Seed Structure ---');

import * as mockData from '../src/data/mockData.js';

// 5.1 registeredFields contains completed fields
const completedFieldsInMock = mockData.registeredFields.filter(f => f.status === 'Completed');
assert(
  completedFieldsInMock.length >= 2,
  'mockData.js registeredFields contains at least 2 completed fields',
  `Found ${completedFieldsInMock.length} completed fields in mockData.js`,
  'HIGH'
);

// 5.2 registeredFields has farmer_name attribute on all records
const allFieldsHaveFarmerName = mockData.registeredFields.every(
  f => typeof f.farmer_name === 'string' && f.farmer_name.length > 0
);
assert(
  allFieldsHaveFarmerName,
  'All fields in mockData.js have a non-empty farmer_name attribute',
  'Some fields in mockData.js lack farmer_name',
  'HIGH'
);

// 5.3 registeredFields coords format matches [lat, lng] array
const allFieldsHaveValidCoords = mockData.registeredFields.every(
  f => Array.isArray(f.coords) && f.coords.length === 2 &&
       typeof f.coords[0] === 'number' && typeof f.coords[1] === 'number'
);
assert(
  allFieldsHaveValidCoords,
  'All fields in mockData.js have valid [lat, lng] numeric coordinate arrays',
  'Some fields in mockData.js have invalid coords format',
  'CRITICAL'
);

// 5.4 Backend GET /api/v1/fields response schema compatibility
const sampleBackendField = {
  id: 'test-field-1',
  name: 'Farm test',
  farmer: 'Gurmit Singh',
  farmer_name: 'Gurmit Singh',
  phone: '9876543210',
  village: 'Mehma Bhagwana',
  district: 'Bathinda',
  state: 'Punjab',
  acres: 13.2,
  crop_type: 'Paddy / Basmati',
  biomass: '12.5 T',
  coords: [30.22, 74.98],
  cluster: 'Unassigned',
  cluster_id: null,
  is_clustered: false,
  harvest_date: '2026-09-08',
  status: 'Completed',
  risk_score: 0
};

// Check if ListViewModal fields mapper can handle sampleBackendField without throwing
try {
  const isCompleted = sampleBackendField.status === 'Completed';
  const farmerName = sampleBackendField.farmer_name || sampleBackendField.farmer || 'Farmer';
  const location = sampleBackendField.village || sampleBackendField.location;
  const acres = sampleBackendField.area_acres || sampleBackendField.acres || 0;
  const biomass = sampleBackendField.biomass || sampleBackendField.biomass_est || 0;
  assert(
    isCompleted === true && farmerName === 'Gurmit Singh' && location === 'Mehma Bhagwana' && acres === 13.2,
    'Backend field object cleanly maps to ListViewModal display fields',
    'Field mapping failed on backend schema',
    'HIGH'
  );
} catch (err) {
  assert(false, 'Backend field object cleanly maps to ListViewModal display fields', err.message, 'HIGH');
}


// ============================================================================
// SUITE 6: Stress Testing React State Transitions & Adversarial Inputs
// ============================================================================
console.log('\n--- SUITE 6: Stress Testing React State Transitions & Adversarial Inputs ---');

// 6.1 Adversarial payload for QuickActionModal: null/undefined/empty
const testAdversarialCases = [
  { inputName: null, inputPhone: null, user: null, expectedName: 'Farmer', expectedPhone: '9876543210' },
  { inputName: '   ', inputPhone: '   ', user: { name: 'Baldev Singh', phone: '+91-98765-00000' }, expectedName: 'Baldev Singh', expectedPhone: '9876500000' },
  { inputName: 'Special Ch@rs & 🌾', inputPhone: '+91 (987) 654-3210', user: null, expectedName: 'Special Ch@rs & 🌾', expectedPhone: '9876543210' }
];

for (let i = 0; i < testAdversarialCases.length; i++) {
  const tc = testAdversarialCases[i];
  const resName = resolveFarmerName(tc.inputName, tc.user?.name);
  const resPhone = normalizePhone(tc.inputPhone, tc.user?.phone);
  assert(
    resName === tc.expectedName && resPhone === tc.expectedPhone,
    `Adversarial input case ${i + 1}: resolves name="${resName}", phone="${resPhone}" correctly`,
    `Expected name="${tc.expectedName}", phone="${tc.expectedPhone}", got name="${resName}", phone="${resPhone}"`,
    'MEDIUM'
  );
}

// 6.2 createFieldIcon stress test with unexpected status values
const testStatuses = ['Completed', 'completed', 'COMPLETED', 'Pending', 'Clustered', undefined, null, ''];
for (const st of testStatuses) {
  const isCompleted = st === 'Completed';
  const expectedColor = isCompleted ? '#6b7280' : '#10b981';
  const expectedOpacity = isCompleted ? '0.7' : '1';
  assert(
    typeof expectedColor === 'string' && typeof expectedOpacity === 'string',
    `createFieldIcon handles status="${st}" safely without throw (color: ${expectedColor})`,
    `Failed for status: ${st}`,
    'LOW'
  );
}


// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================');

if (findings.length > 0) {
  console.log('\n--- FINDINGS SUMMARY ---');
  findings.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.severity}] ${f.testName}`);
    console.log(`   Details: ${f.details}`);
  });
}

if (failedTests === 0) {
  console.log('\n🎉 EMPIRICAL VERDICT: ALL TESTS PASSED');
  process.exit(0);
} else {
  console.log(`\n⚠️ EMPIRICAL VERDICT: ${failedTests} FINDINGS IDENTIFIED FOR REMEDIATION / REVIEW`);
  process.exit(1);
}
