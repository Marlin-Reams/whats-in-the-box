import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoxContext } from '../context/BoxContext';
import '../styles/AllBoxesPage.css';
import { useItemContext } from '../context/ItemContext';

const AllBoxesPage = () => {
  const { boxes, updateBox, deleteBox } = useBoxContext();
  const { moveItemsToLoose } = useItemContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [editedData, setEditedData] = useState({ title: '', notes: '' });

  const filteredBoxes = boxes.filter((box) =>
    box.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      // Get current items from localStorage
      
  
      // Now delete the box
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
        placeholder="Search boxes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
  
      {filteredBoxes.length === 0 ? (
        <p>No boxes found.</p>
      ) : (
        <div className="boxes-grid">
          {filteredBoxes.map((box) => (
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
                    <Link className="box-action-button open" to={`/view/${box.id}`}><span>📂</span> Open</Link>
                    <button className='box-action-button edit' onClick={() => handleEdit(box)}><span>✏️ Edit</span></button>
                    <button className='box-action-button delete'onClick={() => handleDelete(box.id)}><span>🗑️ Delete</span></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
};

export default AllBoxesPage;
