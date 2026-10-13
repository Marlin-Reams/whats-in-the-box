import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItemContext } from '../context/ItemContext';
import { useBoxContext } from '../context/BoxContext';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import '../styles/LooseItemsPage.css';
export default function LooseItemsPage() {
  const { looseItems, deleteItem, updateItem, addItem, moveItemToBox, loading, error } = useItemContext();
  const { boxes } = useBoxContext();
  const [search, setSearch] = useState(''), [editingIndex, setEditingIndex] = useState(null);
  const [editedItem, setEditedItem] = useState(null), [adding, setAdding] = useState(false);
  const filtered = looseItems.filter(item => (item.name + ' ' + (item.description || '')).toLowerCase().includes(search.toLowerCase()));
  return <main className="page-container">
    <Link to="/" className="back-button">Back to inventory</Link><h1>Loose items</h1>
    <p>Items that aren't assigned to a box yet.</p>
    <button onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add item'}</button>
    {adding && <ItemForm onSubmit={async item => { await addItem({ ...item, boxId: null }); setAdding(false); }} />}
    <label className="search-label">Search loose items<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or description" /></label>
    {loading ? <p role="status">Loading items…</p> : error ? <p role="alert">{error}</p> :
      <ItemList items={filtered} onDelete={item => deleteItem(item.id)} onEdit={item => { setEditingIndex(item.id); setEditedItem(item); }}
        onSaveEdit={item => updateItem(item.id, item)} onMoveToBox={moveItemToBox} availableBoxes={boxes}
        editingIndex={editingIndex} setEditingIndex={setEditingIndex} editedItem={editedItem} setEditedItem={setEditedItem} />}
    <Link to="/lost-found">Find items with a missing box</Link>
  </main>;
}
