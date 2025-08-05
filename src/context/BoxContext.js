// import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
// import { saveBoxes, loadBoxes } from '../services/localStorageService';


// // ...imports
// const BoxContext = createContext();

// export const BoxProvider = ({ children }) => {
//   const [boxes, setBoxes] = useState(() => {
//     const stored = loadBoxes();
//     return stored;
//   });

//   const isFirstMount = useRef(true);

//   useEffect(() => {
//     if (isFirstMount.current) {
//       isFirstMount.current = false;
//       return;
//     }
//     saveBoxes(boxes);
//   }, [boxes]);

//   const addBox = (box) => {
//     setBoxes((prev) => [...prev, box]);
//   };

//   const addItemToBox = (boxId, newItem) => {
//     setBoxes((prev) =>
//       prev.map((box) =>
//         box.id === boxId
//           ? { ...box, items: [...box.items, newItem] }
//           : box
//       )
//     );
//   };

//   const removeItemFromBox = (boxId, itemIndex) => {
//     setBoxes((prev) =>
//       prev.map((box) =>
//         box.id === boxId
//           ? {
//               ...box,
//               items: box.items.filter((_, idx) => idx !== itemIndex),
//             }
//           : box
//       )
//     );
//   };

//   const updateBox = (boxId, updatedBox) => {
//     setBoxes((prev) =>
//       prev.map((b) => (b.id === boxId ? { ...b, ...updatedBox } : b))
//     );
//   };

//   const getBoxById = (boxId) => {
//     return boxes.find((b) => b.id === boxId);
//   };

//   const deleteBox = (boxId, moveItemsToLoose) => {
//     const boxToDelete = boxes.find((box) => box.id === boxId);

//     if (boxToDelete && typeof moveItemsToLoose === 'function') {
//       moveItemsToLoose(boxId); // ✅ This must be called from outside BoxContext
//     }

//     const updated = boxes.filter((box) => box.id !== boxId);
//     setBoxes(updated);
//   };

//   return (
//     <BoxContext.Provider value={{
//       boxes,
//       addBox,
//       updateBox,
//       getBoxById,
//       addItemToBox,
//       removeItemFromBox,
//       deleteBox
//     }}>
//       {children}
//     </BoxContext.Provider>
//   );
// };

// export const useBoxContext = () => useContext(BoxContext);

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  addBoxToFirestore,
  fetchBoxesFromFirestore,
  updateBoxInFirestore,
  deleteBoxFromFirestore
} from '../firebase/firestoreHelpers';

const BoxContext = createContext();

export const BoxProvider = ({ children }) => {
  const [boxes, setBoxes] = useState([]);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const cloudBoxes = await fetchBoxesFromFirestore();
          setBoxes(cloudBoxes);
          console.log("✅ Synced boxes from Firestore:", cloudBoxes);
        } catch (err) {
          console.error("❌ Failed to load boxes from Firestore:", err);
        }
      } else {
        console.warn("⚠️ User not logged in. Skipping box fetch.");
      }
    });
  
    return () => unsubscribe();
  }, []);

  const addBox = async (box) => {
    try {
      const id = await addBoxToFirestore(box);
      const newBox = { ...box, id, items: box.items || [] };
      setBoxes((prev) => [...prev, newBox]);
      console.log("✅ Box added:", newBox);
    } catch (err) {
      console.error("❌ Failed to add box:", err);
    }
  };

  const updateBox = async (boxId, updatedBox) => {
    try {
      await updateBoxInFirestore(boxId, updatedBox);
      setBoxes((prev) =>
        prev.map((b) => (b.id === boxId ? { ...b, ...updatedBox } : b))
      );
      console.log("✅ Box updated:", boxId);
    } catch (err) {
      console.error("❌ Failed to update box:", err);
    }
  };

  const deleteBox = async (boxId, moveItemsToLoose) => {
    try {
      await deleteBoxFromFirestore(boxId);
      if (typeof moveItemsToLoose === 'function') {
        moveItemsToLoose(boxId);
      }
      setBoxes((prev) => prev.filter((box) => box.id !== boxId));
      console.log("✅ Box deleted:", boxId);
    } catch (err) {
      console.error("❌ Failed to delete box:", err);
    }
  };

  const getBoxById = (boxId) => {
    return boxes.find((b) => b.id === boxId);
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

  return (
    <BoxContext.Provider
      value={{
        boxes,
        addBox,
        updateBox,
        getBoxById,
        addItemToBox,
        removeItemFromBox,
        deleteBox
      }}
    >
      {children}
    </BoxContext.Provider>
  );
};

export const useBoxContext = () => useContext(BoxContext);






