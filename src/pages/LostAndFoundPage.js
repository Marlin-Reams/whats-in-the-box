// src/pages/LostAndFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useItemContext } from '../context/ItemContext';
import { useBoxContext } from '../context/BoxContext';
import '../styles/LostAndFoundPage.css';


const LostAndFoundPage = () => {
  const { items, moveItemToBox } = useItemContext();
  const { boxes } = useBoxContext();

  const missingItems = items.filter(item => {
    return (
      item.boxId !== null &&
      !boxes.some(box => box.id === item.boxId)
    );
  });

  const handleMove = (itemId, boxId) => {
    moveItemToBox(itemId, boxId);
  };

  return (
    <div className="lost-found-page">
        <Link to="/" className="back-button">🏠 Back to Home</Link>
      <h2>🧳 Lost & Found Items</h2>
      {missingItems.length === 0 ? (
        <p>🎉 No orphaned items found. Everything is in a box!</p>
      ) : (
        <div className="lost-items-grid">
          {missingItems.map(item => (
            <div key={item.id} className="lost-item-card">
              <h4>{item.name || 'Unnamed Item'}</h4>
              {item.photo && <img src={item.photo} alt={item.name} style={{ maxWidth: '100px' }} />}
              <p>Original boxId: {item.boxId}</p>

              <select onChange={(e) => handleMove(item.id, e.target.value)} defaultValue="">
                <option value="" disabled>Move to...</option>
                {boxes.map(box => (
                  <option key={box.id} value={box.id}>{box.title}</option>
                ))}
              </select>

              <button onClick={() => handleMove(item.id, null)}>🧺 Move to Loose Items</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LostAndFoundPage;
