export const normalizeBox = (id, data) => ({ ...data, legacyId: data.legacyId || (data.id !== id ? data.id : null), id });
export const resolveBoxId = (id, boxes) => id ? boxes.find(b => b.id === id || b.legacyId === id)?.id || id : null;
export function validateItem(item) {
  const name = item.name?.trim(), quantity = Number(item.quantity);
  if (!name || name.length > 120) throw new Error('Enter an item name of up to 120 characters.');
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) throw new Error('Quantity must be a whole number between 1 and 100,000.');
  return { ...item, name, quantity, description: (item.description || '').trim() };
}
export function validateBox(box) {
  const title = box.title?.trim();
  if (!title || title.length > 120) throw new Error('Enter a box name of up to 120 characters.');
  return { title, notes: (box.notes || '').trim(), location: (box.location || '').trim() };
}
export const boxPath = (id, familyId) => '/view/' + encodeURIComponent(id) + (familyId ? '?family=' + encodeURIComponent(familyId) : '');
export function boxLink(id, familyId, base = window.location.href) {
  const url = new URL(base);
  url.hash = boxPath(id, familyId); url.search = '';
  url.pathname = url.pathname.includes('/whats-in-the-box') ? '/whats-in-the-box/' : '/';
  return url.href;
}
export function parseBoxLink(text, base = window.location.href) {
  const url = new URL(text, base);
  if (url.origin !== new URL(base).origin) throw new Error('This QR code belongs to a different website.');
  const route = url.hash ? url.hash.slice(1) : url.pathname.replace(/^\/whats-in-the-box/, '');
  if (!/^\/view\/[^/?#]+(?:\?family=[^&#]+)?$/.test(route)) throw new Error('Scan a box label created by this app.');
  return route;
}
