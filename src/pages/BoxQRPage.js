// import React, { useRef, useState } from 'react';
// import { useBoxContext } from '../context/BoxContext';
// import { QRCodeSVG } from 'qrcode.react';
// import { Link } from 'react-router-dom';
// import '../styles/BoxQRPage.css'; // You'll create this file

// const BoxQRPage = () => {
//   const { boxes } = useBoxContext();
//   const [selectedBoxes, setSelectedBoxes] = useState([]);
//   const qrRefs = useRef({});

//   const handlePrint = () => window.print();

//   const toggleSelection = (boxId) => {
//     setSelectedBoxes((prev) =>
//       prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
//     );
//   };

//   const handleDownload = (boxId) => {
//     const svg = qrRefs.current[boxId];
//     if (!svg) return;

//     const svgData = new XMLSerializer().serializeToString(svg);
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');

//     const img = new Image();
//     const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
//     const url = URL.createObjectURL(svgBlob);

//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);
//       URL.revokeObjectURL(url);

//       const pngUrl = canvas.toDataURL('image/png');
//       const downloadLink = document.createElement('a');
//       downloadLink.href = pngUrl;
//       downloadLink.download = `${boxId}-qr.png`;
//       downloadLink.click();
//     };

//     img.src = url;
//   };

//   const handlePrintSelected = () => {
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write('<html><head><title>Print QR Codes</title></head><body>');
//     selectedBoxes.forEach((boxId) => {
//       const svg = qrRefs.current[boxId]?.outerHTML;
//       const boxTitle = boxes.find((box) => box.id === boxId)?.title;
//       printWindow.document.write(`<div style="text-align: center; margin: 1rem;">${svg}<p>${boxTitle}</p></div>`);
//     });
//     printWindow.document.write('</body></html>');
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <div className="qr-page-wrapper">
//       <Link to="/" className="back-home-btn">🏠 Back to Home</Link>
//       <h1 className="form-title">📦 Box QR Codes</h1>

//       <div className="qr-actions">
//         <button onClick={handlePrint} className="green-btn">🖨️ Print All</button>
//         <button
//           onClick={handlePrintSelected}
//           className={`green-btn ${selectedBoxes.length === 0 ? 'disabled' : ''}`}
//           disabled={selectedBoxes.length === 0}
//         >
//           🖨️ Print Selected
//         </button>
//       </div>

//       <div className="qr-grid">
//         {boxes.map((box) => (
//           <div
//             key={box.id}
//             className={`qr-card ${selectedBoxes.includes(box.id) ? 'selected' : ''}`}
//           >
//             <div ref={(el) => (qrRefs.current[box.id] = el)}>
//               <QRCodeSVG value={`${window.location.origin}/view/${box.id}`} size={200} />
//             </div>
//             <p className="qr-title">{box.title}</p>
//             <label className="qr-select">
//               <input
//                 type="checkbox"
//                 checked={selectedBoxes.includes(box.id)}
//                 onChange={() => toggleSelection(box.id)}
//               /> Select
//             </label>
//             <button onClick={() => handleDownload(box.id)} className="blue-btn">
//               ⬇️ Download PNG
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BoxQRPage;
import React, { useRef, useState } from 'react';
import { useBoxContext } from '../context/BoxContext';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import '../styles/BoxQRPage.css'; // You'll create this file

const BoxQRPage = () => {
  const { boxes } = useBoxContext();
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const qrRefs = useRef({});

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print All QR Codes</title></head><body>');
    boxes.forEach((box) => {
      const svg = qrRefs.current[box.id]?.outerHTML;
      printWindow.document.write(`
        <div style="text-align: center; margin: 1rem;">
          ${svg}
          <p>${box.title}</p>
        </div>
      `);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const toggleSelection = (boxId) => {
    setSelectedBoxes((prev) =>
      prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
    );
  };

  const handlePrintSelected = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print QR Codes</title></head><body>');
    selectedBoxes.forEach((boxId) => {
      const svg = qrRefs.current[boxId]?.outerHTML;
      const boxTitle = boxes.find((box) => box.id === boxId)?.title;
      printWindow.document.write(`<div style="text-align: center; margin: 1rem;">${svg}<p>${boxTitle}</p></div>`);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="qr-page-wrapper">
      <Link to="/" className="back-home-btn">🏠 Back to Home</Link>
      <h1 className="form-title">📦 Box QR Codes</h1>
  
      <div className="qr-actions">
        <button onClick={handlePrint} className="green-btn">🖨️ Print All</button>
        <button
          onClick={handlePrintSelected}
          className={`green-btn ${selectedBoxes.length === 0 ? 'disabled' : ''}`}
          disabled={selectedBoxes.length === 0}
        >
          🖨️ Print Selected
        </button>
      </div>
  
      <div className="qr-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {boxes.map((box) => (
          <div
            key={box.id}
            className={`qr-card ${selectedBoxes.includes(box.id) ? 'selected' : ''}`}
            onClick={() => toggleSelection(box.id)}
            style={{
              padding: '1rem',
              margin: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: '0.2s ease',
              background: selectedBoxes.includes(box.id) ? '#e6fbe6' : '#fff',
              textAlign: 'center'
            }}
          >
            <div ref={(el) => (qrRefs.current[box.id] = el)}>
              <QRCodeSVG value={`${window.location.origin}/view/${box.id}`} size={200} />
            </div>
            <p className="qr-title">{box.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}  
export default BoxQRPage;

