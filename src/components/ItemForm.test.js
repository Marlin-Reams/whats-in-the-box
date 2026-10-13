import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemForm from './ItemForm';
jest.mock('./ItemPhoto', () => () => null);
test('a failed save preserves entered data and shows a retryable error', async () => {
  const save = jest.fn().mockRejectedValue(new Error('Connection lost'));
  render(<ItemForm onSubmit={save} />);
  fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Measuring cups' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Connection lost'));
  expect(screen.getByLabelText('Item name')).toHaveValue('Measuring cups');
  expect(screen.getByRole('button', { name: 'Save item' })).toBeEnabled();
});
test('pending saves disable duplicate submissions and clear only after success', async () => {
  let finish;
  const save = jest.fn(() => new Promise(resolve => { finish = resolve; }));
  render(<ItemForm onSubmit={save} />);
  fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Cups' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByLabelText('Item name')).toHaveValue('Cups');
  finish();
  await waitFor(() => expect(screen.getByLabelText('Item name')).toHaveValue(''));
  expect(save).toHaveBeenCalledTimes(1);
});

