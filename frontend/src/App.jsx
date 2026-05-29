import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Franchise from './components/Franchise';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';

const Home = () => (
  <>
    <Navbar />
    <Hero />
    <About />
    <Franchise />
    <Contact />
    <Footer />
  </>
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {/* Preloader */}
      {loading && (
        <div id="preloader" style={{ opacity: loading ? 1 : 0 }}>
          <div className="loader">
            <i className='bx bx-loader-alt bx-spin'></i>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* WhatsApp Floating Button */}
      <a href="#" className="whatsapp-float">
          <i className='bx bxl-whatsapp'></i>
      </a>
    </Router>
  );
}

export default App;
