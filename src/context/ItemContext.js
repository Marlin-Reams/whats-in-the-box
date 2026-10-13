import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useInventoryScope } from './InventoryScope';
import { useBoxContext } from './BoxContext';
import { subscribeInventory, createInventory, updateInventory, uploadPhoto, deleteInventoryItem, cleanPhoto } from '../firebase/inventoryService';
import { resolveBoxId, validateItem } from '../utils/inventory';
const ItemContext = createContext();
export function ItemProvider({ children }) {
  const { scope } = useInventoryScope(), { boxes } = useBoxContext();
  const key = scope ? scope.userId + ':' + (scope.familyId || '') : '';
  const [state, setState] = useState({ key: '', items: [], loading: false, error: '' });
  useEffect(() => {
    let active = true;
    setState({ key, items: [], loading: !!scope, error: '' });
    if (!scope) return;
    const stop = subscribeInventory(scope, 'items', items => {
      if (active) setState({ key, items, loading: false, error: '' });
    }, () => { if (active) setState({ key, items: [], loading: false, error: 'Could not load items. Check your connection and try again.' }); });
    return () => { active = false; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const items = state.key === key ? state.items.map(item => ({ ...item, boxId: resolveBoxId(item.boxId, boxes) })) : [];
  async function prepare(item) {
    const data = validateItem(item);
    if (data.boxId && !boxes.some(box => box.id === data.boxId)) throw new Error('Choose an available box.');
    if (data.photo?.startsWith('data:image')) { data.photoPath = await uploadPhoto(scope, data.photo); data.photo = null; }
    return { name: data.name, quantity: data.quantity, description: data.description,
      boxId: data.boxId || null, photo: data.photo || null, photoPath: data.photoPath || null };
  }
  const addItem = async item => {
    const data = await prepare(item);
    try { return await createInventory(scope, 'items', data); }
    catch (error) { if (data.photoPath && data.photoPath !== item.photoPath) await cleanPhoto(data.photoPath); throw error; }
  };
  const updateItem = async (id, data) => {
    const current = items.find(item => item.id === id);
    if (!current) throw new Error('Item not found.');
    const prepared = await prepare({ ...current, ...data });
    try { await updateInventory(scope, 'items', id, prepared); }
    catch (error) { if (prepared.photoPath && prepared.photoPath !== current.photoPath) await cleanPhoto(prepared.photoPath); throw error; }
    if (current.photoPath && current.photoPath !== prepared.photoPath) {
      const warning = await cleanPhoto(current.photoPath); if (warning) toast.warning(warning);
    }
  };
  const deleteItem = async id => {
    const item = items.find(item => item.id === id);
    if (!item) throw new Error('Item not found.');
    const warning = await deleteInventoryItem(scope, item);
    if (warning) toast.warning(warning);
  };
  const moveItemToBox = (id, boxId) => updateItem(id, { boxId });
  return <ItemContext.Provider value={{ items, looseItems: items.filter(item => !item.boxId), addItem,
    updateItem, deleteItem, moveItemToBox, loading: state.key !== key || state.loading,
    error: state.key === key ? state.error : '' }}>{children}</ItemContext.Provider>;
}
export const useItemContext = () => useContext(ItemContext);
