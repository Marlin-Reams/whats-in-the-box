import { collection, doc, query, where, onSnapshot, setDoc, updateDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getBlob, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { normalizeBox } from '../utils/inventory';
export function inventoryCollection(scope, type) {
  if (!scope) throw new Error('Please sign in again.');
  return scope.familyId ? collection(db, 'families', scope.familyId, type) : collection(db, type);
}
export function inventoryQuery(scope, type) {
  const target = inventoryCollection(scope, type);
  return scope.familyId ? target : query(target, where('userId', '==', scope.userId));
}
export function subscribeInventory(scope, type, next, error) {
  return onSnapshot(inventoryQuery(scope, type), snapshot => next(snapshot.docs.map(record =>
    type === 'boxes' ? normalizeBox(record.id, record.data()) : { ...record.data(), id: record.id }
  )), error);
}
export async function createInventory(scope, type, data) {
  const target = doc(inventoryCollection(scope, type));
  await setDoc(target, { ...data, userId: scope.userId, createdAt: new Date().toISOString() });
  return target.id;
}
export const updateInventory = (scope, type, id, data) => updateDoc(doc(inventoryCollection(scope, type), id), data);
export async function deleteBoxWithItems(scope, box) {
  const boxRef = doc(inventoryCollection(scope, 'boxes'), box.id);
  await updateDoc(boxRef, { deleting: true });
  try {
  const snapshot = await getDocs(inventoryQuery(scope, 'items'));
  const items = snapshot.docs.filter(record => [box.id, box.legacyId].filter(Boolean).includes(record.data().boxId));
  if (items.length > 450) throw new Error('Move items out of this box before deleting it (more than 450 items).');
  const batch = writeBatch(db);
  items.forEach(record => batch.update(record.ref, { boxId: null }));
  batch.delete(boxRef);
  await batch.commit();
  } catch (error) {
    try { await updateDoc(boxRef, { deleting: false }); } catch { /* Keep the original failure. */ }
    throw error;
  }
}
export async function uploadPhoto(scope, dataUrl) {
  const path = scope.familyId ? 'family_uploads/' + scope.familyId + '/' + crypto.randomUUID()
    : 'user_uploads/' + scope.userId + '/' + crypto.randomUUID();
  await uploadString(ref(storage, path), dataUrl, 'data_url');
  return path;
}
export const loadPhoto = path => getBlob(ref(storage, path));
export async function cleanPhoto(path) {
  if (!path) return null;
  try { await deleteObject(ref(storage, path)); }
  catch (error) { if (error.code !== 'storage/object-not-found') return 'The old photo could not be cleaned up.'; }
  return null;
}
export async function deleteInventoryItem(scope, item) {
  await deleteDoc(doc(inventoryCollection(scope, 'items'), item.id));
  const path = item.photoPath || (!scope.familyId && item.photo ? 'user_uploads/' + scope.userId + '/' + item.id + '.jpg' : null);
  return cleanPhoto(path);
}
