// import React from 'react';
// import AddBox from '../components/AddBox';
// import { Link } from 'react-router-dom';

// const AddBoxPage = () => (
//   <div style={{ padding: '1rem' }}>
//     <Link to="/"><button>🏠 Back to Home</button></Link>
//     <h1>📦 Add a New Box</h1>
//     <AddBox />
//   </div>
// );

// export default AddBoxPage;

import React from 'react';
import AddBox from '../components/AddBox';
import { Link } from 'react-router-dom';
import '../styles/AddBoxPage.css'; // Make sure this file includes the matching CSS

const AddBoxPage = () => (
  <div className="add-box-wrapper">
    <Link to="/" className="back-home-btn">
      🏠 Back to Home
    </Link>

    <div className="add-box-container">
      <h1 className="form-title"><span>📦</span>Add New Box</h1>
      <AddBox />
    </div>
  </div>
);

export default AddBoxPage;