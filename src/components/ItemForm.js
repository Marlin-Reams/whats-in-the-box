// import React, { useState, useRef } from 'react';

// const ItemForm = ({
//   onSubmit,
//   buttonLabel = 'Add Item',
//   initialItem = { name: '', quantity: 1, description: '', photo: null },
// }) => {
//   const [item, setItem] = useState(initialItem);
//   const fileInputRef = useRef(null);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setItem((prev) => ({ ...prev, photo: reader.result }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!item.name.trim()) return;
//     onSubmit(item);
//     setItem({ name: '', quantity: 1, description: '', photo: null });
//     fileInputRef.current.value = '';
//   };

//   return (
    
//     <form onSubmit={handleSubmit} className="add-loose-item-form">
//       <input
//         type="text"
//         placeholder="Item Name"
//         value={item.name}
//         onChange={(e) => setItem({ ...item, name: e.target.value })}
//         required
//       />
//       <input
//         type="number"
//         placeholder="Quantity"
//         min="1"
//         value={item.quantity}
//         onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) })}
//       />
//       <input
//         type="text"
//         placeholder="Description"
//         value={item.description}
//         onChange={(e) => setItem({ ...item, description: e.target.value })}
//       />
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleImageUpload}
//         ref={fileInputRef}
//       />
//       {item.photo && (
//         <div className="photo-preview-wrapper">
//           <img src={item.photo} alt="Preview" className="photo-preview" />
//         </div>
//       )}
//       <button type="submit">{buttonLabel}</button>
//     </form>
//   );
// };

// export default ItemForm;
import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const ItemForm = ({
  onSubmit,
  buttonLabel = 'Add Item',
  initialItem = { name: '', quantity: 1, description: '', photo: null },
}) => {
  const [item, setItem] = useState(initialItem);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const base64 = await convertToBase64(compressedFile);
      setItem((prev) => ({ ...prev, photo: base64 }));
    } catch (error) {
      console.error('Image compression failed:', error);
    }
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item.name.trim()) return;
    onSubmit(item);
    setItem({ name: '', quantity: 1, description: '', photo: null });
    fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="add-loose-item-form">
      <input
        type="text"
        placeholder="Item Name"
        value={item.name}
        onChange={(e) => setItem({ ...item, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        min="1"
        value={item.quantity}
        onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) })}
      />
      <input
        type="text"
        placeholder="Description"
        value={item.description}
        onChange={(e) => setItem({ ...item, description: e.target.value })}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
      />
      {item.photo && (
        <div className="photo-preview-wrapper">
          <img src={item.photo} alt="Preview" className="photo-preview" />
        </div>
      )}
      <button type="submit">{buttonLabel}</button>
    </form>
  );
};

export default ItemForm;
