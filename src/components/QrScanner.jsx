import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
// Camera lifecycles are serialized, including slow permission/startup promises.
let cameraQueue = Promise.resolve();
export default function QrScanner({ onScanSuccess }) {
  const [enabled, setEnabled] = useState(false), [error, setError] = useState('');
  const callback = useRef(onScanSuccess);
  callback.current = onScanSuccess;
  useEffect(() => {
    if (!enabled) return;
    let disposed = false, decoded = false, finish;
    const stopped = new Promise(resolve => { finish = resolve; });
    cameraQueue = cameraQueue.catch(() => {}).then(async () => {
      if (disposed) return;
      const scanner = new Html5Qrcode('box-qr-reader');
      try {
        await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 220 } }, text => {
          if (disposed || decoded) return;
          decoded = true; callback.current(text); setEnabled(false);
        }, () => {});
        if (!disposed) await stopped;
      } catch {
        if (!disposed) { setError('Camera unavailable. Check camera permission, or use manual lookup below.'); setEnabled(false); }
      } finally {
        try { if (scanner.isScanning) await scanner.stop(); scanner.clear(); } catch { /* A failed camera start may already be cleared. */ }
      }
    });
    return () => { disposed = true; finish(); };
  }, [enabled]);
  return <section className="scanner"><div id="box-qr-reader" />
    {error && <p role="alert">{error}</p>}
    <button onClick={() => { setError(''); setEnabled(!enabled); }}>{enabled ? 'Stop camera' : 'Start camera'}</button>
  </section>;
}
