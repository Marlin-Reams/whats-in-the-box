// hooks/useIsAdmin.js
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const allowedUIDs = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2,
].filter(Boolean); // ignore empty envs just in case

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // important on mobile

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user && allowedUIDs.includes(user.uid));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { isAdmin, loading };
};

