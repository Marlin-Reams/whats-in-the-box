import React from 'react';
import ItemForm from './ItemForm';
import { useLooseItemContext } from '../context/LooseItemContext';

const AddLooseItemForm = () => {
  const { addLooseItem } = useLooseItemContext();

  return (
    <div className="add-page-wrapper">
      <ItemForm onSubmit={addLooseItem} buttonLabel="➕ Add Loose Item" />
    </div>
  );
};

export default AddLooseItemForm;