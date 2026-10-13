import React, { useState } from 'react';
import ItemForm from './ItemForm';
import ItemPhoto from './ItemPhoto';
import '../styles/ItemList.css';
export default function ItemList({ items, onDelete, onEdit, onSaveEdit, editingIndex, setEditingIndex, editedItem,
  setEditedItem, showEditButton = true, onMoveToLooseItems, onMoveToBox, availableBoxes }) {
  const [destinations, setDestinations] = useState({}), [busy, setBusy] = useState(null), [error, setError] = useState('');
  async function act(id, task) {
    if (busy) return;
    setBusy(id); setError('');
    try { await task(); } catch (failure) { setError(failure.message || 'That change could not be saved. Please try again.'); }
    finally { setBusy(null); }
  }
  return <>
    {error && <p role="alert" className="error-text">{error}</p>}
    {!items.length && <div className="empty-state">No items to show. Add an item or try a different search.</div>}
    <div className="item-grid">{items.map(item => <article key={item.id} className="item-card">
      {editingIndex === item.id ? <>
        <ItemForm key={item.id} initialItem={editedItem || item} resetOnSuccess={false} onSubmit={async updated => {
          await onSaveEdit(updated); setEditingIndex(null); setEditedItem(null);
        }} buttonLabel="Save changes" />
        <button onClick={() => { setEditingIndex(null); setEditedItem(null); }}>Cancel editing</button>
      </> : <>
        <ItemPhoto item={item} />
        <h3>{item.name}</h3><p>Quantity: {item.quantity}</p>{item.description && <p>{item.description}</p>}
        <div className="action-buttons">
          {showEditButton && onEdit && <button disabled={!!busy} onClick={() => onEdit(item)}>Edit</button>}
          {onMoveToLooseItems && <button disabled={!!busy} onClick={() => act(item.id, () => onMoveToLooseItems(item))}>Move to loose items</button>}
          <button className="delete" disabled={!!busy} onClick={() => {
            if (window.confirm('Delete “' + item.name + '”?')) act(item.id, () => onDelete(item));
          }}>Delete</button>
        </div>
        {onMoveToBox && <div className="move-box-controls">
          <label>Move to box<select disabled={!!busy} value={destinations[item.id] || ''} onChange={e => setDestinations({ ...destinations, [item.id]: e.target.value })}>
            <option value="">Choose a box</option>{availableBoxes?.map(box => <option key={box.id} value={box.id}>{box.title}</option>)}
          </select></label>
          <button disabled={!!busy || !destinations[item.id]} onClick={() => act(item.id, () => onMoveToBox(item.id, destinations[item.id]))}>Move item</button>
        </div>}
      </>}
    </article>)}</div>
  </>;
}
