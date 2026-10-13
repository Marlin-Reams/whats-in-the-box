import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
const Context = createContext();
export const familiesEnabled = process.env.REACT_APP_ENABLE_FAMILIES === 'true';
export function InventoryScopeProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  const [families, setFamilies] = useState([]), [familyId, setFamilyId] = useState(null), [error, setError] = useState('');
  const [defaultFamilyId, setDefaultFamilyId] = useState(null);
  useEffect(() => {
    let stopFamilies = () => {};
    const stopAuth = onAuthStateChanged(getAuth(), next => {
      stopFamilies(); setUser(next); setReady(!next || !familiesEnabled); setFamilies([]); setFamilyId(null); setError('');
      let saved = null;
      try { saved = next ? localStorage.getItem('inventory-default:' + next.uid) : null; } catch (_) {}
      setDefaultFamilyId(saved);
      let initial = true;
      if (next && familiesEnabled) stopFamilies = onSnapshot(collection(db, 'users', next.uid, 'families'), snapshot => {
        const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setFamilies(list);
        const restoreDefault = initial;
        setFamilyId(current => {
          const selected = restoreDefault ? saved : current;
          return selected && list.some(f => f.id === selected) ? selected : null;
        });
        initial = false; setReady(true);
        setDefaultFamilyId(current => current && list.some(f => f.id === current) ? current : null);
      }, () => { setFamilies([]); setFamilyId(null); setReady(true); setError('Family access could not be loaded. Your personal inventory is still available.'); });
    });
    return () => { stopAuth(); stopFamilies(); };
  }, []);
  const scope = user ? { userId: user.uid, familyId } : null;
  function saveDefaultInventory(id) {
    const selected = id || null;
    if (!user || (selected && !families.some(f => f.id === selected))) return false;
    try {
      localStorage.setItem('inventory-default:' + user.uid, selected || '');
      setDefaultFamilyId(selected); setFamilyId(selected); return true;
    } catch (_) { return false; }
  }
  return <Context.Provider value={{ user, ready, families, familyId, setFamilyId, defaultFamilyId, saveDefaultInventory, scope, error }}>{children}</Context.Provider>;
}
export const useInventoryScope = () => useContext(Context);
