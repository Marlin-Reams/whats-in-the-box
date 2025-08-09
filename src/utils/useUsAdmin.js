import { getAuth } from 'firebase/auth';

const allowedUIDs = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2
];

export const useIsAdmin = () => {
  const user = getAuth().currentUser;
  return user && allowedUIDs.includes(user.uid);
};
