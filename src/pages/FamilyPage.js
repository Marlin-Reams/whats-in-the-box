import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useInventoryScope } from '../context/InventoryScope';
import { createFamily, joinFamily, createInvite, revokeInvite, removeMember, restoreMember, leaveFamily, copyPersonalInventory } from '../firebase/familyService';
export default function FamilyPage() {
  const { user, families, familyId, setFamilyId, defaultFamilyId, saveDefaultInventory, error: scopeError } = useInventoryScope();
  const [name, setName] = useState(''), [code, setCode] = useState(''), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const [family, setFamily] = useState(null), [members, setMembers] = useState([]), [invites, setInvites] = useState([]);
  useEffect(() => {
    setFamily(null); setMembers([]); setInvites([]);
    if (!familyId) return;
    const fail = () => setError('Family settings could not be loaded. Check your access and connection.');
    const stopFamily = onSnapshot(doc(db, 'families', familyId), record => setFamily(record.exists() ? record.data() : null), fail);
    const stopMembers = onSnapshot(collection(db, 'families', familyId, 'members'), snapshot => setMembers(snapshot.docs.map(d => ({ ...d.data(), id: d.id }))), fail);
    return () => { stopFamily(); stopMembers(); };
  }, [familyId]);
  const owner = family?.ownerUid === user.uid;
  useEffect(() => {
    setInvites([]);
    if (!owner || !familyId) return;
    return onSnapshot(query(collection(db, 'familyInvites'), where('familyId', '==', familyId)), snapshot =>
      setInvites(snapshot.docs.map(d => ({ ...d.data(), id: d.id }))), () => setError('Could not load invitations.'));
  }, [familyId, owner]);
  async function act(task) {
    if (busy) return; setBusy(true); setError(''); setMessage('');
    try { await task(); } catch (failure) { setError(failure.message || 'This change could not be saved.'); }
    finally { setBusy(false); }
  }
  return <main className="page-container family-page"><Link to="/" className="back-button">Back to inventory</Link><h1>Your family</h1>
    <p>Separate logins. One shared place to find everything.</p>
    {(error || scopeError) && <p role="alert" className="error-text">{error || scopeError}</p>}{message && <p role="status">{message}</p>}
    <label>Viewing inventory<select value={familyId || ''} disabled={busy} onChange={e => setFamilyId(e.target.value || null)}>
      <option value="">Personal inventory</option>{families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
    <section><h2>Default inventory</h2><p>Choose the inventory to open when you sign in or refresh. Saved for your account in this browser. Switching inventories above does not change your default.</p>
      <label>Open by default<select value={defaultFamilyId || ''} disabled={busy} onChange={e => {
        if (saveDefaultInventory(e.target.value)) { setError(''); setMessage('Default inventory saved. You are now viewing it.'); }
        else setError('Your browser could not save the default. Allow site storage and try again.');
      }}><option value="">Personal inventory</option>{families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
    </section>
    <div className="family-forms"><form onSubmit={e => { e.preventDefault(); act(async () => {
      const id = await createFamily(user, name); setFamilyId(id); setName(''); setMessage('Family created. Invite someone below.');
    }); }}><h2>Create a family</h2><label>Family name<input value={name} onChange={e => setName(e.target.value)} required maxLength={80} /></label><button disabled={busy}>Create family</button></form>
    <form onSubmit={e => { e.preventDefault(); act(async () => {
      const id = await joinFamily(user, code); setFamilyId(id); setCode(''); setMessage('You joined the family.');
    }); }}><h2>Join a family</h2><label>Invitation code<input value={code} onChange={e => setCode(e.target.value)} required autoComplete="off" /></label><button disabled={busy}>Join family</button></form></div>
    {family && <section><h2>{family.name}</h2><ul>{members.map(member => <li key={member.id}>
      {member.name} · {member.role}
      {owner && member.role === 'revoked' && <button disabled={busy} onClick={() => act(() => restoreMember(familyId, member.id, family.name))}>Restore member</button>}
      {owner && member.id !== user.uid && member.role !== 'revoked' && <button disabled={busy} onClick={() => {
        if (window.confirm('Remove this member? They will lose family inventory access.')) act(() => removeMember(familyId, member.id));
      }}>Remove member</button>}
    </li>)}</ul>
    {!owner && <button disabled={busy} onClick={() => {
      if (window.confirm('Leave this family? You will lose access to its inventory.')) act(async () => { await leaveFamily(familyId, user.uid); setFamilyId(null); });
    }}>Leave family</button>}
    {owner && <><h3>Invitations</h3><p>Share a code privately with your family. Codes expire after seven days. Revoking a code stops new joins; remove a member separately to end their access.</p>
      <button disabled={busy} onClick={() => act(async () => { await createInvite(familyId, user.uid); setMessage('Invitation created. Copy a code below.'); })}>Create invitation</button>
      <ul>{invites.map(invite => <li key={invite.id}><code>{invite.id}</code><span> · Expires {invite.expiresAt.toDate().toLocaleDateString()}</span>
        <button disabled={busy} onClick={() => act(() => revokeInvite(invite.id))}>Revoke invitation</button></li>)}</ul></>}
    <h3>Bring your personal inventory</h3><p>Copy your boxes, items and photos into this family. Your personal originals stay intact. Copies keep their IDs and can be retried without duplicating completed items.</p>
    <button disabled={busy} onClick={() => {
      if (window.confirm('Copy your personal inventory into this family? All family members will be able to see and edit it.')) act(async () => {
        const count = await copyPersonalInventory(user, familyId); setMessage(count + ' records copied. Switch to the family inventory to view them.');
      });
    }}>{busy ? 'Working…' : 'Copy personal inventory'}</button>
    </section>}
  </main>;
}
