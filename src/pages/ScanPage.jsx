import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QrScanner from '../components/QrScanner';
import { parseBoxLink } from '../utils/inventory';
export default function ScanPage() {
  const navigate = useNavigate(), [error, setError] = useState(''), [link, setLink] = useState('');
  const scan = text => { try { const route = parseBoxLink(text); setError(''); navigate(route); } catch (failure) { setError(failure.message); } };
  return <main className="page-container"><Link to="/" className="back-button">Back to inventory</Link><h1>Scan a box label</h1>
    <p>Point your camera at a label to see what’s inside.</p><QrScanner onScanSuccess={scan} />
    {error && <p role="alert">{error}</p>}
    <form onSubmit={e => { e.preventDefault(); scan(link); }}><label>Or paste a box link<input value={link} onChange={e => setLink(e.target.value)} required /></label><button>Open box</button></form>
    <Link to="/boxes">Find a box by name</Link></main>;
}
