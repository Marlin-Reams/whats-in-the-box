import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { validateItem } from '../utils/inventory';
import ItemPhoto from './ItemPhoto';
const empty = { name: '', quantity: 1, description: '', photo: null };
export default function ItemForm({ onSubmit, buttonLabel = 'Save item', initialItem = empty, resetOnSuccess = true }) {
  const [item, setItem] = useState(initialItem), [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false), [error, setError] = useState('');
  const fileRef = useRef(null);
  const change = (field, value) => setItem(current => ({ ...current, [field]: value }));
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setError('Choose an image under 10 MB.'); event.target.value = ''; return;
    }
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.25, maxWidthOrHeight: 1200, useWebWorker: true });
      change('photo', await imageCompression.getDataUrlFromFile(compressed));
    } catch { setError('The photo could not be prepared. Try another image.'); }
    finally { setUploading(false); }
  }
  async function submit(event) {
    event.preventDefault();
    if (saving || uploading) return;
    setError(''); setSaving(true);
    try {
      await onSubmit(validateItem(item));
      if (resetOnSuccess) { setItem(empty); if (fileRef.current) fileRef.current.value = ''; }
    } catch (failure) { setError(failure.message || 'Could not save this item. Your changes are still here.'); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="add-loose-item-form">
    <fieldset disabled={saving || uploading}>
      <label>Item name<input value={item.name} onChange={e => change('name', e.target.value)} required maxLength={120} autoFocus /></label>
      <label>Quantity<input type="number" min="1" max="100000" step="1" value={item.quantity} onChange={e => change('quantity', e.target.value)} required /></label>
      <label>Description<textarea value={item.description || ''} onChange={e => change('description', e.target.value)} maxLength={2000} rows={3} /></label>
      <label>Photo (optional)<input type="file" accept="image/*" onChange={upload} ref={fileRef} /></label>
      <ItemPhoto item={item} />
    </fieldset>
    {error && <p role="alert" className="error-text">{error}</p>}
    <button type="submit" disabled={saving || uploading}>{uploading ? 'Preparing photo…' : saving ? 'Saving…' : buttonLabel}</button>
  </form>;
}
