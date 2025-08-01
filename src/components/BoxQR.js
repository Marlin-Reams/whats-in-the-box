// import React, { useRef, useState } from 'react';
// import { QRCodeSVG } from 'qrcode.react';

// const BoxQR = ({ boxId }) => {
//   const url = `${window.location.origin}/view/${boxId}`;
//   const qrRef = useRef(null);
//   const [qrSize, setQrSize] = useState(128); // Default size

//   const handleDownload = () => {
//     const svg = qrRef.current.querySelector('svg');
//     const svgData = new XMLSerializer().serializeToString(svg);
//     const canvas = document.createElement('canvas');
//     const img = new Image();
//     const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
//     const blobUrl = URL.createObjectURL(svgBlob);

//     img.onload = () => {
//       canvas.width = qrSize;
//       canvas.height = qrSize;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(img, 0, 0, qrSize, qrSize);
//       URL.revokeObjectURL(blobUrl);

//       const pngUrl = canvas.toDataURL('image/png');
//       const downloadLink = document.createElement('a');
//       downloadLink.href = pngUrl;
//       downloadLink.download = `box-${boxId}-qr-${qrSize}px.png`;
//       document.body.appendChild(downloadLink);
//       downloadLink.click();
//       document.body.removeChild(downloadLink);
//     };

//     img.src = blobUrl;
//   };

//   const handlePrint = () => {
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head><title>Print QR Code</title></head>
//         <body>
//           <h3>QR for Box ID: ${boxId}</h3>
//           ${qrRef.current.innerHTML}
//           <script>
//             window.onload = function() {
//               window.print();
//               window.onafterprint = function() {
//                 window.close();
//               };
//             };
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   return (
//     <div style={{ marginTop: '0.5rem' }}>
//       <div ref={qrRef}>
//         <QRCodeSVG value={url} size={qrSize} />
//       </div>
//       <p style={{ fontSize: '0.8rem' }}>{url}</p>

//       <label>
//         Size:&nbsp;
//         <select value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))}>
//           <option value={128}>Small (128px)</option>
//           <option value={256}>Medium (256px)</option>
//           <option value={512}>Large (512px)</option>
//         </select>
//       </label>

//       <div style={{ marginTop: '0.5rem' }}>
//         <button onClick={handleDownload} style={{ marginRight: '0.5rem' }}>Download PNG</button>
//         <button onClick={handlePrint}>Print QR</button>
//       </div>
//     </div>
//   );
// };

// export default BoxQR;




