// src/firebase/firestoreHelpers.js
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Reference to the boxes collection
const boxesCollection = collection(db, 'boxes');

// Add a box to Firestore with userId
export const addBoxToFirestore = async (box) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = await addDoc(boxesCollection, {
    ...box,
    userId: user.uid,
  });
  return docRef.id;
};

// Fetch only the boxes that belong to the current user
export const fetchBoxesFromFirestore = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(boxesCollection, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update a box in Firestore
export const updateBoxInFirestore = async (id, updatedData) => {
  const boxDoc = doc(db, 'boxes', id);
  await updateDoc(boxDoc, updatedData);
};

// Delete a box from Firestore
export const deleteBoxFromFirestore = async (id) => {
  const boxDoc = doc(db, 'boxes', id);
  await deleteDoc(boxDoc);
};
