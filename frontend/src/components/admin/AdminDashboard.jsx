import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/contact/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          setMessages(data);
        } catch (jsonErr) {
          console.error('Failed to parse JSON response:', jsonErr);
          setError('Server returned an invalid response (expected JSON). Check if the API URL is correct.');
        }
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to fetch messages');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontFamily: 'sans-serif' }}>Contact Submissions</h1>
        <button onClick={fetchMessages} className="btn btn-primary" style={{ padding: '8px 15px' }}>
          <i className='bx bx-refresh'></i> Refresh
        </button>
      </div>
      
      {error && <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No messages found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f6f8', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '15px', fontWeight: 'bold' }}>Name</th>
                <th style={{ padding: '15px', fontWeight: 'bold' }}>Email</th>
                <th style={{ padding: '15px', fontWeight: 'bold' }}>Phone</th>
                <th style={{ padding: '15px', fontWeight: 'bold' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{msg.name}</td>
                  <td style={{ padding: '15px' }}>{msg.email}</td>
                  <td style={{ padding: '15px' }}>{msg.phone}</td>
                  <td style={{ padding: '15px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
