// // src/components/QrScanner.js
// import React, { useRef, useState } from 'react';
// import { Html5QrcodeScanner } from 'html5-qrcode';
// import '../styles/QrScanner.css';

// const QrScanner = ({ onScanSuccess, onScanError }) => {
//   const scannerRef = useRef(null);
//   const [scannerStarted, setScannerStarted] = useState(false);
//   const containerId = 'qr-reader';

//   const startScanner = () => {
//     if (!scannerRef.current) {
//       const scanner = new Html5QrcodeScanner(containerId, {
//         fps: 10,
//         qrbox: 250
//       });

//       scanner.render(onScanSuccess, onScanError);
//       scannerRef.current = scanner;
//       setScannerStarted(true);
//     }
//   };

//   return (
//     <div>
//       {!scannerStarted && (
//         <button className="green-btn" onClick={startScanner}>
//           📷 Start Scanning
//         </button>
//       )}
//       <div id={containerId} style={{ width: '100%', marginTop: '1rem' }} />
//     </div>
//   );
// };

// export default QrScanner;

// src/components/QrScanner.jsx
import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import '../styles/QrScanner.css'; // ✅ Make sure this is created

const QrScanner = ({ onScanSuccess }) => {
  const qrCodeRegionId = 'html5qr-code-full-region';
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
    let isScannerRunning = false;

    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices.length) {
          html5QrCodeRef.current
            .start(
              devices[0].id,
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText) => {
                onScanSuccess(decodedText);
                html5QrCodeRef.current.stop().then(() => {
                  isScannerRunning = false;
                }).catch(console.warn);
              },
              (error) => {
                // Optional: handle scan errors here
              }
            )
            .then(() => {
              isScannerRunning = true;
            })
            .catch(console.error);
        }
      })
      .catch(console.error);

    return () => {
      if (html5QrCodeRef.current && isScannerRunning) {
        html5QrCodeRef.current
          .stop()
          .catch((err) => console.warn("Scanner stop failed:", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="qr-scanner-wrapper">
      <h3>📦 Scan Box QR Code</h3>
      <div id={qrCodeRegionId} />
    </div>
  );
};

export default QrScanner;

