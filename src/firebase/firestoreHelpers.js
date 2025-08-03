// src/firebase/firestoreHelpers.js
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

// Reference to the boxes collection
const boxesCollection = collection(db, 'boxes');

// Add a box to Firestore
export const addBoxToFirestore = async (box) => {
  const docRef = await addDoc(boxesCollection, box);
  return docRef.id;
};

// Fetch all boxes from Firestore
export const fetchBoxesFromFirestore = async () => {
  const snapshot = await getDocs(boxesCollection);
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
