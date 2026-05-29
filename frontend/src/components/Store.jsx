import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Store = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#0a0a0a', color: 'white', padding: '120px 30px' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Store</h2>
            <div className="divider"></div>
          </div>
          <div className="text-center">
            <p>Welcome to the official Chai Walah store. High-quality merchandise and premium tea blends coming soon!</p>
            <div style={{ marginTop: '50px' }}>
              <i className='bx bx-shopping-bag' style={{ fontSize: '5rem', color: '#c9a227' }}></i>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Store;
