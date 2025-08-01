import React, { useState } from 'react';
import { useBoxContext } from '../context/BoxContext';
import { v4 as uuidv4 } from 'uuid';
import '../styles/AddBox.css';

const AddBox = () => {
  const { addBox } = useBoxContext();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBox = {
      id: uuidv4(),
      title,
      notes,
      items: [],
      createdAt: new Date().toISOString(),
    };

    addBox(newBox);
    setTitle('');
    setNotes('');
  };

  return (
    <div >
      <h2 className="form-title"> </h2>
      <form onSubmit={handleSubmit} className="add-box-form">
        <input
          type="text"
          placeholder="Box Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Optional Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
        <button type="submit">✅ Create Box</button>
      </form>
    </div>
  );
};

export default AddBox;

