import React, { useEffect, useRef, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
export default function BugReportModal({ onClose }) {
  const [type, setType] = useState('bug'), [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [sent, setSent] = useState(false);
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  return <dialog ref={dialog} className="help-dialog" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} aria-labelledby="help-title">
    <h2 id="help-title">How can we help?</h2>
    {sent ? <p role="status">Your request was submitted. Thank you.</p> : <form onSubmit={async e => {
      e.preventDefault(); if (busy || !description.trim()) return; setBusy(true); setError('');
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error('Please sign in again.');
        await addDoc(collection(db, 'requests'), { type, description: description.trim(), userId: user.uid, status: 'submitted', submittedAt: new Date().toISOString() });
        setSent(true);
      } catch { setError('Your request could not be submitted. Your text is still here.'); } finally { setBusy(false); }
    }}>
      <fieldset disabled={busy}><label>Request type<select value={type} onChange={e => setType(e.target.value)}><option value="bug">Something is broken</option><option value="feature">An idea for the app</option><option value="support">I need help</option></select></label>
      <label>Description<textarea autoFocus required maxLength={4000} rows={5} value={description} onChange={e => setDescription(e.target.value)} /></label></fieldset>
      {error && <p role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
    </form>}<button disabled={busy} onClick={onClose}>Close</button>
  </dialog>;
}
