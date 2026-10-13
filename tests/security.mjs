import fs from 'node:fs';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, collection, getDoc, getDocs, query, where, setDoc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';

const env = await initializeTestEnvironment({
  projectId: 'demo-whats-in-the-box',
  firestore: { host: '127.0.0.1', port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':').pop() || 8080), rules: fs.readFileSync('firestore.rules', 'utf8') },
  storage: { host: '127.0.0.1', port: Number(process.env.FIREBASE_STORAGE_EMULATOR_HOST?.split(':').pop() || 9199), rules: fs.readFileSync('storage.rules', 'utf8') }
});
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
const alice = env.authenticatedContext('alice'), bob = env.authenticatedContext('bob'), outsider = env.authenticatedContext('outsider');
const a = alice.firestore(), b = bob.firestore(), o = outsider.firestore(), anonymous = env.unauthenticatedContext().firestore();
const box = { title: 'Kitchen', notes: '', location: 'Garage', userId: 'alice', createdAt: '2026-10-13' };
const item = { name: 'Cups', quantity: 2, description: '', boxId: null, photo: null, photoPath: null, userId: 'alice', createdAt: '2026-10-13' };
const code = '0123456789abcdef0123456789abcdef';
try {
  await env.clearFirestore();
  await test('anonymous inventory writes denied', () => assertFails(setDoc(doc(anonymous, 'boxes', 'anonymous'), box)));
  await test('personal owner creates box', () => assertSucceeds(setDoc(doc(a, 'boxes', 'personal'), box)));
  await test('another account cannot read personal box', () => assertFails(getDoc(doc(b, 'boxes', 'personal'))));
  await test('owner-filtered inventory query allowed', () => assertSucceeds(getDocs(query(collection(a, 'boxes'), where('userId', '==', 'alice')))));
  await test('unrestricted personal query denied', () => assertFails(getDocs(collection(a, 'boxes'))));
  await test('ownership forgery denied', () => assertFails(setDoc(doc(b, 'boxes', 'forged'), box)));
  await test('ownership mutation denied', () => assertFails(updateDoc(doc(a, 'boxes', 'personal'), { userId: 'bob' })));
  await test('invalid item quantity denied', () => assertFails(setDoc(doc(a, 'items', 'invalid'), { ...item, quantity: -1 })));
  await test('nonexistent item destination denied', () => assertFails(setDoc(doc(a, 'items', 'missing'), { ...item, boxId: 'missing' })));
  await test('foreign personal box destination denied', () => assertFails(setDoc(doc(b, 'items', 'foreign'), { ...item, userId: 'bob', boxId: 'personal' })));
  await test('valid owner item destination allowed', () => assertSucceeds(setDoc(doc(a, 'items', 'cups'), { ...item, boxId: 'personal' })));
  await test('family and owner membership created atomically', async () => {
    const batch = writeBatch(a);
    batch.set(doc(a, 'families', 'family-a'), { name: 'Reams', ownerUid: 'alice', createdAt: Timestamp.now() });
    batch.set(doc(a, 'families', 'family-a', 'members', 'alice'), { role: 'owner', name: 'Alice', joinedAt: Timestamp.now() });
    batch.set(doc(a, 'users', 'alice', 'families', 'family-a'), { name: 'Reams' });
    await assertSucceeds(batch.commit());
  });
  await test('cannot self-add to someone else’s family', () => assertFails(setDoc(doc(o, 'families', 'family-a', 'members', 'outsider'), { role: 'owner', name: 'Imposter', joinedAt: Timestamp.now() })));
  await test('owner creates expiring invitation', () => assertSucceeds(setDoc(doc(a, 'familyInvites', code), { familyId: 'family-a', createdBy: 'alice', expiresAt: Timestamp.fromMillis(Date.now() + 86400000) })));
  await test('join via invitation with private family index', async () => {
    const batch = writeBatch(b);
    batch.set(doc(b, 'families', 'family-a', 'members', 'bob'), { role: 'member', name: 'Bob', inviteCode: code, joinedAt: Timestamp.now() });
    batch.set(doc(b, 'users', 'bob', 'families', 'family-a'), { name: 'Reams' });
    await assertSucceeds(batch.commit());
  });
  await test('non-owner cannot issue invitations', () => assertFails(setDoc(doc(b, 'familyInvites', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'), { familyId: 'family-a', createdBy: 'bob', expiresAt: Timestamp.fromMillis(Date.now() + 86400000) })));
  await test('owner-filtered invite list allowed', () => assertSucceeds(getDocs(query(collection(a, 'familyInvites'), where('familyId', '==', 'family-a')))));
  await test('outsider cannot list invitation codes', () => assertFails(getDocs(collection(o, 'familyInvites'))));
  await test('family member creates shared box', () => assertSucceeds(setDoc(doc(a, 'families', 'family-a', 'boxes', 'shared'), box)));
  await test('another family member can edit shared box', () => assertSucceeds(updateDoc(doc(b, 'families', 'family-a', 'boxes', 'shared'), { location: 'New home' })));
  await test('family member may read shared inventory query', () => assertSucceeds(getDocs(collection(b, 'families', 'family-a', 'boxes'))));
  await test('outsider cannot read shared inventory', () => assertFails(getDocs(collection(o, 'families', 'family-a', 'boxes'))));
  await test('shared item create allowed', () => assertSucceeds(setDoc(doc(a, 'families', 'family-a', 'items', 'cups'), { ...item, boxId: 'shared' })));
  await test('family item cannot point at a different family', () => assertFails(setDoc(doc(a, 'families', 'family-a', 'items', 'bad-box'), { ...item, boxId: 'foreign-family-box' })));
  await test('member cannot promote themselves', () => assertFails(updateDoc(doc(b, 'families', 'family-a', 'members', 'bob'), { role: 'owner' })));
  await test('family cannot store a personal photo URL', () => assertFails(updateDoc(doc(a, 'families', 'family-a', 'items', 'cups'), { photo: 'https://example.com/photo.jpg' })));
  await test('new destinations blocked while deleting box', async () => {
    await assertSucceeds(updateDoc(doc(a, 'families', 'family-a', 'boxes', 'shared'), { deleting: true }));
    await assertFails(setDoc(doc(a, 'families', 'family-a', 'items', 'late'), { ...item, boxId: 'shared' }));
  });
  await test('deleting box and releasing items succeeds atomically', async () => {
    const batch = writeBatch(a);
    batch.update(doc(a, 'families', 'family-a', 'items', 'cups'), { boxId: null });
    batch.delete(doc(a, 'families', 'family-a', 'boxes', 'shared'));
    await assertSucceeds(batch.commit());
    assert.equal((await getDoc(doc(a, 'families', 'family-a', 'items', 'cups'))).data().boxId, null);
  });
  await test('family image upload allowed', () => assertSucceeds(uploadBytes(ref(alice.storage(), 'family_uploads/family-a/photo'), new Uint8Array([1,2,3]), { contentType: 'image/png' })));
  await test('another family member can read image bytes', () => assertSucceeds(getBytes(ref(bob.storage(), 'family_uploads/family-a/photo'))));
  await test('outsider cannot read family photo', () => assertFails(getBytes(ref(outsider.storage(), 'family_uploads/family-a/photo'))));
  await test('non-image upload denied', () => assertFails(uploadBytes(ref(alice.storage(), 'family_uploads/family-a/text'), new Uint8Array([1]), { contentType: 'text/plain' })));
  await test('owner revokes member and removes their family index', async () => {
    const batch = writeBatch(a);
    batch.update(doc(a, 'families', 'family-a', 'members', 'bob'), { role: 'revoked' });
    batch.delete(doc(a, 'users', 'bob', 'families', 'family-a'));
    await assertSucceeds(batch.commit());
  });
  await test('revoked member cannot read family data', () => assertFails(getDocs(collection(b, 'families', 'family-a', 'items'))));
  await test('revoked member cannot read family photos', () => assertFails(getBytes(ref(bob.storage(), 'family_uploads/family-a/photo'))));
  await test('revoked member cannot restore access using old invite', () => assertFails(setDoc(doc(b, 'families', 'family-a', 'members', 'bob'), { role: 'member', name: 'Bob', inviteCode: code, joinedAt: Timestamp.now() })));
  await test('owner restores member and index atomically', async () => {
    const batch = writeBatch(a);
    batch.update(doc(a, 'families', 'family-a', 'members', 'bob'), { role: 'member' });
    batch.set(doc(a, 'users', 'bob', 'families', 'family-a'), { name: 'Reams' });
    await assertSucceeds(batch.commit());
  });
  await test('restored member can read family data', () => assertSucceeds(getDocs(collection(b, 'families', 'family-a', 'items'))));
  await test('forged request reporter denied', () => assertFails(setDoc(doc(b, 'requests', 'forged'), { userId: 'alice', type: 'bug', status: 'submitted', description: 'Help', submittedAt: 'now' })));
  await test('valid support request allowed', () => assertSucceeds(setDoc(doc(b, 'requests', 'valid'), { userId: 'bob', type: 'support', status: 'submitted', description: 'Help', submittedAt: 'now' })));
  await test('ordinary user cannot read support inbox', () => assertFails(getDoc(doc(b, 'requests', 'valid'))));
  await test('expired invitation denied', async () => {
    await env.withSecurityRulesDisabled(async context => setDoc(doc(context.firestore(), 'familyInvites', 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'), { familyId: 'family-a', createdBy: 'alice', expiresAt: Timestamp.fromMillis(1) }));
    await assertFails(setDoc(doc(o, 'families', 'family-a', 'members', 'outsider'), { role: 'member', name: 'Outsider', inviteCode: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', joinedAt: Timestamp.now() }));
  });
  console.log('Security checks passed: ' + passed);
} finally { await env.cleanup(); }


