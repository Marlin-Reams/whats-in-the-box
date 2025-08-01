// //if i have top code uncommented i can add item in a box i can edit item in a box i cannont
// //delete or move item back to loose items

// /* if i have bottom uncommented i can not edit or add and item to a box from inside the box, but i can move and delete and item */

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
    setBox(found);
  }, [boxId, getBoxById]);

  if (!box) return <p>Box not found or no data available.</p>;

  const boxItems = items.filter(item => item.boxId === box.id);
  
  const filteredItems = boxItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
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


// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { QRCodeCanvas } from 'qrcode.react';

// import { useBoxContext } from '../context/BoxContext';
// import { useItemContext } from '../context/ItemContext';

// import AddItemForm from '../components/AddItemForm';
// import ItemList from '../components/ItemList';

// import '../styles/ItemList.css';

// const BoxViewPage = () => {
//   const { boxId } = useParams();
//   const { getBoxById } = useBoxContext();
//   const { items, addItem, updateItem, deleteItem, moveItemToBox } = useItemContext();

//   const [box, setBox] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editedItem, setEditedItem] = useState(null);

//   useEffect(() => {
//     const foundBox = getBoxById(boxId);
//     setBox(foundBox);
//   }, [boxId, getBoxById]);

//   if (!box) return <p>Box not found or no data available.</p>;

//   const boxItems = items.filter(item => item.boxId === box.id);

//   const handleAddItem = (boxId, newItem) => {
//     addItem({ ...newItem, boxId });
//   };

//   const handleDeleteItem = (item) => {
//     deleteItem(item.id);
//   };

//   const handleMoveToLooseItems = (item) => {
//     moveItemToBox(item.id, null);
//   };

//   const handleSaveEdit = (itemId, updatedData) => {
//     updateItem(itemId, { ...updatedData, boxId });
//     setEditingIndex(null);
//     setEditedItem(null);
//   };

//   return (
//     <div style={{ padding: '1rem' }}>
//       <Link to="/">
//         <button style={{ marginBottom: '1rem' }}>🏠 Back to Home</button>
//       </Link>

//       <h1>📦 {box.title}</h1>
//       <p><strong>Notes:</strong> {box.notes || 'None'}</p>

//       <div style={{ marginBottom: '1.5rem' }}>
//         <h4>📱 QR Code for this box</h4>
//         <QRCodeCanvas
//           value={`${window.location.origin}/view/${box.id}`}
//           size={150}
//           bgColor="#ffffff"
//           fgColor="#000000"
//           level="H"
//           includeMargin={true}
//         />
//       </div>

//       <AddItemForm boxId={box.id} onAddItem={handleAddItem} />

//       <input
//         type="text"
//         placeholder="Search items..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
//       />

//       <h3>Items in this box:</h3>
//       <div className="item-grid">
//         <ItemList
//           items={boxItems}
//           searchTerm={searchTerm}
//           onDelete={handleDeleteItem}
//           onMoveToLooseItems={handleMoveToLooseItems}
//           onEdit={(item) => {
//             setEditingIndex(item.id);
//             setEditedItem(item);
//           }}
//           editingIndex={editingIndex}
//           editedItem={editedItem}
//           setEditedItem={setEditedItem}
//           setEditingIndex={setEditingIndex}
//           onSaveEdit={(item) => handleSaveEdit(item.id, item)}
//         />
//       </div>
//     </div>
//   );
// };

// export default BoxViewPage;


