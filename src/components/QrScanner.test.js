import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QrScanner from './QrScanner';
import { Html5Qrcode } from 'html5-qrcode';
jest.mock('html5-qrcode', () => ({ Html5Qrcode: jest.fn() }));
test('camera startup resolving after unmount is stopped and cannot navigate', async () => {
  let finishStart;
  const start = jest.fn(() => new Promise(resolve => { finishStart = resolve; }));
  const stop = jest.fn().mockResolvedValue(), clear = jest.fn(), navigate = jest.fn();
  Html5Qrcode.mockImplementation(() => ({ start, stop, clear, isScanning: true }));
  const view = render(<QrScanner onScanSuccess={navigate} />);
  fireEvent.click(screen.getByRole('button', { name: 'Start camera' }));
  await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
  view.unmount();
  start.mock.calls[0][2]('https://example.com/#/view/test');
  expect(navigate).not.toHaveBeenCalled();
  finishStart();
  await waitFor(() => expect(stop).toHaveBeenCalledTimes(1));
  expect(clear).toHaveBeenCalled();
});
test('camera denial has a visible recovery message and retry action', async () => {
  Html5Qrcode.mockImplementation(() => ({ start: jest.fn().mockRejectedValue(new Error('denied')), stop: jest.fn(), clear: jest.fn(), isScanning: false }));
  render(<QrScanner onScanSuccess={jest.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Start camera' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Camera unavailable'));
  expect(screen.getByRole('button', { name: 'Start camera' })).toBeInTheDocument();
});
