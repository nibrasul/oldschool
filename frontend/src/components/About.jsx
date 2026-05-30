import React from 'react';

const About = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-title">
          <h2>Our Story</h2>
          <div className="divider"></div>
        </div>
        <div className="about-grid">
          <div className="about-text">
            <p>We believe in serving not just tea, but an experience. The Chai Walah brings you the authentic taste of Indian street chai in a premium, hygienic, and modern setting.</p>
            <p>With our carefully selected ingredients and unique brewing techniques, every cup is a journey through the rich heritage of Indian tea culture.</p>
            <a href="#menu" className="btn btn-outline">Explore Menu</a>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Chai preparation" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
