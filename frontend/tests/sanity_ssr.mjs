import React from 'react';
import { renderToString } from 'react-dom/server';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
import FarmerDashboard from '../src/components/FarmerDashboard.jsx';

const field = { id: '1', name: 'Farm Alpha', status: 'Completed', biomass_est: 10, rate: 2500 };
const html = renderToString(React.createElement(FarmerDashboard, {
  farmerUser: { name: 'Test', fields: [field] },
  activeTab: 'payments'
}));

console.log('PAYMENTS HTML:\n', html);

const alertsHtml = renderToString(React.createElement(FarmerDashboard, {
  farmerUser: { name: 'Test', fields: [{ id: 'p', name: 'Farm P', status: 'Pending' }] },
  activeTab: 'alerts'
}));

console.log('\nALERTS HTML:\n', alertsHtml);
