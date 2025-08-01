// src/pages/AddLooseItemPage.js

import React, { useState } from 'react';
import { useItemContext } from '../context/ItemContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/AddLooseItemForm.css';

const AddLooseItemPage = () => {
  const { addItem } = useItemContext();
  const navigate = useNavigate();

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    description: '',
    photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
  
    const itemToAdd = {
      ...newItem,
      quantity: parseInt(newItem.quantity) || 1,
      boxId: null,  // 👈 Mark it as a loose item
    };
  
    addItem(itemToAdd);
  
    // Reset and navigate back
    setNewItem({ name: '', quantity: '', description: '', photo: null });
    navigate('/loose-items');
  };

  return (
    <div className="add-loose-item-page-wrapper">
    
      <Link to="/"><button className="back-home-btn">🏠 Back to Home</button></Link>
      
      <form onSubmit={handleSubmit} className="add-loose-item-form">
      <h1 className="form-title">📦 Add Loose Item</h1>
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
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
          <div className="photo-preview-wrapper">
            <img src={newItem.photo} alt="Preview" className="photo-preview" />
          </div>
        )}

        <button type="submit">✅ Save Item</button>
      </form>
    </div>
  );
};

export default AddLooseItemPage;
