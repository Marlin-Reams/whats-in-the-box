/* with top code uncommented i can add edit delete and move item in loose items page*/

/* if both bottoms are uncommented and i delete a box it will move the item back to the loose items page
also if both bottoms are uncommmented i can move an item from boxes to loose items and i can delete items in loose boxes.
also if both bottoms are uncommennted i cannont move an item from loose items to a box nor can i add an item to a box from inside a box */
// src/components/ItemList.js

import React from 'react';
import '../styles/ItemList.css';

const ItemList = ({
  items,
  onDelete,
  onEdit,
  onSaveEdit,
  editingIndex,
  onMoveToBox,
  setEditingIndex,
  editedItem,
  setEditedItem,
  showEditButton = true,
  onMoveToLooseItems,
  availableBoxes,
}) => {
  return (
    <div className="item-grid">
      {items.map((item) => (
        <div key={item.id} className="item-card">
          {editingIndex === item.id ? (
            <div className="item-edit">
              <input
                type="text"
                value={editedItem.name}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, name: e.target.value })
                }
                placeholder="Item Name"
              />
              <input
                type="number"
                value={editedItem.quantity}
                onChange={(e) =>
                  setEditedItem({
                    ...editedItem,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                placeholder="Quantity"
              />
              <input
                type="text"
                value={editedItem.description}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, description: e.target.value })
                }
                placeholder="Description"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditedItem({ ...editedItem, photo: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {editedItem.photo && (
                <img src={editedItem.photo} alt="Preview" className="item-image" />
              )}
              <div className="action-buttons">
                <button
                  onClick={() => {
                    onSaveEdit(editedItem);
                    setEditingIndex(null);
                    setEditedItem(null);
                  }}
                >
                  💾 Save
                </button>
                <button
                  onClick={() => {
                    setEditingIndex(null);
                    setEditedItem(null);
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {item.photo && (
                <img src={item.photo} alt={item.name} className="item-image" />
              )}
              <div className="item-info">
                <strong className="item-name">{item.name}</strong>
                {item.quantity > 1 && <div className="item-qty">Qty: {item.quantity}</div>}
                {item.description && <div className="item-desc">{item.description}</div>}
              </div>
              <div className="action-buttons">
                <button className="delete" onClick={() => onDelete(item)}>
                  Delete 🗑️
                </button>

                {showEditButton && onEdit && (
                  <button
                    className="edit"
                    onClick={() => {
                      setEditingIndex(item.id);
                      setEditedItem(item);
                    }}
                  >
                    Edit ✏️
                  </button>
                )}

                {onMoveToLooseItems && (
                  <button className="move" onClick={() => onMoveToLooseItems(item)}>
                    🧩
                  </button>
                )}
              </div>

              {onMoveToBox && (
                <div className="move-box-controls">
                  <select
                    onChange={(e) =>
                      setEditedItem({ id: item.id, boxId: e.target.value })
                    }
                    value={editedItem?.id === item.id ? editedItem.boxId : ''}
                  >
                    <option value="">📦 Move to Box...</option>
                    {availableBoxes?.map((box) => (
                      <option key={box.id} value={box.id}>
                        {box.title}
                      </option>
                    ))}
                  </select>
                  {editedItem?.id === item.id && editedItem?.boxId && (
                    <button
                      onClick={() => {
                        onMoveToBox(item.id, editedItem.boxId);
                        setEditedItem(null);
                      }}
                      className="move"
                    >
                      ✅ Move
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ItemList;

// // src/components/ItemList.js

// import React from 'react';
// import '../styles/ItemList.css';

// const ItemList = ({
//   items,
//   onDelete,
//   onEdit,
//   onSaveEdit,
//   editingIndex,
//   onMoveToBox,
//   setEditingIndex,
//   editedItem,
//   setEditedItem,
//   showEditButton = true,
//   onMoveToLooseItems,
//   availableBoxes,
// }) => {
//   return (
//     <div className="item-grid">
//       {items.map((item) => (
//         <div key={item.id} className="item-card">
//           {editingIndex === item.id ? (
//             <div className="item-edit">
//               <input
//                 type="text"
//                 value={editedItem.name}
//                 onChange={(e) =>
//                   setEditedItem({ ...editedItem, name: e.target.value })
//                 }
//                 placeholder="Item Name"
//               />
//               <input
//                 type="number"
//                 value={editedItem.quantity}
//                 onChange={(e) =>
//                   setEditedItem({
//                     ...editedItem,
//                     quantity: parseInt(e.target.value) || 1,
//                   })
//                 }
//                 placeholder="Quantity"
//               />
//               <input
//                 type="text"
//                 value={editedItem.description}
//                 onChange={(e) =>
//                   setEditedItem({ ...editedItem, description: e.target.value })
//                 }
//                 placeholder="Description"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) {
//                     const reader = new FileReader();
//                     reader.onloadend = () => {
//                       setEditedItem({ ...editedItem, photo: reader.result });
//                     };
//                     reader.readAsDataURL(file);
//                   }
//                 }}
//               />
//               {editedItem.photo && (
//                 <img src={editedItem.photo} alt="Preview" className="item-image" />
//               )}
//               <div className="action-buttons">
//                 <button
//                   onClick={() => {
//                     onSaveEdit(item, editedItem);
//                     setEditingIndex(null);
//                     setEditedItem(null);
//                   }}
//                 >
//                   💾 Save
//                 </button>
//                 <button
//                   onClick={() => {
//                     setEditingIndex(null);
//                     setEditedItem(null);
//                   }}
//                 >
//                   ❌ Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <>
//               {item.photo && (
//                 <img src={item.photo} alt={item.name} className="item-image" />
//               )}
//               <div className="item-info">
//                 <strong className="item-name">{item.name}</strong>
//                 {item.quantity > 1 && <div className="item-qty">Qty: {item.quantity}</div>}
//                 {item.description && <div className="item-desc">{item.description}</div>}
//               </div>
//               <div className="action-buttons">
//                 <button className="delete" onClick={() => onDelete(item)}>
//                   Delete 🗑️
//                 </button>

//                 {showEditButton && onEdit && (
//                   <button
//                     className="edit"
//                     onClick={() => {
//                       setEditingIndex(item.id);
//                       setEditedItem(item);
//                     }}
//                   >
//                     Edit ✏️
//                   </button>
//                 )}

//                 {onMoveToLooseItems && (
//                   <button className="move" onClick={() => onMoveToLooseItems(item)}>
//                     🧩
//                   </button>
//                 )}
//               </div>

//               {onMoveToBox && (
//                 <div className="move-box-controls">
//                   <select
//                     onChange={(e) =>
//                       setEditedItem({ id: item.id, boxId: e.target.value })
//                     }
//                     value={editedItem?.id === item.id ? editedItem.boxId : ''}
//                   >
//                     <option value="">📦 Move to Box...</option>
//                     {availableBoxes?.map((box) => (
//                       <option key={box.id} value={box.id}>
//                         {box.title}
//                       </option>
//                     ))}
//                   </select>
//                   {editedItem?.id === item.id && editedItem?.boxId && (
//                     <button
//                       onClick={() => {
//                         onMoveToBox(item, editedItem.boxId);
//                         setEditedItem(null);
//                       }}
//                       className="move"
//                     >
//                       ✅ Move
//                     </button>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ItemList;


