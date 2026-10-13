import React, { useEffect, useState } from 'react';
import { loadPhoto } from '../firebase/inventoryService';
export default function ItemPhoto({ item, className = 'item-image' }) {
  const [photo, setPhoto] = useState(null), [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true, objectUrl;
    setPhoto(null); setFailed(false);
    if (item.photoPath) loadPhoto(item.photoPath).then(blob => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob); setPhoto(objectUrl);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [item.photoPath]);
  const src = item.photoPath ? photo : item.photo;
  return src ? <img src={src} alt={item.name || 'Item photo'} className={className} loading="lazy" />
    : item.photoPath ? <span className="photo-status">{failed ? 'Photo unavailable' : 'Loading photo…'}</span> : null;
}
