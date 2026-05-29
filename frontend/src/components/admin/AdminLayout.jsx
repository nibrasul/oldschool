import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8', color: '#333' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#111', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#c9a227', marginBottom: '40px', fontSize: '20px' }}>CHAI WALAH ADMIN</h2>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '4px', cursor: 'pointer' }}>
            <i className='bx bx-envelope'></i> Messages
          </div>
          <div style={{ padding: '10px', cursor: 'not-allowed', color: '#aaa' }}>
            <i className='bx bx-store-alt'></i> Store Inventory
          </div>
        </nav>

        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ width: '100%', padding: '10px', marginTop: 'auto' }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
