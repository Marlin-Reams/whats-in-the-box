import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
const Context = createContext();
export const familiesEnabled = process.env.REACT_APP_ENABLE_FAMILIES === 'true';
export function InventoryScopeProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  const [families, setFamilies] = useState([]), [familyId, setFamilyId] = useState(null), [error, setError] = useState('');
  useEffect(() => {
    let stopFamilies = () => {};
    const stopAuth = onAuthStateChanged(getAuth(), next => {
      stopFamilies(); setUser(next); setReady(true); setFamilies([]); setFamilyId(null); setError('');
      if (next && familiesEnabled) stopFamilies = onSnapshot(collection(db, 'users', next.uid, 'families'), snapshot => {
        const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setFamilies(list);
        setFamilyId(current => current && list.some(f => f.id === current) ? current : null);
      }, () => { setFamilies([]); setFamilyId(null); setError('Family access could not be loaded. Your personal inventory is still available.'); });
    });
    return () => { stopAuth(); stopFamilies(); };
  }, []);
  const scope = user ? { userId: user.uid, familyId } : null;
  return <Context.Provider value={{ user, ready, families, familyId, setFamilyId, scope, error }}>{children}</Context.Provider>;
}
export const useInventoryScope = () => useContext(Context);
