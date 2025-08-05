import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

import { useBoxContext } from '../context/BoxContext';
import { useItemContext } from '../context/ItemContext';

import AddItemForm from '../components/AddItemForm';
import ItemList from '../components/ItemList';

import '../styles/ItemList.css'; // you may want to split styles eventually
import '../styles/BoxViewPage.css'; // <-- add this!

const BoxViewPage = () => {
  const { boxId } = useParams();
  const { getBoxById } = useBoxContext();
  const { items, addItem, updateItem, deleteItem, moveItemToBox } = useItemContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [box, setBox] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedItem, setEditedItem] = useState(null);

  useEffect(() => {
    const found = getBoxById(boxId);
    if (found) {
      setBox(found);
    }
  }, [boxId, getBoxById]);

  if (!box) return <p>Box not found or no data available.</p>;

  const boxItems = items.filter(item => item.boxId === box.id);
  console.log('📦 Currently Viewing Box:', box);         // Show box ID and title
  console.log('📦 box.id:', box?.id);                    // Confirm it's defined
  console.log('📦 All Items:', items);                   // Show all items
  console.log('📦 Filtered Items for Box:', boxItems);   // Show filtered result
  items.forEach(item => {
    console.log(`🔍 Item ID: ${item.id}, Name: ${item.name}, boxId: ${item.boxId}, matches: ${item.boxId == box.id}`);
  });
  
  const filteredItems = boxItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (boxId, newItem) => {
    addItem({ ...newItem, boxId });
  };

  const handleDeleteItem = (itemId) => {
    deleteItem(itemId);
  };

  const handleMoveToLooseItems = (itemId) => {
    moveItemToBox(itemId, null);
  };

  const handleSaveEdit = (itemId, updatedData) => {
    updateItem(itemId, { ...updatedData, boxId });
    setEditingIndex(null);
    setEditedItem(null);
  };

  return (
    <div className="box-view-page">
  <div className="box-view-container">
    
    <div className="box-header">
      <Link to="/" className="back-button">🏠 Back to Home</Link>
      <h1>📦 {box.title}</h1>
  <p><strong>Notes:</strong> {box.notes || 'None'}</p>

  <button
  className="toggle-form-btn"
  onClick={() => setShowQrCode(prev => !prev)}
>
  {showQrCode ? '➖ Hide QR Code' : '📄 Show QR Code for this Box'}
</button>

{showQrCode && (
  <div className="qr-section">
    <div className="qr-box">
      <div
        className="printable-qr"
        onClick={() => window.print()}
        title="Click to print QR Code"
        style={{ cursor: 'pointer' }}
      >
        <QRCodeCanvas
          value={`${window.location.origin}/view/${box.id}`}
          size={150}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          🖨️ Click QR to Print
        </div>
      </div>
    </div>
  </div>
)}
</div>

    <div className="box-content">
    <button
  className="toggle-form-btn"
  onClick={() => setShowAddForm(prev => !prev)}
>
  {showAddForm ? '➖ Cancel' : '➕ Add New Item to Box'}
</button>

{showAddForm && (
  <div className="add-form-wrapper">
    <AddItemForm boxId={box.id} onAddItem={handleAddItem} />
  </div>
)}


{boxItems.length > 1 && (
  <input
    type="text"
    className="search-bar"
    placeholder="Search items..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
)}

      <h3>Items in this box:</h3>
      <ItemList
  items={filteredItems}
  searchTerm={searchTerm}
  onDelete={(item) => handleDeleteItem(item.id)}
  onMoveToLooseItems={(item) => handleMoveToLooseItems(item.id)}
  onEdit={(item) => {
    setEditingIndex(item.id);
    setEditedItem(item);
  }}
  editingIndex={editingIndex}
  editedItem={editedItem}
  setEditedItem={setEditedItem}
  setEditingIndex={setEditingIndex}
  onSaveEdit={(updatedItem) => handleSaveEdit(updatedItem.id, updatedItem)}
/>
    </div>
  </div>
  </div>
  );
};

export default BoxViewPage;
