import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoxContext } from '../context/BoxContext';
import '../styles/AddBox.css';
export default function AddBox() {
  const { addBox } = useBoxContext(), navigate = useNavigate();
  const [title, setTitle] = useState(''), [notes, setNotes] = useState(''), [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setError('');
    try { const id = await addBox({ title, notes, location }); navigate('/view/' + id); }
    catch (failure) { setError(failure.message || 'Could not create this box. Try again.'); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="add-box-form">
    <fieldset disabled={saving}>
      <label>Box name<input value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} placeholder="Kitchen essentials" autoFocus /></label>
      <label>Where is it?<input value={location} onChange={e => setLocation(e.target.value)} maxLength={200} placeholder="Garage · shelf 2" /></label>
      <label>Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} rows={3} /></label>
    </fieldset>
    {error && <p role="alert" className="error-text">{error}</p>}
    <button disabled={saving}>{saving ? 'Creating…' : 'Create box'}</button>
  </form>;
}
