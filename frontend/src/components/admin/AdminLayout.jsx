import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, activeTab, setActiveTab, pendingOrdersCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8', color: '#333' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#111', color: 'white', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 15px rgba(0,0,0,0.3)' }}>
        <h2 style={{ color: '#c9a227', marginBottom: '40px', fontSize: '20px', letterSpacing: '1px', textAlign: 'center', fontFamily: 'Oswald, sans-serif' }}>CHAI WALAH ADMIN</h2>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div 
            onClick={() => setActiveTab('orders')}
            style={{ 
              padding: '12px 15px', 
              backgroundColor: activeTab === 'orders' ? '#c9a227' : 'transparent', 
              color: activeTab === 'orders' ? '#111' : 'white',
              borderRadius: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: activeTab === 'orders' ? '700' : '500',
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease'
            }}
          >
            <i className='bx bx-shopping-bag' style={{ fontSize: '18px' }}></i> Orders
            {pendingOrdersCount > 0 && (
              <span className="tab-badge">{pendingOrdersCount}</span>
            )}
          </div>

          <div 
            onClick={() => setActiveTab('messages')}
            style={{ 
              padding: '12px 15px', 
              backgroundColor: activeTab === 'messages' ? '#c9a227' : 'transparent', 
              color: activeTab === 'messages' ? '#111' : 'white',
              borderRadius: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: activeTab === 'messages' ? '700' : '500',
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease'
            }}
          >
            <i className='bx bx-envelope' style={{ fontSize: '18px' }}></i> Messages
          </div>

          <div 
            style={{ 
              padding: '12px 15px', 
              color: '#555',
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <i className='bx bx-store-alt' style={{ fontSize: '18px' }}></i> Store Inventory
          </div>
        </nav>

        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ width: '100%', padding: '12px', marginTop: 'auto', border: '1px solid #ff4444', color: '#ff4444' }}
        >
          <i className='bx bx-log-out' style={{ marginRight: '5px' }}></i> Logout
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
