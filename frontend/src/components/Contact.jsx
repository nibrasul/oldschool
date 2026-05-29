import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          setStatus(data.message);
          setFormData({ name: '', email: '', phone: '', message: '' }); // clear form
        } catch (jsonErr) {
          console.error('Failed to parse JSON response:', jsonErr);
          setStatus('Server returned an invalid response (expected JSON, received HTML). Check if the API URL is correct.');
        }
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('Unable to connect to the server. Please check your internet connection or backend status.');
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="section-title">
          <h2>Contact Us</h2>
          <div className="divider"></div>
        </div>
        <div className="contact-grid">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone Number" required />
            </div>
            <div className="form-group">
              <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" rows="5" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
            {status && <p style={{ marginTop: '15px', color: '#c9a227' }}>{status}</p>}
          </form>
          <div className="contact-info">
            <div className="info-item">
              <i className='bx bx-map'></i>
              <p>123 Tea Street, Bangalore, India</p>
            </div>
            <div className="info-item">
              <i className='bx bx-envelope'></i>
              <p>info@thechaiwalah.in</p>
            </div>
            <div className="info-item">
              <i className='bx bx-phone'></i>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
