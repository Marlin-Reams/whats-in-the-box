import React, { createContext, useContext, useEffect, useState } from 'react';
import { useInventoryScope } from './InventoryScope';
import { subscribeInventory, createInventory, updateInventory, deleteBoxWithItems } from '../firebase/inventoryService';
import { validateBox } from '../utils/inventory';
const BoxContext = createContext();
export function BoxProvider({ children }) {
  const { scope } = useInventoryScope();
  const key = scope ? scope.userId + ':' + (scope.familyId || '') : '';
  const [state, setState] = useState({ key: '', boxes: [], loading: false, error: '' });
  useEffect(() => {
    let active = true;
    setState({ key, boxes: [], loading: !!scope, error: '' });
    if (!scope) return;
    const stop = subscribeInventory(scope, 'boxes', boxes => {
      if (active) setState({ key, boxes, loading: false, error: '' });
    }, () => { if (active) setState({ key, boxes: [], loading: false, error: 'Could not load boxes. Check your connection and try again.' }); });
    return () => { active = false; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const boxes = state.key === key ? state.boxes : [];
  const getBoxById = id => boxes.find(box => box.id === id || box.legacyId === id);
  const addBox = box => createInventory(scope, 'boxes', validateBox(box));
  const updateBox = (id, data) => updateInventory(scope, 'boxes', id, validateBox(data));
  const deleteBox = id => {
    const box = getBoxById(id);
    if (!box) throw new Error('Box not found.');
    return deleteBoxWithItems(scope, box);
  };
  return <BoxContext.Provider value={{ boxes, getBoxById, addBox, updateBox, deleteBox,
    loading: state.key !== key || state.loading, error: state.key === key ? state.error : '' }}>{children}</BoxContext.Provider>;
}
export const useBoxContext = () => useContext(BoxContext);
