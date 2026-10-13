import { normalizeBox, resolveBoxId, validateItem, boxLink, parseBoxLink } from './inventory';
test('Firestore ID survives reload and legacy items resolve to it', () => {
  const box = normalizeBox('firestore-id', { id: 'old-uuid', title: 'Kitchen' });
  expect(box.id).toBe('firestore-id');
  expect(resolveBoxId('old-uuid', [box])).toBe('firestore-id');
  expect(resolveBoxId('firestore-id', [box])).toBe('firestore-id');
  expect(resolveBoxId('missing-box', [box])).toBe('missing-box');
});
test('labels use the deployed root with a hash route and a family scope', () => {
  const link = boxLink('box one', 'family-a', 'https://marlin-reams.github.io/whats-in-the-box/#/qr-codes');
  expect(link).toBe('https://marlin-reams.github.io/whats-in-the-box/#/view/box%20one?family=family-a');
  expect(parseBoxLink(link, 'https://marlin-reams.github.io/whats-in-the-box/')).toBe('/view/box%20one?family=family-a');
  expect(parseBoxLink('https://marlin-reams.github.io/view/legacy', 'https://marlin-reams.github.io/whats-in-the-box/')).toBe('/view/legacy');
});
test('scanner rejects foreign websites and non-box routes', () => {
  expect(() => parseBoxLink('https://evil.example/view/test', 'https://marlin-reams.github.io/')).toThrow();
  expect(() => parseBoxLink('https://marlin-reams.github.io/#/admin-console', 'https://marlin-reams.github.io/')).toThrow();
});
test.each([0, -1, 1.5, '', 'abc', 100001])('rejects invalid quantity %s', quantity => {
  expect(() => validateItem({ name: 'Cups', quantity })).toThrow();
});
test('trims names and coerces integer form input', () => {
  expect(validateItem({ name: ' Cups ', quantity: '3' })).toMatchObject({ name: 'Cups', quantity: 3 });
});

