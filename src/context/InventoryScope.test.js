import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(), onAuthStateChanged: jest.fn() }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), onSnapshot: jest.fn() }));
jest.mock('../firebase/firebaseConfig', () => ({ db: {} }));
process.env.REACT_APP_ENABLE_FAMILIES = 'true';
const { InventoryScopeProvider, useInventoryScope } = require('./InventoryScope');
function View() {
  const scope = useInventoryScope();
  return <><span data-testid="scope">{scope.ready ? (scope.familyId || 'personal') : 'loading'}</span>
    <button onClick={() => scope.saveDefaultInventory('family')}>Save family</button>
    <button onClick={() => scope.setFamilyId(null)}>Switch personal</button></>;
}
let auth, snapshot;
beforeEach(() => {
  localStorage.clear();
  onAuthStateChanged.mockImplementation((_, next) => { auth = next; return jest.fn(); });
  onSnapshot.mockImplementation((_, next) => { snapshot = next; return jest.fn(); });
});
const membership = ids => ({ docs: ids.map(id => ({ id, data: () => ({ name: id }) })) });
test('restores a saved family after access loads, without showing personal first', () => {
  localStorage.setItem('inventory-default:alice', 'family');
  render(<InventoryScopeProvider><View /></InventoryScopeProvider>);
  act(() => auth({ uid: 'alice' }));
  expect(screen.getByTestId('scope')).toHaveTextContent('loading');
  act(() => snapshot(membership(['family'])));
  expect(screen.getByTestId('scope')).toHaveTextContent('family');
  fireEvent.click(screen.getByText('Switch personal'));
  expect(localStorage.getItem('inventory-default:alice')).toBe('family');
  act(() => snapshot(membership(['family'])));
  expect(screen.getByTestId('scope')).toHaveTextContent('personal');
});
test('defaults are account-specific and inaccessible families fall back to personal', () => {
  render(<InventoryScopeProvider><View /></InventoryScopeProvider>);
  act(() => auth({ uid: 'alice' }));
  act(() => snapshot(membership(['family'])));
  fireEvent.click(screen.getByText('Save family'));
  expect(localStorage.getItem('inventory-default:alice')).toBe('family');
  act(() => snapshot(membership([])));
  expect(screen.getByTestId('scope')).toHaveTextContent('personal');
  act(() => auth({ uid: 'bob' }));
  act(() => snapshot(membership(['family'])));
  expect(screen.getByTestId('scope')).toHaveTextContent('personal');
});
