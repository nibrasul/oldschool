import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Active link logic (only if on home page)
      if (location.pathname === '/') {
        const sections = ['home', 'about', 'franchise', 'contact'];
        let current = 'home';
        sections.forEach(sectionId => {
          const section = document.getElementById(sectionId);
          if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
              current = sectionId;
            }
          }
        });
        setActive(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({ top: element.offsetTop - 70, behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav id="navbar" className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#home" className="logo" onClick={(e) => scrollTo(e, 'home')}>
          <h2>THE CHAI WALAH</h2>
        </a>
        <div className="nav-links">
          <a href="#home" className={active === 'home' && location.pathname === '/' ? 'active' : ''} onClick={(e) => scrollTo(e, 'home')}>Home</a>
          <a href="#about" className={active === 'about' && location.pathname === '/' ? 'active' : ''} onClick={(e) => scrollTo(e, 'about')}>About</a>
          <Link to="/store" className={location.pathname === '/store' ? 'active' : ''}>Store</Link>
          <a href="#franchise" className={active === 'franchise' && location.pathname === '/' ? 'active' : ''} onClick={(e) => scrollTo(e, 'franchise')}>Franchise</a>
          <a href="#csr" onClick={(e) => e.preventDefault()}>CSR</a>
          <a href="#contact" className={active === 'contact' && location.pathname === '/' ? 'active' : ''} onClick={(e) => scrollTo(e, 'contact')}>Contact</a>
          <Link to="/login" className="login-btn"><i className='bx bx-log-in'></i> Login</Link>
        </div>
        <div className="menu-toggle" id="mobile-menu">
          <i className='bx bx-menu'></i>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
