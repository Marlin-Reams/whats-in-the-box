import { collection, doc, getDoc, getDocs, query, where, writeBatch, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, getBlob, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { normalizeBox, resolveBoxId, validateBox, validateItem } from '../utils/inventory';
const memberRef = (familyId, uid) => doc(db, 'families', familyId, 'members', uid);
const indexRef = (familyId, uid) => doc(db, 'users', uid, 'families', familyId);
const memberName = user => (user.displayName || user.email?.split('@')[0] || 'Family member').slice(0, 120);
export async function createFamily(user, name) {
  name = name.trim();
  if (!name || name.length > 80) throw new Error('Enter a family name of up to 80 characters.');
  const family = doc(collection(db, 'families')), batch = writeBatch(db);
  batch.set(family, { name, ownerUid: user.uid, createdAt: Timestamp.now() });
  batch.set(memberRef(family.id, user.uid), { role: 'owner', name: memberName(user), joinedAt: Timestamp.now() });
  batch.set(indexRef(family.id, user.uid), { name });
  await batch.commit();
  return family.id;
}
export async function createInvite(familyId, uid) {
  const code = crypto.randomUUID().replaceAll('-', '');
  await setDoc(doc(db, 'familyInvites', code), { familyId, createdBy: uid, expiresAt: Timestamp.fromMillis(Date.now() + 7 * 86400000) });
  return code;
}
export async function joinFamily(user, rawCode) {
  const code = rawCode.trim();
  if (!/^[a-f0-9]{32}$/.test(code)) throw new Error('Paste the full invitation code.');
  const invite = await getDoc(doc(db, 'familyInvites', code));
  if (!invite.exists() || invite.data().expiresAt.toMillis() <= Date.now()) throw new Error('This invitation is missing or expired. Ask for a new one.');
  const familyId = invite.data().familyId;
  const existing = await getDoc(memberRef(familyId, user.uid));
  if (existing.exists()) {
    if (existing.data().role === 'revoked') throw new Error('Your access was removed. Ask the family owner to restore it.');
    return familyId;
  }
  const batch = writeBatch(db);
  batch.set(memberRef(familyId, user.uid), { role: 'member', name: memberName(user), inviteCode: code, joinedAt: Timestamp.now() });
  // Membership is checked with getAfter by the index rule; family name can be fetched after joining.
  batch.set(indexRef(familyId, user.uid), { name: 'Family inventory' });
  await batch.commit();
  const family = await getDoc(doc(db, 'families', familyId));
  await setDoc(indexRef(familyId, user.uid), { name: family.data().name });
  return familyId;
}
export async function removeMember(familyId, uid) {
  const batch = writeBatch(db);
  batch.update(memberRef(familyId, uid), { role: 'revoked' }); batch.delete(indexRef(familyId, uid));
  await batch.commit();
}
export async function leaveFamily(familyId, uid) {
  const batch = writeBatch(db);
  batch.delete(memberRef(familyId, uid)); batch.delete(indexRef(familyId, uid));
  await batch.commit();
}
export async function restoreMember(familyId, uid, name) {
  const batch = writeBatch(db);
  batch.update(memberRef(familyId, uid), { role: 'member' }); batch.set(indexRef(familyId, uid), { name });
  await batch.commit();
}
export const revokeInvite = code => deleteDoc(doc(db, 'familyInvites', code));
export async function copyPersonalInventory(user, familyId) {
  const [boxSnapshot, itemSnapshot, targetBoxes, targetItems] = await Promise.all([
    getDocs(query(collection(db, 'boxes'), where('userId', '==', user.uid))),
    getDocs(query(collection(db, 'items'), where('userId', '==', user.uid))),
    getDocs(collection(db, 'families', familyId, 'boxes')), getDocs(collection(db, 'families', familyId, 'items'))
  ]);
  const boxes = boxSnapshot.docs.map(record => normalizeBox(record.id, record.data()));
  const existingBoxes = new Set(targetBoxes.docs.map(record => record.id)), existingItems = new Set(targetItems.docs.map(record => record.id));
  let copied = 0;
  for (const box of boxes) {
    if (existingBoxes.has(box.id)) continue;
    await setDoc(doc(db, 'families', familyId, 'boxes', box.id), {
      ...validateBox(box), userId: user.uid, legacyId: box.legacyId || null, createdAt: box.createdAt || new Date().toISOString()
    });
    copied++;
  }
  for (const record of itemSnapshot.docs) {
    if (existingItems.has(record.id)) continue;
    const item = validateItem(record.data());
    const boxId = resolveBoxId(item.boxId, boxes);
    let photoPath = null;
    if (item.photo || item.photoPath) {
      // Copy authenticated bytes; never carry personal download-token URLs into a shared family.
      const sourcePath = item.photoPath || 'user_uploads/' + user.uid + '/' + record.id + '.jpg';
      const blob = await getBlob(ref(storage, sourcePath));
      photoPath = 'family_uploads/' + familyId + '/' + crypto.randomUUID();
      await uploadBytes(ref(storage, photoPath), blob, { contentType: blob.type || 'image/jpeg' });
    }
    await setDoc(doc(db, 'families', familyId, 'items', record.id), {
      name: item.name, quantity: item.quantity, description: item.description,
      boxId: boxes.some(box => box.id === boxId) ? boxId : null,
      photo: null, photoPath, userId: user.uid, createdAt: item.createdAt || new Date().toISOString()
    });
    copied++;
  }
  return copied;
}
