import React, { createContext, useContext, useEffect, useState } from 'react';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    const storedItems = localStorage.getItem('whatsinthebox_all_items');
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        setItems(parsed);
        console.log('✅ Parsed and loaded items:', parsed);
      } catch (err) {
        console.error('❌ Failed to parse localStorage items:', err);
      }
    }
    setHasLoaded(true);
  }, []);

  // Save items to localStorage when changed
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem('whatsinthebox_all_items', JSON.stringify(items));
      console.log('💾 Saved items to localStorage:', items);
    }
  }, [items, hasLoaded]);

  // Add new item
  const addItem = (item) => {
    const itemWithId = {
      ...item,
      id: item.id || crypto.randomUUID(),
      boxId: item.boxId ?? null,  // ✅ keep incoming boxId if defined
    };
  
    setItems((prevItems) => {
      const exists = prevItems.some(existing => existing.id === itemWithId.id);
      return exists ? prevItems : [...prevItems, itemWithId];
    });
  };

  // Delete item by ID
  const deleteItem = (itemId) => {
    setItems((prev) => prev.filter(item => item.id !== itemId));
  };

  // Update item by ID
  const updateItem = (itemId, updatedData) => {
    setItems((prev) =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updatedData } : item
      )
    );
  };

  // Move a single item to a different box (or to loose)
  const moveItemToBox = (itemId, boxId) => {
    updateItem(itemId, { boxId });
  };

  // Move all items from a deleted box to loose items
  const moveItemsToLoose = (boxId) => {
    setItems((prev) =>
      prev.map(item =>
        item.boxId === boxId ? { ...item, boxId: null } : item
      )
    );
  };

  // Derived list of loose items
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
