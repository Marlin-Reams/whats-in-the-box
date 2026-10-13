import React from 'react';
import ItemForm from './ItemForm';
export default function AddItemForm({ boxId, onAddItem }) {
  return <ItemForm onSubmit={item => onAddItem(boxId, item)} buttonLabel="Add to box" />;
}
