import { db, storage } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import {
  collection,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

// ✅ Rename conflicting import
import {
  ref as storageRef,
  uploadString,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import imageCompression from 'browser-image-compression';

const itemsCollection = collection(db, 'items');

// 📦 Upload a compressed base64 image to Firebase Storage and get the download URL
export const uploadImageAndGetURL = async (base64String, itemId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Convert base64 to Blob and File
    const response = await fetch(base64String);
    const blob = await response.blob();
    const file = new File([blob], `${itemId}.jpg`, { type: 'image/jpeg' });

    // Compress the image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.03,
      maxWidthOrHeight: 400,
      useWebWorker: true,
      initialQuality: 0.4
    });

    // Convert back to base64 after compression
    const compressedBase64 = await imageCompression.getDataUrlFromFile(compressedFile);

    // 🔥 Upload to the user-specific folder
    const imageRef = storageRef(storage, `user_uploads/${user.uid}/${itemId}.jpg`);
    await uploadString(imageRef, compressedBase64, 'data_url');

    // ✅ Get the public URL
    const url = await getDownloadURL(imageRef);
    console.log(`📸 Uploaded compressed image for item ${itemId}, URL: ${url}`);
    return url;
  } catch (err) {
    console.error(`❌ Failed to compress/upload image for item ${itemId}:`, err);
    return '';
  }
};

// ➕ Add a new item to Firestore
export const addItemToFirestore = async (item) => {
  const itemDoc = doc(db, 'items', item.id); // ← uses your `item.id`
  await setDoc(itemDoc, item);
  return item.id;
};

// 📥 Fetch all items from Firestore
export const fetchItemsFromFirestore = async () => {
  const snapshot = await getDocs(itemsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✏️ Update item by ID
export const updateItemInFirestore = async (id, updatedData) => {
  const itemDoc = doc(db, 'items', id);
  await updateDoc(itemDoc, updatedData);
};

// 🗑️ Delete item by ID
export const deleteItemFromFirestore = async (id) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('❌ Cannot delete item: user not authenticated');
    return;
  }

  try {
    // 1. Delete from Firestore
    const itemDoc = doc(db, 'items', id);
    await deleteDoc(itemDoc);
    console.log(`🗑️ Deleted Firestore document for item ${id}`);

    // 2. Delete image from Storage
    const imageRef = storageRef(storage, `user_uploads/${user.uid}/${id}.jpg`);
    await deleteObject(imageRef);
    console.log(`🧹 Deleted image from storage for item ${id}`);
  } catch (err) {
    console.error(`❌ Failed to delete item ${id}:`, err);
  }
};
