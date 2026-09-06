import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrc = path.resolve(__dirname, '../src');

console.log('======================================================================');
console.log('🧪 ADVERSARIAL CHALLENGER: FarmerDashboard.jsx & State Integrity Test');
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
    console.error(`  [FAIL] [${severity}] ${testName}: ${details}`);
    findings.push({ testName, details, severity });
  }
}

const dashPath = path.join(frontendSrc, 'components/FarmerDashboard.jsx');
const dashCode = fs.readFileSync(dashPath, 'utf8');

// ─── SUITE 1: TAB SWITCHING & PROPS INTEGRATION ────────────────────────────
console.log('--- SUITE 1: Tab Switching & Props Integration ---');

// 1.1 Props signature accepts activeTab, onTabChange, and fields
assert(
  dashCode.includes('activeTab: propActiveTab') &&
  dashCode.includes('onTabChange') &&
  dashCode.includes('fields: propFields'),
  'FarmerDashboard accepts activeTab, onTabChange, and fields props',
  'FarmerDashboard component signature does not properly destructure activeTab, onTabChange, or fields'
);

// 1.2 Synchronization with propActiveTab via useEffect
assert(
  dashCode.includes('setInternalTab(propActiveTab)') &&
  dashCode.includes('[propActiveTab]'),
  'FarmerDashboard synchronizes internalTab with propActiveTab changes via useEffect',
  'FarmerDashboard does not sync internalTab when propActiveTab updates'
);

// 1.3 onTabChange is triggered on tab selection
assert(
  dashCode.includes('if (onTabChange) onTabChange(tab);'),
  'FarmerDashboard notifies parent via onTabChange when tab is selected',
  'setActiveTab does not invoke onTabChange callback'
);

// 1.4 Handlers for internal tab switching
assert(
  dashCode.includes("onClick={() => setActiveTab('payments')}") &&
  dashCode.includes('View Payment History →'),
  'Overview tab "View Payment History →" button triggers setActiveTab("payments")',
  'Overview card does not wire click handler to payments tab'
);

// 1.5 Adversarial Probe: Handling of App.jsx initial activeTab="dashboard"
// App.jsx initializes `const [activeTab, setActiveTab] = useState('dashboard');`
// In FarmerDashboard, tab ids are: 'overview', 'fields', 'payments', 'alerts'
// If propActiveTab is 'dashboard', what tab is rendered?
const hasOverviewTabCheck = dashCode.includes("activeTab === 'overview'");
const handlesDashboardAlias = (
  dashCode.includes("activeTab === 'overview' || activeTab === 'dashboard'") ||
  dashCode.includes("activeTab === 'dashboard'") ||
  dashCode.includes("(propActiveTab === 'dashboard' ? 'overview' : propActiveTab)")
);

assert(
  handlesDashboardAlias,
  'FarmerDashboard safely maps activeTab="dashboard" (App.jsx default) to "overview" or renders overview tab',
  'CRITICAL: When App.jsx passes activeTab="dashboard", FarmerDashboard renders NONE of the tabs because it expects "overview", leaving a blank panel on initial login!',
  'HIGH'
);


// ─── SUITE 2: BADGE RENDERING & NOTIFICATIONS ──────────────────────────────
console.log('\n--- SUITE 2: Badge Rendering & Alerts Logic ---');

// Simulate the dynamicAlerts generator from FarmerDashboard
function generateAlerts(myFields, farmerUser = { name: 'Gurmit Singh', village: 'Mehma Bhagwana', fpoId: '#88392' }, now = new Date('2026-09-06T12:00:00Z')) {
  const alerts = [];
  let id = 1;
  const name = farmerUser?.name || 'Farmer';
  const village = farmerUser?.village || 'Punjab';
  const fpoId = farmerUser?.fpoId || '#88392';

  myFields.forEach((field, i) => {
    const fieldName = field.name || `Farm ${String.fromCharCode(65 + i)}`;
    const location = field.location || field.village || village;
    const status = field.status || 'Registered';
    const tonnes = Number(field.biomass_est || field.biomass || ((field.acres || 0) * 2.5) || 0);
    const rate = Number(field.rate || 2500);
    const payout = tonnes * rate;
    const harvestDate = field.harvest_date || field.harvestDate || 'Upcoming';

    if (status === 'Completed' || status === 'Sold & Paid') {
      alerts.push({
        id: id++,
        icon: '💰',
        text: `Biomass collection completed for ${fieldName}. Payout of ₹${payout.toLocaleString()} processed.`,
        time: `Completed (${harvestDate})`,
        type: 'success'
      });
      alerts.push({
        id: id++,
        icon: '✅',
        text: `Field collection verified and closed for ${fieldName} in ${location} (${tonnes}T collected).`,
        time: 'Verified',
        type: 'success'
      });
    } else if (status === 'Pickup Scheduled') {
      alerts.push({
        id: id++,
        icon: '🚛',
        text: `Logistics scheduled for ${fieldName} — Pickup pending. Truck assigned for collection.`,
        time: `Target Date: ${harvestDate}`,
        type: 'info'
      });
      alerts.push({
        id: id++,
        icon: '📋',
        text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'}).`,
        time: 'Active',
        type: 'neutral'
      });
    } else {
      alerts.push({
        id: id++,
        icon: '📋',
        text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'}). Pending cluster assignment.`,
        time: `Harvest: ${harvestDate}`,
        type: 'info'
      });
      alerts.push({
        id: id++,
        icon: '🌱',
        text: `${fieldName} queued for biomass cluster aggregation & buyer matching.`,
        time: 'Pending Route',
        type: 'neutral'
      });
    }

    if (field.harvest_date || field.harvestDate) {
      try {
        const hdStr = field.harvest_date || field.harvestDate;
        const diff = Math.ceil((new Date(hdStr) - now) / (1000 * 60 * 60 * 24));
        if (diff <= 3 && status !== 'Completed' && status !== 'Sold & Paid') {
          alerts.push({
            id: id++,
            icon: '⚠️',
            text: `Harvest window closing in ${Math.max(0, diff)} days for ${fieldName}`,
            time: 'Urgent',
            type: 'warning'
          });
        }
      } catch { /* ignore date parse errors */ }
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      id: id++,
      icon: '🌾',
      text: `Welcome to StubbleConnect, ${name}! Your profile is verified with FPO ${fpoId}.`,
      time: 'Just now',
      type: 'neutral'
    });
    alerts.push({
      id: id++,
      icon: '📢',
      text: 'No active fields found. Register your field to begin biomass collection and logistics matching.',
      time: 'Action Required',
      type: 'info'
    });
  }

  return alerts;
}

// 2.1 Zero fields -> 2 welcome alerts, badge = 2
const zeroFieldAlerts = generateAlerts([]);
assert(
  zeroFieldAlerts.length === 2 && zeroFieldAlerts[0].icon === '🌾' && zeroFieldAlerts[1].icon === '📢',
  'Empty fields produces exactly 2 fallback welcome/action alerts',
  `Expected 2 alerts, got ${zeroFieldAlerts.length}`
);

// 2.2 Field with urgent harvest window produces 3 alerts (2 status + 1 urgent warning)
const urgentField = [{ name: 'Farm Urgent', status: 'Pickup Scheduled', harvest_date: '2026-09-08', acres: 5 }];
const urgentAlerts = generateAlerts(urgentField, undefined, new Date('2026-09-06T12:00:00Z'));
assert(
  urgentAlerts.length === 3 && urgentAlerts.some(a => a.icon === '⚠️' && a.type === 'warning'),
  'Field with harvest window <= 3 days generates an extra warning alert (3 total)',
  `Expected 3 alerts with warning, got ${urgentAlerts.length}`
);

// 2.3 Completed field does NOT generate harvest window closing alert even if harvest date was recent
const completedRecentField = [{ name: 'Farm Done', status: 'Completed', harvest_date: '2026-09-06', acres: 5 }];
const completedAlerts = generateAlerts(completedRecentField, undefined, new Date('2026-09-06T12:00:00Z'));
assert(
  completedAlerts.length === 2 && !completedAlerts.some(a => a.icon === '⚠️'),
  'Completed field excludes urgent harvest warning alert',
  'Completed field erroneously included urgent harvest warning alert'
);

// 2.4 Tab badge JSX rendering check
assert(
  dashCode.includes("{ id: 'alerts', label: t('alerts'), badge: dynamicAlerts.length }"),
  'Alerts tab definition attaches dynamicAlerts.length to badge',
  'Alerts tab does not define badge'
);

// Check if tab badge JSX renders safely without rendering a naked "0"
const badgeJsxMatch = dashCode.match(/tab\.badge\s*&&\s*<span/);
assert(
  badgeJsxMatch !== null,
  'Tab badge expression renders conditionally with {tab.badge && <span ...>}',
  'Badge rendering expression does not match expected JSX pattern'
);


// ─── SUITE 3: TOTAL EARNINGS & BIOMASS CALCULATIONS ────────────────────────
console.log('\n--- SUITE 3: Total Earnings & Biomass Calculations ---');

function calculateCompleted(fields) {
  return fields
    .filter(f => f.status === 'Completed' || f.status === 'Sold & Paid')
    .map(f => {
      const tonnes = Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0);
      const rate = Number(f.rate || 2500);
      const calculatedPayout = tonnes * rate;
      return {
        ...f,
        calculatedTonnes: tonnes,
        calculatedRate: rate,
        calculatedPayout
      };
    });
}

function calculateTotal(completed) {
  return completed.reduce((acc, f) => acc + (f.calculatedPayout || 0), 0);
}

// 3.1 Status filter strictly includes 'Completed' and 'Sold & Paid', excludes all others
const mixedFields = [
  { id: '1', name: 'F1', status: 'Completed', biomass_est: 10 },
  { id: '2', name: 'F2', status: 'Sold & Paid', biomass_est: 15 },
  { id: '3', name: 'F3', status: 'Pending', biomass_est: 20 },
  { id: '4', name: 'F4', status: 'Pickup Scheduled', biomass_est: 25 },
  { id: '5', name: 'F5', status: 'Registered', biomass_est: 30 },
  { id: '6', name: 'F6', status: 'Cancelled', biomass_est: 35 },
];
const filteredCompleted = calculateCompleted(mixedFields);
assert(
  filteredCompleted.length === 2 &&
  filteredCompleted[0].id === '1' &&
  filteredCompleted[1].id === '2',
  'Filters only Completed and Sold & Paid fields, excluding Pending, Pickup Scheduled, Registered, and Cancelled',
  `Expected 2 fields, got ${filteredCompleted.length}`
);

// 3.2 Total sum across varied rates and acreage fallbacks
const fallbackFields = [
  { id: '1', name: 'F1', status: 'Completed', biomass_est: 12.5, rate: 2500 }, // 12.5 * 2500 = 31,250
  { id: '2', name: 'F2', status: 'Completed', acres: 6.0, rate: 2400 }, // 6 * 2.5 = 15T * 2400 = 36,000
  { id: '3', name: 'F3', status: 'Sold & Paid', biomass: 8.0 }, // 8 * 2500 = 20,000
];
const completedFallback = calculateCompleted(fallbackFields);
const totalPaid = calculateTotal(completedFallback);
assert(
  totalPaid === 87250,
  'Calculates total paid ₹87,250 with explicit rate, acreage fallback, and default rate',
  `Expected ₹87,250, got ₹${totalPaid}`
);

// 3.3 Adversarial string biomass with unit (e.g. "12.5 T")
// If backend returns f.biomass as "12.5 T" (from fields.py)
const stringBiomassField = [{ id: '1', name: 'F1', status: 'Completed', biomass: '12.5 T' }];
const stringBiomassTonnes = Number(stringBiomassField[0].biomass_est || stringBiomassField[0].biomass || ((stringBiomassField[0].acres || 0) * 2.5) || 0);

assert(
  !isNaN(stringBiomassTonnes),
  'Biomass parsing safely handles numeric strings with unit "T" without producing NaN',
  'Number("12.5 T") evaluates to NaN! In FarmerDashboard line 420, Number(f.biomass) produces NaN when biomass contains "T"',
  'MEDIUM'
);

// 3.4 Table footer displays totalPaid
assert(
  dashCode.includes('Total Paid') &&
  dashCode.includes('totalPaid.toLocaleString()'),
  'Table footer renders Total Paid with localized number formatting',
  'Footer Total Paid formatting missing'
);

// 3.5 Empty state for Payments tab
assert(
  dashCode.includes('No Completed Field Payouts') &&
  dashCode.includes('Payouts are calculated dynamically once biomass collection is marked Completed.'),
  'Clean empty state displayed when completedFields.length === 0',
  'Missing empty state description in Payments tab'
);


// ─── SUMMARY ──────────────────────────────────────────────────────────────
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
  console.log('\n🎉 ALL ADVERSARIAL TESTS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`\n⚠️ ${failedTests} ADVERSARIAL TEST(S) FAILED`);
  process.exit(1);
}
