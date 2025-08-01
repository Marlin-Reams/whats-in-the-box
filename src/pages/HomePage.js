
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">What’s In The Box 📦</h1>

      <div className="homepage-buttons">
      <Link to="/add-box">
  <button className="homepage-button">➕ Add Box</button>
</Link>
<Link to="/add-loose-item">
  <button className="homepage-button">➕ Add Item</button>
</Link>
<Link to="/boxes">
  <button className="homepage-button">📦 View All Boxes</button>
</Link>
<Link to="/loose-items">
  <button className="homepage-button">📋 Item List</button>
</Link>
<Link to="/scan">
  <button className="homepage-button">📷 Scan QR Code</button>
</Link>
<Link to="/qr-codes">
  <button className="homepage-button">📷 Box QR Codes</button>
</Link>
      </div>
    </div>
  );
};

export default HomePage;
