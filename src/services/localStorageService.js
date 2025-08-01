const STORAGE_KEY = 'whatsinthebox_boxes';

export const saveBoxes = (boxes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
  } catch (err) {
    console.error('Failed to save boxes:', err);
  }
};

export const loadBoxes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load boxes:', err);
    return [];
  }
};

