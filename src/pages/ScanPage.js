// src/pages/ScanQRPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import QrScanner from '../components/QrScanner';
import '../styles/QrScanner.css';

const ScanQRPage = () => {
  const handleScanSuccess = (decodedText) => {
    window.location.href = decodedText;
  };

  const handleScanError = (error) => {
    console.warn('Scan error:', error);
  };

  return (
    <div className="qr-page-wrapper">
      <Link to="/" className="back-button">🏠 Back to Home</Link>
      <h1 className="qr-title">📸 Scan a Box QR Code</h1>

      <div className="qr-scanner-wrapper">
        <QrScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
      </div>
    </div>
  );
};

export default ScanQRPage;