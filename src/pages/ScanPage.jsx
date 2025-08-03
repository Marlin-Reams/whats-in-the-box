// // src/pages/ScanQRPage.js
// import React from 'react';
// import { Link } from 'react-router-dom';
// import QrScanner from '../components/QrScanner';
// import '../styles/QrScanner.css';

// const ScanQRPage = () => {
//   const handleScanSuccess = (decodedText) => {
//     window.location.href = decodedText;
//   };

//   const handleScanError = (error) => {
//     console.warn('Scan error:', error);
//   };

//   return (
//     <div className="qr-page-wrapper">
//       <Link to="/" className="back-button">🏠 Back to Home</Link>
//       <h1 className="qr-title">📸 Scan a Box QR Code</h1>

//       <div className="qr-scanner-wrapper">
//         <QrScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
//       </div>
//     </div>
//   );
// };

// export default ScanQRPage;

// src/pages/ScanPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from '../components/QrScanner';
import '../styles/ScanPage.css';

const ScanPage = () => {
  const navigate = useNavigate();

  const handleScanSuccess = (decodedText) => {
    try {
      const url = new URL(decodedText);
      navigate(url.pathname); // Extracts and uses only the "/view/..." part
    } catch (error) {
      console.error("Invalid QR code format", error);
      alert("Scanned QR code is not a valid box link.");
    }
  };

  return (
    <div className="scan-page-container">
      <h2>📦 Scan a Box QR Code</h2>
      <div className="scanner-wrapper">
        <QrScanner onScanSuccess={handleScanSuccess} />
      </div>
    </div>
  );
};

export default ScanPage;

