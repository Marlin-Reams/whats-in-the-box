// src/components/QrScanner.js
import React, { useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/QrScanner.css';

const QrScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const containerId = 'qr-reader';

  const startScanner = () => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(containerId, {
        fps: 10,
        qrbox: 250
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
      setScannerStarted(true);
    }
  };

  return (
    <div>
      {!scannerStarted && (
        <button className="green-btn" onClick={startScanner}>
          📷 Start Scanning
        </button>
      )}
      <div id={containerId} style={{ width: '100%', marginTop: '1rem' }} />
    </div>
  );
};

export default QrScanner;


