import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoxProvider, useBoxContext } from './BoxContext';
import { useInventoryScope } from './InventoryScope';
import { subscribeInventory } from '../firebase/inventoryService';
jest.mock('./InventoryScope', () => ({ useInventoryScope: jest.fn() }));
jest.mock('../firebase/inventoryService', () => ({ subscribeInventory: jest.fn(), createInventory: jest.fn(), updateInventory: jest.fn(), deleteBoxWithItems: jest.fn() }));
function View() {
  const { boxes, error } = useBoxContext();
  return <><span>{boxes.map(b => b.title).join(',') || 'empty'}</span><span>{error}</span></>;
}
test('account switching clears old inventory and ignores delayed callbacks', () => {
  const listeners = [], stop = jest.fn();
  subscribeInventory.mockImplementation((scope, type, next) => { listeners.push(next); return stop; });
  useInventoryScope.mockReturnValue({ scope: { userId: 'alice', familyId: null } });
  const view = render(<BoxProvider><View /></BoxProvider>);
  act(() => listeners[0]([{ id: 'a', title: 'Alice private box' }]));
  expect(screen.getByText('Alice private box')).toBeInTheDocument();
  useInventoryScope.mockReturnValue({ scope: { userId: 'bob', familyId: null } });
  view.rerender(<BoxProvider><View /></BoxProvider>);
  expect(screen.getByText('empty')).toBeInTheDocument();
  expect(stop).toHaveBeenCalled();
  act(() => listeners[0]([{ id: 'a', title: 'Alice stale box' }]));
  expect(screen.queryByText('Alice stale box')).not.toBeInTheDocument();
  act(() => listeners[1]([{ id: 'b', title: 'Bob box' }]));
  expect(screen.getByText('Bob box')).toBeInTheDocument();
  useInventoryScope.mockReturnValue({ scope: null });
  view.rerender(<BoxProvider><View /></BoxProvider>);
  expect(screen.getByText('empty')).toBeInTheDocument();
});
test('a denied listener clears inventory instead of retaining cached family data', () => {
  let next, denied;
  subscribeInventory.mockImplementation((scope, type, success, failure) => { next = success; denied = failure; return jest.fn(); });
  useInventoryScope.mockReturnValue({ scope: { userId: 'alice', familyId: 'family' } });
  render(<BoxProvider><View /></BoxProvider>);
  act(() => next([{ id: 'shared', title: 'Shared box' }]));
  act(() => denied());
  expect(screen.queryByText('Shared box')).not.toBeInTheDocument();
  expect(screen.getByText(/Could not load boxes/)).toBeInTheDocument();
});
