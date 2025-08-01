import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { saveBoxes, loadBoxes } from '../services/localStorageService';

// ...imports
const BoxContext = createContext();

export const BoxProvider = ({ children }) => {
  const [boxes, setBoxes] = useState(() => {
    const stored = loadBoxes();
    return stored;
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    saveBoxes(boxes);
  }, [boxes]);

  const addBox = (box) => {
    setBoxes((prev) => [...prev, box]);
  };

  const addItemToBox = (boxId, newItem) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId
          ? { ...box, items: [...box.items, newItem] }
          : box
      )
    );
  };

  const removeItemFromBox = (boxId, itemIndex) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId
          ? {
              ...box,
              items: box.items.filter((_, idx) => idx !== itemIndex),
            }
          : box
      )
    );
  };

  const updateBox = (boxId, updatedBox) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, ...updatedBox } : b))
    );
  };

  const getBoxById = (boxId) => {
    return boxes.find((b) => b.id === boxId);
  };

  const deleteBox = (boxId, moveItemsToLoose) => {
    const boxToDelete = boxes.find((box) => box.id === boxId);

    if (boxToDelete && typeof moveItemsToLoose === 'function') {
      moveItemsToLoose(boxId); // ✅ This must be called from outside BoxContext
    }

    const updated = boxes.filter((box) => box.id !== boxId);
    setBoxes(updated);
  };

  return (
    <BoxContext.Provider value={{
      boxes,
      addBox,
      updateBox,
      getBoxById,
      addItemToBox,
      removeItemFromBox,
      deleteBox
    }}>
      {children}
    </BoxContext.Provider>
  );
};

export const useBoxContext = () => useContext(BoxContext);






