import React from 'react';
import ItemForm from './ItemForm';

const AddItemForm = ({ boxId, onAddItem }) => {
  const handleSubmit = (item) => {
    onAddItem(boxId, item); // ✅ use the passed-in handler
  };

  return (
    <div className="add-page-wrapper">
      <ItemForm onSubmit={handleSubmit} buttonLabel="➕ Add to Box" />
    </div>
  );
};

export default AddItemForm;
