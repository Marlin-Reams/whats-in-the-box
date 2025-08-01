import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItemContext } from '../context/ItemContext';
import { useBoxContext } from '../context/BoxContext';
import ItemList from '../components/ItemList';
import '../styles/LooseItemsPage.css';

const LooseItemsPage = () => {
  const { looseItems, deleteItem, updateItem, addItem, moveItemToBox } = useItemContext();

  const { boxes, addItemToBox } = useBoxContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedItem, setEditedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', description: '', photo: null });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = (item) => deleteItem(item.id);
  const handleEdit = (item) => updateItem(item.id, item);
  const handleMoveToBox = (itemId, boxId) => {
    const item = looseItems.find((i) => i.id === itemId);
    if (!item) return;
    addItemToBox(boxId, item);
    moveItemToBox(itemId, boxId);
  };
  

  const handleAddLooseItem = () => {
    if (!newItem.name.trim()) return;
    addItem({
      ...newItem,
      quantity: parseInt(newItem.quantity) || 1,
      boxId: null,
    });
    setNewItem({ name: '', quantity: '', description: '', photo: null });
    setShowAddForm(false);
  };

  const filteredItems = looseItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="loose-items-container">
      <Link to="/" className="back-button">🏠 Back to Home</Link>
      <h1 className="page-title">🧩 Loose Items</h1>

      <button
        className="toggle-form-btn"
        onClick={() => setShowAddForm(prev => !prev)}
      >
        {showAddForm ? '➖ Cancel' : '➕ Add New Item'}
      </button>

      {showAddForm && (
        <div className="add-form">
          <h1 className="form-title">📦 Add Loose Item</h1>
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="How many"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setNewItem({ ...newItem, photo: reader.result });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          {newItem.photo && (
            <div className="photo-preview">
              <img src={newItem.photo} alt="Preview" />
            </div>
          )}
          <button onClick={handleAddLooseItem} className="save-btn">✅ Save Item</button>
        </div>
      )}

      <input
        className="search-bar"
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ItemList
        items={filteredItems}
        onDelete={handleDelete}
        onEdit={(item) => {
          setEditingIndex(item.id);
          setEditedItem(item);
        }}
        onMoveToBox={handleMoveToBox}
        onSaveEdit={handleEdit}
        availableBoxes={boxes}
        editingIndex={editingIndex}
        setEditingIndex={setEditingIndex}
        editedItem={editedItem}
        setEditedItem={setEditedItem}
      />
    </div>
  );
};

export default LooseItemsPage;
