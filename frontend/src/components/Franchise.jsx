import React from 'react';

const Franchise = () => {
  return (
    <section id="franchise" className="section section-dark">
      <div className="container">
        <div className="section-title">
          <h2>Join The Global Franchise Network!</h2>
          <div className="divider"></div>
        </div>
        <div className="franchise-content">
          <div className="franchise-card">
            <i className='bx bx-trending-up'></i>
            <h3>High ROI</h3>
            <p>Proven business model with quick breakeven and high profit margins.</p>
          </div>
          <div className="franchise-card">
            <i className='bx bx-support'></i>
            <h3>Full Support</h3>
            <p>End-to-end setup, training, marketing, and operational support.</p>
          </div>
          <div className="franchise-card">
            <i className='bx bx-world'></i>
            <h3>Global Presence</h3>
            <p>Be part of a rapidly growing international brand.</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <a href="#contact" className="btn btn-primary">Apply Now</a>
        </div>
      </div>
    </section>
  );
};

export default Franchise;
