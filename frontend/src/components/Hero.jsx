import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="video-overlay"></div>
      <video autoPlay muted loop playsInline className="hero-video">
        <source src="https://thechaiwalah.in/1.mp4" type="video/mp4" />
      </video>
      <div className="hero-content">
        <h1 className="hero-title">Be A Part Of<br/><span>THE CHAI WALAH</span></h1>
        <p className="hero-subtitle">Premium Indian Tea Experience</p>
        <a href="#contact" className="btn btn-primary">Join The Franchise</a>
      </div>
      <div className="social-sidebar">
        <a href="#"><i className='bx bxl-instagram'></i></a>
        <a href="#"><i className='bx bxl-facebook'></i></a>
        <a href="#"><i className='bx bxl-youtube'></i></a>
        <a href="#"><i className='bx bxl-twitter'></i></a>
      </div>
    </section>
  );
};

export default Hero;
