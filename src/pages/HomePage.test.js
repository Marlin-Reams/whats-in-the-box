import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import TopBar from '../components/TopBar';
jest.mock('../components/BugReportModal', () => () => null);
jest.mock('../context/InventoryScope', () => ({ familiesEnabled: true, useInventoryScope: () => ({ user: { uid: 'preview' }, familyId: 'reams', families: [{ id: 'reams', name: 'Reams family' }], setFamilyId: jest.fn() }) }));
jest.mock('../context/BoxContext', () => ({ useBoxContext: () => ({ loading: false, error: '', boxes: [
  { id: 'kitchen', title: 'Kitchen essentials', location: 'Garage · shelf 2' },
  { id: 'winter', title: 'Winter clothes', location: 'Hall closet · top shelf' },
  { id: 'memories', title: 'Family memories', location: 'Bedroom · under the bed' }
] }) }));
jest.mock('../context/ItemContext', () => ({ useItemContext: () => ({ loading: false, error: '', looseItems: [{ id: 'charger', name: 'Laptop charger', quantity: 1 }], items: [
  { id: 'cups', name: 'Measuring cups', description: 'Blue kitchen set', quantity: 3, boxId: 'kitchen' },
  { id: 'coat', name: 'Winter coat', quantity: 2, boxId: 'winter' },
  { id: 'charger', name: 'Laptop charger', quantity: 1, boxId: null }
] }) }));
test('global search finds a boxed item and tells the family where it is', () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cups' } });
  expect(screen.getByRole('link', { name: /Measuring cups.*Garage/ })).toHaveAttribute('href', '/view/kitchen');
});
test('global search includes loose items', () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'charger' } });
  expect(screen.getByRole('link', { name: /Laptop charger.*Loose item/ })).toHaveAttribute('href', '/loose-items');
});
test('dashboard presents shared inventory and exports a sample-data design preview', () => {
  const { container } = render(<MemoryRouter><TopBar /><HomePage /></MemoryRouter>);
  expect(screen.getByText('Reams family · shared inventory')).toBeInTheDocument();
  const css = fs.readFileSync(path.join(process.cwd(), 'src/styles/polish.css'), 'utf8');
  fs.mkdirSync(path.join(process.cwd(), 'work'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'work/design-preview.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inventory design preview</title><style>' + css + '</style></head><body><p style="padding:0 1rem;color:#536b61">Design preview · sample family inventory</p>' + container.innerHTML + '</body></html>');
});
