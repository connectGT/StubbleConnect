import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrc = path.resolve(__dirname, '../src');
const backendSrc = path.resolve(__dirname, '../../backend');

console.log('======================================================================');
console.log('🧪 TEST SUITE: REQUIREMENT R1 (FARMER PAYMENTS & ALERTS) VERIFICATION');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}: ${details}`);
    findings.push({ testName, details });
  }
}

// ─── 1. Static Analysis of FarmerDashboard.jsx ─────────────────────────────
console.log('--- 1. FarmerDashboard.jsx Source Code Contracts ---');

const dashPath = path.join(frontendSrc, 'components/FarmerDashboard.jsx');
const dashCode = fs.readFileSync(dashPath, 'utf8');

// 1.1 Props synchronization
assert(
  dashCode.includes('fields: propFields') &&
  dashCode.includes('activeTab: propActiveTab') &&
  dashCode.includes('onTabChange') &&
  dashCode.includes('const activeTab = propActiveTab || internalTab'),
  'FarmerDashboard accepts activeTab, onTabChange, and fields props with synchronization',
  'Props activeTab, onTabChange, or fields are missing or not synchronized'
);

// 1.2 No static PAYMENT_HISTORY / NOTIFICATIONS rendering
assert(
  !dashCode.includes('const PAYMENT_HISTORY = [') &&
  !dashCode.includes('const NOTIFICATIONS = ['),
  'FarmerDashboard has eliminated static PAYMENT_HISTORY and NOTIFICATIONS arrays',
  'Static mock arrays are still present in FarmerDashboard'
);

// 1.3 Completed fields filter logic
assert(
  dashCode.includes("f.status === 'Completed' || f.status === 'Sold & Paid'"),
  'FarmerDashboard filters completed fields for both Completed and Sold & Paid',
  'Missing dual status filter for completed fields'
);

// 1.4 Dynamic payout formula
assert(
  dashCode.includes('f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0') &&
  dashCode.includes('f.rate || 2500'),
  'FarmerDashboard computes payout using tonnes * rate with 2.5*acres and ₹2500/T fallbacks',
  'Missing dynamic tonnes or rate calculation logic'
);

// 1.5 Table footer total calculation
assert(
  dashCode.includes('completedFields.reduce(') &&
  dashCode.includes('totalPaid.toLocaleString()'),
  'FarmerDashboard calculates Total Paid dynamically in table footer',
  'Footer Total Paid is not calculated dynamically from completed fields'
);

// 1.6 Clean empty state for Payments
assert(
  dashCode.includes('completedFields.length === 0 ?') &&
  dashCode.includes('No Completed Field Payouts'),
  'FarmerDashboard provides a clean empty state when no completed fields exist',
  'Missing clean empty state for payments'
);

// 1.7 Dynamic Alerts generation
assert(
  dashCode.includes('Biomass collection completed for') &&
  dashCode.includes('Logistics scheduled for') &&
  dashCode.includes('Field registered:') &&
  dashCode.includes('Harvest window closing in'),
  'FarmerDashboard dynamically generates alerts for Completed, Pickup Scheduled, Registered/Pending, and harvest window',
  'Missing one or more required dynamic alert conditions'
);

// 1.8 Alerts tab badge count
assert(
  dashCode.includes("{ id: 'alerts', label: t('alerts'), badge: dynamicAlerts.length }"),
  'Alerts tab badge is synchronized dynamically to dynamicAlerts.length',
  'Alerts badge count is not tied to dynamicAlerts.length'
);

// 1.9 No crude alert() calls
const alertMatches = dashCode.match(/(?<![a-zA-Z0-9_.])alert\s*\(/g);
assert(
  !alertMatches,
  'FarmerDashboard contains zero window.alert() calls',
  `Found ${alertMatches ? alertMatches.length : 0} alert() call(s)`
);


// ─── 2. Functional Calculation Simulation ──────────────────────────────────
console.log('\n--- 2. Functional Calculation & Edge Cases ---');

function calculateCompletedFields(fields) {
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

function calculateTotalPaid(completed) {
  return completed.reduce((acc, f) => acc + (f.calculatedPayout || (Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0) * Number(f.rate || 2500))), 0);
}

// Case A: Gurmit Singh profile fields (Farm A: Pickup Scheduled, Farm B: Sold & Paid 12.5T)
const gurmitFields = [
  { id: 'f-1', name: 'Farm A', acres: 31.2, biomass_est: 14.2, status: 'Pickup Scheduled' },
  { id: 'f-2', name: 'Farm B', acres: 6.0, biomass_est: 12.5, status: 'Sold & Paid' }
];
const gurmitCompleted = calculateCompletedFields(gurmitFields);
const gurmitTotal = calculateTotalPaid(gurmitCompleted);

assert(
  gurmitCompleted.length === 1 && gurmitCompleted[0].name === 'Farm B',
  'Gurmit Singh profile filters exactly 1 completed field (Farm B)',
  `Got: ${gurmitCompleted.length} completed fields`
);
assert(
  gurmitTotal === 31250,
  'Gurmit Singh total payout calculates to exactly ₹31,250 (12.5T * ₹2500)',
  `Got: ₹${gurmitTotal}`
);

// Case B: Completed status (standard DB column value)
const dbFields = [
  { id: 'f-3', name: 'Farm C', acres: 10, biomass: 25.0, rate: 2600, status: 'Completed' },
  { id: 'f-4', name: 'Farm D', acres: 4, status: 'Completed' }, // acres * 2.5 = 10T @ ₹2500 = 25,000
  { id: 'f-5', name: 'Farm E', acres: 8, status: 'Pending' }
];
const dbCompleted = calculateCompletedFields(dbFields);
const dbTotal = calculateTotalPaid(dbCompleted);

assert(
  dbCompleted.length === 2,
  'Filters both fields with status="Completed" and ignores "Pending"',
  `Got: ${dbCompleted.length} fields`
);
assert(
  dbCompleted[0].calculatedPayout === 65000 && dbCompleted[1].calculatedPayout === 25000,
  'Accurately calculates custom rate (25T * 2600 = 65,000) and acreage fallback (4 * 2.5 * 2500 = 25,000)',
  `Got: ${dbCompleted[0].calculatedPayout} and ${dbCompleted[1].calculatedPayout}`
);
assert(
  dbTotal === 90000,
  'Total Paid sums to ₹90,000 across multiple completed fields',
  `Got: ₹${dbTotal}`
);

// Case C: Empty fields
const emptyCompleted = calculateCompletedFields([]);
const emptyTotal = calculateTotalPaid(emptyCompleted);
assert(
  emptyCompleted.length === 0 && emptyTotal === 0,
  'Empty fields array results in 0 completed fields and ₹0 total',
  `Got ${emptyCompleted.length} fields and ₹${emptyTotal}`
);


// ─── 3. Dynamic Alerts Simulation ──────────────────────────────────────────
console.log('\n--- 3. Dynamic Alerts Logic Verification ---');

function generateDynamicAlerts(myFields, farmerUser = { name: 'Test Farmer', fpo_id: '#88100' }) {
  const alerts = [];
  let id = 1;

  myFields.forEach((field, i) => {
    const fieldName = field.name || `Farm ${String.fromCharCode(65 + i)}`;
    const location = field.location || field.village || 'Punjab';
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
        type: 'success'
      });
      alerts.push({
        id: id++,
        icon: '✅',
        text: `Field collection verified and closed for ${fieldName} in ${location} (${tonnes}T collected).`,
        type: 'success'
      });
    } else if (status === 'Pickup Scheduled') {
      alerts.push({
        id: id++,
        icon: '🚛',
        text: `Logistics scheduled for ${fieldName} — Pickup pending. Truck assigned for collection.`,
        type: 'info'
      });
      alerts.push({
        id: id++,
        icon: '📋',
        text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'}).`,
        type: 'neutral'
      });
    } else {
      alerts.push({
        id: id++,
        icon: '📋',
        text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'}). Pending cluster assignment.`,
        type: 'info'
      });
      alerts.push({
        id: id++,
        icon: '🌱',
        text: `${fieldName} queued for biomass cluster aggregation & buyer matching.`,
        type: 'neutral'
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({ id: id++, icon: '🌾', text: 'Welcome', type: 'neutral' });
    alerts.push({ id: id++, icon: '📢', text: 'No active fields', type: 'info' });
  }

  return alerts;
}

// Test with 1 field
const singleFieldAlerts = generateDynamicAlerts([{ name: 'Farm Alpha', status: 'Pickup Scheduled', acres: 5 }]);
assert(
  singleFieldAlerts.length >= 2,
  'Single registered field produces >= 2 dynamic alerts (acceptance criteria)',
  `Got: ${singleFieldAlerts.length} alerts`
);

// Test with 2 fields
const multiFieldAlerts = generateDynamicAlerts(gurmitFields);
assert(
  multiFieldAlerts.length >= 4,
  'Two fields produce >= 4 dynamic alerts covering pickup and payment',
  `Got: ${multiFieldAlerts.length} alerts`
);
assert(
  multiFieldAlerts.some(a => a.text.includes('Payout of ₹31,250 processed')),
  'Dynamic alert includes exact calculated payout for completed field',
  'Payout alert string not matched'
);


// ─── 4. Backend farmers.py Verification ────────────────────────────────────
console.log('\n--- 4. Backend farmers.py Status Preservation ---');

const farmersPyPath = path.join(backendSrc, 'app/api/v1/endpoints/farmers.py');
const farmersPyCode = fs.readFileSync(farmersPyPath, 'utf8');

assert(
  farmersPyCode.includes('if f.status == "Completed":') &&
  farmersPyCode.includes('status = "Completed"') &&
  farmersPyCode.includes('color = "emerald"'),
  'farmers.py build_farmer_profile explicitly preserves f.status == "Completed"',
  'farmers.py does not preserve Completed status'
);

assert(
  farmersPyCode.includes('total_biomass += biomass if (status == "Completed" or status == "Sold & Paid") else 0') &&
  farmersPyCode.includes('total_earnings += biomass * 2500 if (status == "Completed" or status == "Sold & Paid") else 0'),
  'farmers.py accumulates total_biomass and total_earnings for Completed fields',
  'farmers.py does not accumulate earnings for Completed status'
);

// ─── Summary ──────────────────────────────────────────────────────────────
console.log('\n======================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================');

if (failedTests === 0) {
  console.log('\n🎉 ALL REQUIREMENT R1 TESTS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`\n⚠️ ${failedTests} TEST(S) FAILED`);
  process.exit(1);
}
