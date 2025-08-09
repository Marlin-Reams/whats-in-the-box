// src/pages/AllBoxesPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoxContext } from '../context/BoxContext';
import { useItemContext } from '../context/ItemContext';
import '../styles/AllBoxesPage.css';

const AllBoxesPage = () => {
  const { boxes, updateBox, deleteBox } = useBoxContext();
  const { items, moveItemsToLoose } = useItemContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [editedData, setEditedData] = useState({ title: '', notes: '' });

  const filteredBoxes = boxes.filter((box) => {
    const boxMatches = box.title.toLowerCase().includes(searchTerm.toLowerCase());

    const boxItems = items.filter(item => item.boxId === box.id);
    const itemMatches = boxItems.some(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return boxMatches || itemMatches;
  });

  const handleEdit = (box) => {
    setEditingBoxId(box.id);
    setEditedData({ title: box.title, notes: box.notes || '' });
  };

  const handleSave = (boxId) => {
    updateBox(boxId, editedData);
    setEditingBoxId(null);
    setEditedData({ title: '', notes: '' });
  };

  const handleDelete = (boxId) => {
    if (window.confirm("Are you sure you want to delete this box?")) {
      deleteBox(boxId, moveItemsToLoose);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-wrapper">
        <Link to="/" className="back-button">🏠 Back to Home</Link>
        <h1 className="page-title">📦 All Boxes</h1>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Search boxes or items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredBoxes.length === 0 ? (
        <p>No boxes found.</p>
      ) : (
        <div className="boxes-grid">
          {filteredBoxes.map((box) => {
            const matchingItems = items
              .filter(item => item.boxId === box.id)
              .filter(item =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
              );

            return (
              <div key={box.id} className="box-card">
                {editingBoxId === box.id ? (
                  <>
                    <input
                      type="text"
                      value={editedData.title}
                      onChange={(e) =>
                        setEditedData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Box Title"
                      className="box-edit-input"
                    />
                    <input
                      type="text"
                      value={editedData.notes}
                      onChange={(e) =>
                        setEditedData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Notes"
                      className="box-edit-input"
                    />
                    <div className="box-actions">
                      <button onClick={() => handleSave(box.id)}>💾 Save</button>
                      <button onClick={() => setEditingBoxId(null)}>❌ Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="box-title">{box.title}</div>
                    {box.notes && <div className="box-notes">{box.notes}</div>}

                    <div>
                      <Link className="box-action-button open" to={`/view/${box.id}`}>
                        <span>📂</span> Open
                      </Link>
                      <button
                        className="box-action-button edit"
                        onClick={() => handleEdit(box)}
                      >
                        <span>✏️ Edit</span>
                      </button>
                      <button
                        className="box-action-button delete"
                        onClick={() => handleDelete(box.id)}
                      >
                        <span>🗑️ Delete</span>
                      </button>
                    </div>

                    {searchTerm && matchingItems.length > 0 && (
  <div className="matching-items">
    <strong>Matching Items:</strong>
    <div className="matching-items-grid">
      {matchingItems.map(item => (
        <div key={item.id} className="matching-item-card">
          

          {item.photo && (
  <img
    src={item.photo}
    alt={item.name}
    className="matching-item-thumbnail"
  />
)}

          <div className="matching-item-name">{item.name}</div>
        </div>
      ))}
    </div>
  </div>
)}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllBoxesPage;
