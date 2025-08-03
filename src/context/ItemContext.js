// import React, { createContext, useContext, useEffect, useState } from 'react';

// const ItemContext = createContext();

// export const ItemProvider = ({ children }) => {
//   const [items, setItems] = useState([]);
//   const [hasLoaded, setHasLoaded] = useState(false);

//   // Load items from localStorage on mount
//   useEffect(() => {
//     const storedItems = localStorage.getItem('whatsinthebox_all_items');
//     if (storedItems) {
//       try {
//         const parsed = JSON.parse(storedItems);
//         setItems(parsed);
//         console.log('✅ Parsed and loaded items:', parsed);
//       } catch (err) {
//         console.error('❌ Failed to parse localStorage items:', err);
//       }
//     }
//     setHasLoaded(true);
//   }, []);

//   // Save items to localStorage when changed
//   useEffect(() => {
//     if (hasLoaded) {
//       localStorage.setItem('whatsinthebox_all_items', JSON.stringify(items));
//       console.log('💾 Saved items to localStorage:', items);
//     }
//   }, [items, hasLoaded]);

//   // Add new item
//   const addItem = (item) => {
//     const itemWithId = {
//       ...item,
//       id: item.id || crypto.randomUUID(),
//       boxId: item.boxId ?? null,  // ✅ keep incoming boxId if defined
//     };
  
//     setItems((prevItems) => {
//       const exists = prevItems.some(existing => existing.id === itemWithId.id);
//       return exists ? prevItems : [...prevItems, itemWithId];
//     });
//   };

//   // Delete item by ID
//   const deleteItem = (itemId) => {
//     setItems((prev) => prev.filter(item => item.id !== itemId));
//   };

//   // Update item by ID
//   const updateItem = (itemId, updatedData) => {
//     setItems((prev) =>
//       prev.map(item =>
//         item.id === itemId ? { ...item, ...updatedData } : item
//       )
//     );
//   };

//   // Move a single item to a different box (or to loose)
//   const moveItemToBox = (itemId, boxId) => {
//     updateItem(itemId, { boxId });
//   };

//   // Move all items from a deleted box to loose items
//   const moveItemsToLoose = (boxId) => {
//     setItems((prev) =>
//       prev.map(item =>
//         item.boxId === boxId ? { ...item, boxId: null } : item
//       )
//     );
//   };

//   // Derived list of loose items
//   const looseItems = items.filter(item => item.boxId === null);

//   return (
//     <ItemContext.Provider
//       value={{
//         items,
//         looseItems,
//         addItem,
//         deleteItem,
//         updateItem,
//         moveItemToBox,
//         moveItemsToLoose,
//       }}
//     >
//       {children}
//     </ItemContext.Provider>
//   );
// };

// export const useItemContext = () => useContext(ItemContext);
// src/context/ItemContext.js
// src/context/ItemContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  addItemToFirestore,
  deleteItemFromFirestore,
  fetchItemsFromFirestore,
  updateItemInFirestore,
  uploadImageAndGetURL
} from '../firebase/firestoreItemHelpers';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load items from Firestore on mount
  useEffect(() => {
    const load = async () => {
      try {
        const firestoreItems = await fetchItemsFromFirestore();
        setItems(firestoreItems);
        console.log('✅ Synced items from Firestore:', firestoreItems);
      } catch (err) {
        console.error('❌ Failed to fetch items from Firestore:', err);
      } finally {
        setHasLoaded(true);
      }
    };
    load();
  }, []);

  // Add new item
  const addItem = async (item) => {
    const itemId = item.id || crypto.randomUUID();
    let itemToStore = {
      ...item,
      id: itemId,
      boxId: item.boxId ?? null
    };

    // Upload image to Firebase Storage if photo is present
    if (item.photo && item.photo.startsWith('data:image')) {
      try {
        const photoURL = await uploadImageAndGetURL(item.photo, itemId);
        itemToStore.photo = photoURL;
      } catch (err) {
        console.warn('⚠️ Proceeding without image URL due to upload failure');
        itemToStore.photo = '';
      }
    }

    try {
      await addItemToFirestore(itemToStore);
      setItems((prevItems) => [...prevItems, itemToStore]);
      console.log('✅ Item added:', itemToStore);
    } catch (err) {
      console.error('❌ Failed to add item:', err);
    }
  };

  // Delete item by ID
  const deleteItem = async (itemId) => {
    try {
      await deleteItemFromFirestore(itemId);
      setItems((prev) => prev.filter(item => item.id !== itemId));
      console.log('🗑️ Item deleted:', itemId);
    } catch (err) {
      console.error('❌ Failed to delete item:', err);
    }
  };

  // Update item by ID
  const updateItem = async (itemId, updatedData) => {
    try {
      let updatedItemData = { ...updatedData };
  
      // 🔍 Check if it's a new image that needs to be compressed
      if (updatedData.photo && updatedData.photo.startsWith('data:image')) {
        try {
          const photoURL = await uploadImageAndGetURL(updatedData.photo, itemId);
          updatedItemData.photo = photoURL;
        } catch (err) {
          console.warn('⚠️ Proceeding without updated image due to upload failure');
          updatedItemData.photo = '';
        }
      }
  
      // 🔁 Send updated data to Firestore
      await updateItemInFirestore(itemId, updatedItemData);
  
      // 🔄 Update local state
      setItems((prev) =>
        prev.map(item => item.id === itemId ? { ...item, ...updatedItemData } : item)
      );
  
      console.log('✏️ Item updated:', itemId);
    } catch (err) {
      console.error('❌ Failed to update item:', err);
    }
  };
  

  // Move a single item to a different box (or to loose)
  const moveItemToBox = async (itemId, boxId) => {
    await updateItem(itemId, { boxId });
  };

  // Move all items from a deleted box to loose items
  const moveItemsToLoose = async (boxId) => {
    const updates = items
      .filter(item => item.boxId === boxId)
      .map(item => updateItem(item.id, { boxId: null }));
    await Promise.all(updates);
  };

  const looseItems = items.filter(item => item.boxId === null);

  return (
    <ItemContext.Provider
      value={{
        items,
        looseItems,
        addItem,
        deleteItem,
        updateItem,
        moveItemToBox,
        moveItemsToLoose,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = () => useContext(ItemContext);

