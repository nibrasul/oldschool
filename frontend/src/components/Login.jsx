import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // If already logged in, redirect to admin
    if (localStorage.getItem('adminToken')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://oldschool-3.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      try {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          navigate('/admin');
        } else {
          setError(data.message || 'Login failed');
        }
      } catch (jsonErr) {
        console.error('Failed to parse JSON response:', jsonErr);
        setError('Server returned an invalid response (expected JSON). Check if the API URL is correct.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server. Please check your network or backend status.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="contact-info" style={{ width: '100%', maxWidth: '400px', padding: '40px', borderRadius: '8px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#c9a227' }}>ADMIN LOGIN</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                style={{ width: '100%', padding: '15px', marginBottom: '20px' }} 
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ width: '100%', padding: '15px', marginBottom: '20px' }} 
              />
            </div>
            {error && <p style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
