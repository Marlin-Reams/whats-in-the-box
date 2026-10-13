import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useItemContext } from '../context/ItemContext';
import ItemForm from '../components/ItemForm';
import '../styles/AddLooseItemForm.css';
export default function AddLooseItemPage() {
  const { addItem } = useItemContext(), navigate = useNavigate();
  return <main className="page-container">
    <Link to="/" className="back-button">Back to inventory</Link>
    <h1>Add an item</h1>
    <p>Save it as a loose item, then move it into a box when you're ready.</p>
    <ItemForm onSubmit={async item => { await addItem({ ...item, boxId: null }); navigate('/loose-items'); }} buttonLabel="Save item" />
  </main>;
}
