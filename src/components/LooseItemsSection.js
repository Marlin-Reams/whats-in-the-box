import React, { useState } from 'react';
import { useLooseItemContext } from '../context/LooseItemContext';
import { useBoxContext } from '../context/BoxContext';
import AddLooseItemForm from './AddLooseItemForm';

const LooseItemsSection = () => {
  const { looseItems, deleteLooseItem } = useLooseItemContext();
  const { boxes, addItemToBox } = useBoxContext();

  const [selectedBoxes, setSelectedBoxes] = useState({});

  const handleSelectChange = (index, value) => {
    setSelectedBoxes((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleMoveToBox = (index) => {
    const itemToMove = looseItems[index];
    const targetBoxId = selectedBoxes[index];
    if (!itemToMove || !targetBoxId) return;

    addItemToBox(targetBoxId, itemToMove);
    deleteLooseItem(index);

    // Reset dropdown selection
    setSelectedBoxes((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <AddLooseItemForm />

      <h3>🧩 Loose Items</h3>
      {looseItems.length === 0 ? (
        <p>No loose items yet.</p>
      ) : (
        <ul>
          {looseItems.map((item, index) => (
            <li key={index} style={{ marginBottom: '1rem' }}>
              <div>
                <strong>{item.name}</strong> {item.quantity > 1 && `(${item.quantity})`}
              </div>
              {item.description && <div>{item.description}</div>}
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  style={{
                    maxWidth: '100px',
                    border: '1px solid #ccc',
                    marginTop: '0.3rem',
                  }}
                />
              )}

              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor={`move-${index}`}>Move to box: </label>
                <select
                  id={`move-${index}`}
                  value={selectedBoxes[index] || ''}
                  onChange={(e) => handleSelectChange(index, e.target.value)}
                >
                  <option value="">Select a box...</option>
                  {boxes.map((box) => (
                    <option key={box.id} value={box.id}>
                      {box.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleMoveToBox(index)}
                  disabled={!selectedBoxes[index]}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Move
                </button>
              </div>

              <button
                onClick={() => deleteLooseItem(index)}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LooseItemsSection;

