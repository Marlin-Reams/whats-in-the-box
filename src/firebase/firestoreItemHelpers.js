// src/firebase/firestoreItemHelpers.js
import { db, storage } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import {
  collection,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

import {
  ref as storageRef,
  uploadString,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import imageCompression from 'browser-image-compression';

const itemsCollection = collection(db, 'items');

// 📸 Upload a compressed base64 image to Firebase Storage
export const uploadImageAndGetURL = async (base64String, itemId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(base64String);
    const blob = await response.blob();
    const file = new File([blob], `${itemId}.jpg`, { type: 'image/jpeg' });

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.03,
      maxWidthOrHeight: 400,
      useWebWorker: true,
      initialQuality: 0.4
    });

    const compressedBase64 = await imageCompression.getDataUrlFromFile(compressedFile);

    const imageRef = storageRef(storage, `user_uploads/${user.uid}/${itemId}.jpg`);
    await uploadString(imageRef, compressedBase64, 'data_url');

    const url = await getDownloadURL(imageRef);
    console.log(`📸 Uploaded compressed image for item ${itemId}, URL: ${url}`);
    return url;
  } catch (err) {
    console.error(`❌ Failed to compress/upload image for item ${itemId}:`, err);
    return '';
  }
};

// ➕ Add a new item with userId
export const addItemToFirestore = async (item) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const itemDoc = doc(db, 'items', item.id);
  await setDoc(itemDoc, {
    ...item,
    userId: user.uid
  });
  return item.id;
};

// 📥 Fetch only the current user's items
export const fetchItemsFromFirestore = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const q = query(itemsCollection, where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✏️ Update item by ID
export const updateItemInFirestore = async (id, updatedData) => {
  const itemDoc = doc(db, 'items', id);
  await updateDoc(itemDoc, updatedData);
};

// 🗑️ Delete item and its image
export const deleteItemFromFirestore = async (id) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ Cannot delete item: user not authenticated');
    return;
  }

  try {
    const itemDoc = doc(db, 'items', id);
    await deleteDoc(itemDoc);
    console.log(`🗑️ Deleted Firestore document for item ${id}`);

    const imageRef = storageRef(storage, `user_uploads/${user.uid}/${id}.jpg`);
    await deleteObject(imageRef);
    console.log(`🧹 Deleted image from storage for item ${id}`);
  } catch (err) {
    console.error(`❌ Failed to delete item ${id}:`, err);
  }
};

