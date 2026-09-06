import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mock localStorage for Node environment
globalThis.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; }
};

import FarmerDashboard from '../src/components/FarmerDashboard.jsx';

console.log('======================================================================');
console.log('⚔️  EMPIRICAL CHALLENGER: FARMER DASHBOARD PAYMENTS & ALERTS SUITE ⚔️');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, testName, details = '', severity = 'HIGH') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
    testResults.push({ name: testName, status: 'PASS', details: '' });
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} - ${details} (Severity: ${severity})`);
    testResults.push({ name: testName, status: 'FAIL', details, severity });
  }
}

// ============================================================================
// SUITE 1: PAYOUT CALCULATIONS & FIELD STATUSES (EMPIRICAL MOUNTING)
// ============================================================================
console.log('\n--- SUITE 1: Payout Calculations & Field Statuses (Empirical Mount) ---');

// 1.1 Single standard Completed field
{
  const field = {
    id: 'f-c1',
    name: 'Farm Alpha',
    harvest_date: '2026-09-01',
    biomass_est: 10.0,
    rate: 2500,
    status: 'Completed'
  };
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields: [field] },
    activeTab: 'payments'
  }));

  assert(html.includes('Farm Alpha'), 'Completed field name rendered in payments table');
  assert(html.includes('10'), 'Completed field tonnes (10) rendered in table');
  assert(html.includes('₹2,500'), 'Completed field rate (₹2,500) rendered in table');
  assert(html.includes('₹25,000'), 'Calculated payout (₹25,000) rendered in table');
  assert(html.includes('Paid'), 'Paid status badge rendered for completed field');
  assert(html.includes('Total Paid</td><td class="px-3 py-2.5 font-black text-emerald-700">₹25,000'), 'Table footer Total Paid is ₹25,000');
}

// 1.2 Status 'Sold & Paid' also treated as completed payout
{
  const field = {
    id: 'f-sp1',
    name: 'Farm Beta',
    harvestDate: '2026-08-25',
    biomass: 15.0,
    rate: 2600,
    status: 'Sold & Paid'
  };
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields: [field] },
    activeTab: 'payments'
  }));

  assert(html.includes('Farm Beta'), 'Sold & Paid field rendered in payments table');
  assert(html.includes('₹39,000'), 'Sold & Paid field payout (15T * ₹2600 = ₹39,000) rendered');
  assert(html.includes('Total Paid</td><td class="px-3 py-2.5 font-black text-emerald-700">₹39,000'), 'Footer Total Paid is ₹39,000');
}

// 1.3 Fallback to acres * 2.5 when biomass_est and biomass are absent
{
  const field = {
    id: 'f-acres',
    name: 'Farm Acres Only',
    harvest_date: '2026-09-02',
    acres: 8, // 8 * 2.5 = 20 Tonnes
    status: 'Completed'
    // rate omitted -> fallback to 2500
  };
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields: [field] },
    activeTab: 'payments'
  }));

  assert(html.includes('Farm Acres Only'), 'Acres fallback field rendered in table');
  assert(html.includes('20'), 'Derived tonnes (8 acres * 2.5 = 20T) rendered in table');
  assert(html.includes('₹50,000'), 'Calculated payout (20T * ₹2500 = ₹50,000) rendered in table');
  assert(html.includes('Total Paid</td><td class="px-3 py-2.5 font-black text-emerald-700">₹50,000'), 'Footer Total Paid is ₹50,000');
}

// 1.4 Non-completed statuses MUST NOT appear in payments table
{
  const fields = [
    { id: 'f-pending', name: 'Farm Pending', status: 'Pending', biomass_est: 20 },
    { id: 'f-pickup', name: 'Farm Pickup', status: 'Pickup Scheduled', biomass_est: 30 },
    { id: 'f-cancelled', name: 'Farm Cancelled', status: 'Cancelled', biomass_est: 40 },
    { id: 'f-done', name: 'Farm Done', status: 'Completed', biomass_est: 10, rate: 2500 }
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields },
    activeTab: 'payments'
  }));

  assert(html.includes('Farm Done'), 'Completed field included in payments table');
  assert(!html.includes('Farm Pending'), 'Pending field excluded from payments table');
  assert(!html.includes('Farm Pickup'), 'Pickup Scheduled field excluded from payments table');
  assert(!html.includes('Farm Cancelled'), 'Cancelled field excluded from payments table');
  assert(html.includes('Total Paid</td><td class="px-3 py-2.5 font-black text-emerald-700">₹25,000'), 'Footer Total Paid reflects only Completed field (₹25,000)');
}

// 1.5 Multi-field summation in payments footer
{
  const fields = [
    { id: 'f-1', name: 'Field 1', status: 'Completed', biomass_est: 10, rate: 2500 }, // 25,000
    { id: 'f-2', name: 'Field 2', status: 'Sold & Paid', biomass_est: 5, rate: 3000 },  // 15,000
    { id: 'f-3', name: 'Field 3', status: 'Completed', acres: 4, rate: 2500 }           // 4*2.5=10 -> 25,000
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields },
    activeTab: 'payments'
  }));

  // Total should be 25,000 + 15,000 + 25,000 = 65,000
  assert(html.includes('Field 1') && html.includes('Field 2') && html.includes('Field 3'), 'All 3 completed fields rendered');
  assert(html.includes('Total Paid</td><td class="px-3 py-2.5 font-black text-emerald-700">₹65,000'), 'Footer correctly sums multiple completed fields to ₹65,000');
}

// 1.6 String numeric inputs and floating point rates
{
  const field = {
    id: 'f-str',
    name: 'Farm String Num',
    status: 'Completed',
    biomass_est: '12.5',
    rate: '2400'
  };
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields: [field] },
    activeTab: 'payments'
  }));

  // 12.5 * 2400 = 30000
  assert(html.includes('₹30,000'), 'String numeric biomass and rate parsed correctly (₹30,000)');
}

// 1.7 Zero biomass calculation
{
  const field = {
    id: 'f-zero',
    name: 'Farm Zero',
    status: 'Completed',
    biomass_est: 0,
    biomass: 0,
    acres: 0,
    rate: 2500
  };
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields: [field] },
    activeTab: 'payments'
  }));

  assert(html.includes('Farm Zero'), 'Zero biomass field rendered');
  assert(html.includes('₹0'), 'Zero biomass yields ₹0 total payout');
}

// 1.8 Empty state when 0 completed fields exist
{
  const fields = [
    { id: 'f-p', name: 'Farm P', status: 'Pending', acres: 5 }
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Harpreet Singh', fields },
    activeTab: 'payments'
  }));

  assert(html.includes('No Completed Field Payouts'), 'Empty payments state rendered when no completed fields exist');
  assert(html.includes('Payouts are calculated dynamically once biomass collection is marked Completed.'), 'Helpful explanation text rendered in empty payments state');
  assert(!html.includes('<tbody>'), 'Table body is not rendered when completed fields array is empty');
}

// ============================================================================
// SUITE 2: ALERTS GENERATION ACROSS STATUS COMBINATIONS & BOUNDARIES
// ============================================================================
console.log('\n--- SUITE 2: Dynamic Alerts Generation & Date Boundaries ---');

// 2.1 Status 'Completed' / 'Sold & Paid' alerts
{
  const fields = [
    { id: 'f-c', name: 'Farm Complete', location: 'Bathinda', status: 'Completed', biomass_est: 12, rate: 2500, harvest_date: '2026-09-01' }
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Gurmit Singh', fields },
    activeTab: 'alerts'
  }));

  // Payout = 12 * 2500 = 30,000
  assert(html.includes('Biomass collection completed for Farm Complete. Payout of ₹30,000 processed.'), 'Completed field generates payout processed alert (💰)');
  assert(html.includes('Field collection verified and closed for Farm Complete in Bathinda (12T collected).'), 'Completed field generates verified and closed alert (✅)');
}

// 2.2 Status 'Pickup Scheduled' alerts
{
  const fields = [
    { id: 'f-pickup', name: 'Farm Transit', location: 'Mansa', status: 'Pickup Scheduled', acres: 10, crop_type: 'Basmati', harvest_date: '2026-09-20' }
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Gurmit Singh', fields },
    activeTab: 'alerts'
  }));

  assert(html.includes('Logistics scheduled for Farm Transit — Pickup pending. Truck assigned for collection.'), 'Pickup Scheduled generates logistics alert (🚛)');
  assert(html.includes('Field registered: Farm Transit in Mansa (10 Acres, Basmati).'), 'Pickup Scheduled generates field registered alert (📋)');
}

// 2.3 Status 'Pending' / 'Registered' alerts
{
  const fields = [
    { id: 'f-pending', name: 'Farm Waiting', location: 'Rampura', status: 'Pending', acres: 7, crop_type: 'Paddy', harvest_date: '2026-09-30' }
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Gurmit Singh', fields },
    activeTab: 'alerts'
  }));

  assert(html.includes('Field registered: Farm Waiting in Rampura (7 Acres, Paddy). Pending cluster assignment.'), 'Pending generates registration and cluster assignment alert (📋)');
  assert(html.includes('Farm Waiting queued for biomass cluster aggregation & buyer matching.'), 'Pending generates cluster queue alert (🌱)');
}

// 2.4 Approaching Harvest Date Window Boundary Tests
// We test dates relative to today's date
{
  const now = new Date();
  
  // Format Date to YYYY-MM-DD
  const formatDate = (daysAhead) => {
    const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  // Case 2.4.1: Harvest date 2 days ahead (diff = 2 <= 3) -> Warning alert!
  {
    const fields = [
      { id: 'f-urgent', name: 'Farm Urgent', status: 'Pending', harvest_date: formatDate(2) }
    ];
    const html = renderToString(React.createElement(FarmerDashboard, {
      farmerUser: { name: 'Farmer Test', fields },
      activeTab: 'alerts'
    }));
    assert(html.includes('Harvest window closing in') && html.includes('Farm Urgent'), 'Harvest date in 2 days triggers urgent warning alert (⚠️)');
  }

  // Case 2.4.2: Harvest date 3 days ahead (diff = 3 <= 3) -> Warning alert!
  {
    const fields = [
      { id: 'f-day3', name: 'Farm Day3', status: 'Pending', harvest_date: formatDate(3) }
    ];
    const html = renderToString(React.createElement(FarmerDashboard, {
      farmerUser: { name: 'Farmer Test', fields },
      activeTab: 'alerts'
    }));
    assert(html.includes('Harvest window closing in') && html.includes('Farm Day3'), 'Harvest date boundary in 3 days triggers urgent warning alert (⚠️)');
  }

  // Case 2.4.3: Harvest date 5 days ahead (diff = 5 > 3) -> NO warning alert!
  {
    const fields = [
      { id: 'f-safe', name: 'Farm Safe', status: 'Pending', harvest_date: formatDate(5) }
    ];
    const html = renderToString(React.createElement(FarmerDashboard, {
      farmerUser: { name: 'Farmer Test', fields },
      activeTab: 'alerts'
    }));
    assert(!html.includes('Harvest window closing in'), 'Harvest date in 5 days (> 3 days) does NOT trigger warning alert');
  }

  // Case 2.4.4: Harvest date past/today but status is 'Completed' -> NO warning alert!
  {
    const fields = [
      { id: 'f-completed-past', name: 'Farm Done Past', status: 'Completed', harvest_date: formatDate(-1), biomass_est: 10 }
    ];
    const html = renderToString(React.createElement(FarmerDashboard, {
      farmerUser: { name: 'Farmer Test', fields },
      activeTab: 'alerts'
    }));
    assert(!html.includes('Harvest window closing in'), 'Completed field with past harvest date does NOT trigger harvest closing warning');
  }

  // Case 2.4.5: Invalid harvest date string does not crash and does not trigger false warning
  {
    const fields = [
      { id: 'f-invalid-date', name: 'Farm Bad Date', status: 'Pending', harvest_date: 'invalid-date-string' }
    ];
    let html = '';
    let crashed = false;
    try {
      html = renderToString(React.createElement(FarmerDashboard, {
        farmerUser: { name: 'Farmer Test', fields },
        activeTab: 'alerts'
      }));
    } catch (e) {
      crashed = true;
    }
    assert(!crashed, 'Invalid harvest date string does not crash FarmerDashboard');
    assert(!html.includes('Harvest window closing in'), 'Invalid harvest date string does not trigger false harvest closing warning');
  }
}

// 2.5 Empty state alerts
{
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'New Farmer', fpo_id: '#FPO-99', fields: [] },
    activeTab: 'alerts'
  }));

  assert(html.includes('Welcome to StubbleConnect, New Farmer!'), 'Empty state generates welcome notification (🌾)');
  assert(html.includes('No active fields found. Register your field'), 'Empty state generates action required prompt (📢)');
  assert(html.includes('Recent Notifications') && html.includes('2 updates'), 'Empty state shows header with exactly 2 updates');
  assert(html.includes('>2<'), 'Tab bar renders badge count of 2 for empty state alerts');
}

// 2.6 Multi-field alert accumulation & dynamic tab badge
{
  const fields = [
    { id: 'f-1', name: 'Farm A', status: 'Pickup Scheduled', harvest_date: '2026-09-25' },
    { id: 'f-2', name: 'Farm B', status: 'Sold & Paid', harvest_date: '2026-08-17', biomass_est: 12.5 }
  ];
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Gurmit Singh', fields },
    activeTab: 'alerts'
  }));

  // Farm A: 2 alerts (logistics + registered). Farm B: 2 alerts (completed payout + verified).
  // Total >= 4 alerts
  assert(html.includes('>4<'), 'Tab bar renders badge count of 4 for two registered fields');
  assert(html.includes('4 updates'), 'Alerts header displays "4 updates"');
}

// ============================================================================
// SUITE 3: ROBUSTNESS & CRASH RESISTANCE (EMPTY / NULL / ADVERSARIAL INPUTS)
// ============================================================================
console.log('\n--- SUITE 3: Empty / Null / Adversarial Inputs Safety ---');

const emptyNullScenarios = [
  { name: 'farmerUser is null', props: { farmerUser: null, activeTab: 'payments' } },
  { name: 'farmerUser is undefined', props: { farmerUser: undefined, activeTab: 'alerts' } },
  { name: 'farmerUser is empty object {}', props: { farmerUser: {}, activeTab: 'payments' } },
  { name: 'farmerUser.fields is null', props: { farmerUser: { fields: null }, activeTab: 'payments' } },
  { name: 'farmerUser.fields is undefined', props: { farmerUser: {}, activeTab: 'alerts' } },
  { name: 'propFields is null', props: { farmerUser: { fields: [] }, fields: null, activeTab: 'payments' } },
  { name: 'propFields is empty array []', props: { fields: [], activeTab: 'payments' } },
  { name: 'field object has all null values', props: {
    fields: [{ id: null, name: null, location: null, acres: null, biomass_est: null, biomass: null, rate: null, harvest_date: null, status: null }],
    activeTab: 'payments'
  }},
  { name: 'field object has all null values (alerts tab)', props: {
    fields: [{ id: null, name: null, location: null, acres: null, biomass_est: null, biomass: null, rate: null, harvest_date: null, status: null }],
    activeTab: 'alerts'
  }},
  { name: 'field object is empty object {}', props: {
    fields: [{}],
    activeTab: 'payments'
  }},
  { name: 'field object is empty object {} (alerts tab)', props: {
    fields: [{}],
    activeTab: 'alerts'
  }},
  { name: 'completed field with missing rate & biomass', props: {
    fields: [{ status: 'Completed' }],
    activeTab: 'payments'
  }}
];

for (const scenario of emptyNullScenarios) {
  let crashed = false;
  let errorMsg = '';
  let renderedHtml = '';
  try {
    renderedHtml = renderToString(React.createElement(FarmerDashboard, scenario.props));
  } catch (e) {
    crashed = true;
    errorMsg = e.message;
  }
  assert(!crashed, `Mount does not crash when ${scenario.name}`, errorMsg, 'CRITICAL');
  assert(renderedHtml.length > 500, `Render produces valid HTML layout when ${scenario.name}`);
}

// 3.2 Adversarial stress test: Array containing null/undefined elements
console.log('\n--- 3.2 Adversarial Stress Test: myFields with null elements ---');
{
  let crashed = false;
  let errorMsg = '';
  try {
    renderToString(React.createElement(FarmerDashboard, {
      fields: [null],
      activeTab: 'payments'
    }));
  } catch (e) {
    crashed = true;
    errorMsg = e.message;
  }
  console.log(`  ℹ️  Mounting with fields=[null]: ${crashed ? `CRASHED with "${errorMsg}"` : 'SURVIVED'}`);
  // Note: We record whether it crashes or survives. In standard JS, [null].filter(f => f.status) throws.
  // Standard contract requires fields to be array of field objects, but let's test if field objects themselves can be empty.
}

// ============================================================================
// SUITE 4: PROPS SYNCHRONIZATION & TAB SWITCHING
// ============================================================================
console.log('\n--- SUITE 4: Props Synchronization & Tab Switching ---');

// 4.1 Rendering with propActiveTab = 'overview'
{
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Test Farmer', fields: [] },
    activeTab: 'overview'
  }));
  assert(html.includes('Welcome to StubbleConnect!'), 'propActiveTab="overview" renders Overview tab');
}

// 4.2 Rendering with propActiveTab = 'fields'
{
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Test Farmer', fields: [] },
    activeTab: 'fields'
  }));
  assert(html.includes('No Fields Registered'), 'propActiveTab="fields" renders My Fields tab');
}

// 4.3 Rendering with propActiveTab = 'payments'
{
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Test Farmer', fields: [] },
    activeTab: 'payments'
  }));
  assert(html.includes('No Completed Field Payouts') || html.includes('Payment History'), 'propActiveTab="payments" renders Payments tab');
}

// 4.4 Rendering with propActiveTab = 'alerts'
{
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Test Farmer', fields: [] },
    activeTab: 'alerts'
  }));
  assert(html.includes('Recent Notifications'), 'propActiveTab="alerts" renders Alerts tab');
}

// 4.5 propFields takes precedence over farmerUser.fields
{
  const userFields = [{ id: 'u-1', name: 'User Field', status: 'Completed', biomass_est: 10, rate: 2500 }];
  const overrideFields = [{ id: 'p-1', name: 'Override Field', status: 'Completed', biomass_est: 20, rate: 2500 }];
  
  const html = renderToString(React.createElement(FarmerDashboard, {
    farmerUser: { name: 'Test Farmer', fields: userFields },
    fields: overrideFields,
    activeTab: 'payments'
  }));
  
  assert(html.includes('Override Field') && !html.includes('User Field'), 'propFields takes precedence over farmerUser.fields');
  assert(html.includes('₹50,000') && !html.includes('₹25,000'), 'Payout calculation uses propFields');
}

// ============================================================================
// SUITE 5: STATIC CODE CONTRACT AUDIT (AUDITING REGRESSIONS)
// ============================================================================
console.log('\n--- SUITE 5: Static Code Contract Audit ---');

const dashPath = path.resolve('../src/components/FarmerDashboard.jsx');
const dashCode = fs.readFileSync(dashPath, 'utf8');

// 5.1 Zero window.alert calls
const alertCalls = dashCode.match(/(?<![a-zA-Z0-9_.])alert\s*\(/g);
assert(!alertCalls, 'No window.alert() calls exist in FarmerDashboard.jsx');

// 5.2 No hardcoded PAYMENT_HISTORY array
assert(!dashCode.includes('PAYMENT_HISTORY = ['), 'Static PAYMENT_HISTORY array is completely eliminated');

// 5.3 No hardcoded NOTIFICATIONS array
assert(!dashCode.includes('NOTIFICATIONS = ['), 'Static NOTIFICATIONS array is completely eliminated');

// 5.4 Dual status check in payments filter
assert(dashCode.includes("f.status === 'Completed' || f.status === 'Sold & Paid'"), 'Dual status filter (Completed / Sold & Paid) is present');

// 5.5 Dynamic Alerts calculation present
assert(dashCode.includes('dynamicAlerts = React.useMemo('), 'dynamicAlerts uses React.useMemo with dependency array');

// 5.6 Tab badge dynamically tied to dynamicAlerts.length
assert(dashCode.includes("badge: dynamicAlerts.length"), 'Alerts tab badge count tied to dynamicAlerts.length');


// ============================================================================
// FINAL SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log(`TOTAL EMPIRICAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================');

if (failedTests === 0) {
  console.log('\n🏆 ALL EMPIRICAL CHALLENGER TESTS PASSED SUCCESSFULLY! 🏆');
  process.exit(0);
} else {
  console.error(`\n🚨 EMPIRICAL CHALLENGER DETECTED ${failedTests} FAILURE(S)! 🚨`);
  process.exit(1);
}
