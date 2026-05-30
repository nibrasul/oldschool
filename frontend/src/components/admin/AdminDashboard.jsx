import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getApiBaseUrl } from '../../utils/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // default to orders
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const baseUrl = getApiBaseUrl();

  useEffect(() => {
    fetchData();

    // Auto-refresh orders and messages every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrders();
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchOrders(), fetchMessages()]);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/api/contact/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to fetch messages');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the server for messages');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to fetch orders');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the server for orders');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      } else {
        alert('Failed to update status on server');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel and delete order ${orderId}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
      } else {
        alert('Failed to delete order from server');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    }
  };

  // Stats calculations
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + o.total, 0);

  // Filters logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      pendingOrdersCount={activeOrdersCount}
    >
      {/* Header and Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', letterSpacing: '1px', textTransform: 'uppercase', color: '#111' }}>
          {activeTab === 'orders' ? 'Order Management' : 'Customer Submissions'}
        </h1>
        <button onClick={fetchData} className="btn btn-primary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '4px' }}>
          <i className='bx bx-refresh' style={{ fontSize: '18px' }}></i> Refresh Data
        </button>
      </div>
      
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold' }}>
          <i className='bx bx-error-circle' style={{ marginRight: '5px', verticalAlign: 'middle' }}></i> {error}
        </div>
      )}

      {/* ORDERS VIEW */}
      {activeTab === 'orders' && (
        <>
          {/* KPI summary dashboard cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper blue">
                <i className='bx bx-shopping-bag'></i>
              </div>
              <div className="admin-stat-info">
                <h3>Total Orders</h3>
                <p>{totalOrdersCount}</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper gold">
                <i className='bx bx-time'></i>
              </div>
              <div className="admin-stat-info">
                <h3>Active Orders</h3>
                <p>{activeOrdersCount}</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper green">
                <i className='bx bx-check-circle'></i>
              </div>
              <div className="admin-stat-info">
                <h3>Completed</h3>
                <p>{completedOrdersCount}</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrapper purple">
                <i className='bx bx-rupee'></i>
              </div>
              <div className="admin-stat-info">
                <h3>Revenue</h3>
                <p>₹{totalRevenue}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="admin-search-filter" style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '15px', flex: 1, flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search by ID, Name or Phone..." 
                className="admin-input"
                style={{ minWidth: '250px', flex: 1 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="admin-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table displaying Orders */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginTop: '20px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders data...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No matching orders found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f6f8', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '15px', fontWeight: 'bold' }}>Order ID</th>
                    <th style={{ padding: '15px', fontWeight: 'bold' }}>Customer</th>
                    <th style={{ padding: '15px', fontWeight: 'bold' }}>Type / Info</th>
                    <th style={{ padding: '15px', fontWeight: 'bold' }}>Items</th>
                    <th style={{ padding: '15px', fontWeight: 'bold' }}>Total</th>
                    <th style={{ padding: '15px', fontWeight: 'bold' }}>Status</th>
                    <th style={{ padding: '15px', fontWeight: 'bold', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#c9a227' }}>
                        {order.id}
                        <div style={{ fontSize: '11px', color: '#999', fontWeight: 'normal', marginTop: '4px' }}>
                          {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold' }}>{order.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.phone}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span className={`status-badge ${order.type === 'dine-in' ? 'badge-preparing' : 'badge-pending'}`} style={{ fontSize: '10px', padding: '2px 6px', marginBottom: '5px' }}>
                          {order.type}
                        </span>
                        <div style={{ fontSize: '12px', color: '#333', fontWeight: '500' }}>{order.detail}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <ul className="order-items-list">
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              <strong>{item.quantity}x</strong> {item.name}
                            </li>
                          ))}
                        </ul>
                        {order.notes && (
                          <div style={{ marginTop: '8px', padding: '5px 8px', backgroundColor: '#fcf8e3', borderLeft: '3px solid #f0ad4e', borderRadius: '3px', fontSize: '11px', color: '#66512c' }}>
                            <strong>Note:</strong> {order.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '15px' }}>₹{order.total}</td>
                      <td style={{ padding: '15px' }}>
                        <select 
                          className="admin-select"
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '12px', 
                            borderRadius: '4px',
                            fontWeight: '600',
                            backgroundColor: 
                              order.status === 'Pending' ? '#fff3e0' : 
                              order.status === 'Preparing' ? '#e3f2fd' : 
                              order.status === 'Completed' ? '#e8f5e9' : '#ffebee',
                            color: 
                              order.status === 'Pending' ? '#e65100' : 
                              order.status === 'Preparing' ? '#0d47a1' : 
                              order.status === 'Completed' ? '#1b5e20' : '#c62828',
                          }}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="admin-btn-action delete"
                          title="Delete/Cancel Order"
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* MESSAGES VIEW */}
      {activeTab === 'messages' && (
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
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{msg.name}</td>
                    <td style={{ padding: '15px' }}>{msg.email}</td>
                    <td style={{ padding: '15px' }}>{msg.phone}</td>
                    <td style={{ padding: '15px', maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{msg.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
