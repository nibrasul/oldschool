import React, { useState } from 'react';
import { getApiBaseUrl } from '../utils/api';

const MENU_ITEMS = [
  {
    id: 'item-1',
    name: 'Kesar Elaichi Chai',
    category: 'Signature Tea',
    price: 40,
    description: 'Rich milk tea infused with premium Kashmiri saffron and green cardamom.',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4586d56c?w=500&auto=format&fit=crop&q=60',
    tag: 'Popular'
  },
  {
    id: 'item-2',
    name: 'Masala Chai',
    category: 'Premium Chai',
    price: 30,
    description: 'Traditional Indian street chai brewed with ginger, cardamom, cinnamon, and cloves.',
    image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&auto=format&fit=crop&q=60',
    tag: 'Classic'
  },
  {
    id: 'item-3',
    name: 'Ginger Lemongrass Tea',
    category: 'Signature Tea',
    price: 35,
    description: 'Refreshing black tea brewed with fresh ginger root and lemongrass.',
    image: 'https://images.unsplash.com/photo-1563887530665-ac044a887e9d?w=500&auto=format&fit=crop&q=60',
    tag: 'Fresh'
  },
  {
    id: 'item-4',
    name: 'Classic Bun Maska',
    category: 'Quick Bites',
    price: 45,
    description: 'Soft bun loaded with premium fresh butter, best enjoyed dipped in hot chai.',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&auto=format&fit=crop&q=60',
    tag: 'Must Try'
  },
  {
    id: 'item-5',
    name: 'Special Veg Samosa (2 pcs)',
    category: 'Quick Bites',
    price: 50,
    description: 'Crispy golden pastry filled with spiced potato and green peas, served with chutneys.',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60',
    tag: 'Hot Selling'
  },
  {
    id: 'item-6',
    name: 'Chilli Cheese Toast',
    category: 'Quick Bites',
    price: 80,
    description: 'Toasted bread topped with spicy green chillies and melted mozzarella cheese.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60',
    tag: 'Cheesy'
  },
  {
    id: 'item-7',
    name: 'Warm Chocolate Brownie',
    category: 'Desserts',
    price: 120,
    description: 'Rich fudgy chocolate brownie served warm with a drizzle of chocolate sauce.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
    tag: 'Sweet Tooth'
  },
  {
    id: 'item-8',
    name: 'Maska Bun with Jam',
    category: 'Desserts',
    price: 55,
    description: 'Soft bun filled with butter and sweet mixed fruit jam.',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60',
    tag: 'Sweet'
  }
];

const CATEGORIES = ['All', 'Signature Tea', 'Premium Chai', 'Quick Bites', 'Desserts'];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    type: 'dine-in', // 'dine-in' or 'delivery'
    tableNumber: '',
    deliveryAddress: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  // Order Tracking States
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackSearchId, setTrackSearchId] = useState('');
  const [trackError, setTrackError] = useState('');
  const [loadingTrack, setLoadingTrack] = useState(false);

  const fetchTrackedOrder = async (orderId) => {
    if (!orderId) return;
    setLoadingTrack(true);
    setTrackError('');
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/orders/${orderId.trim().toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        setTrackedOrder(data);
        localStorage.setItem('activeOrderId', data.id);
        setTrackSearchId(data.id);
      } else {
        setTrackError('Order not found or has been removed.');
        setTrackedOrder(null);
      }
    } catch (err) {
      console.error(err);
      setTrackError('Cannot connect to server to fetch status.');
    } finally {
      setLoadingTrack(false);
    }
  };

  const handleCancelTrackedOrder = async () => {
    if (!trackedOrder) return;
    if (!window.confirm(`Are you sure you want to cancel your order ${trackedOrder.id}?`)) {
      return;
    }
    
    setLoadingTrack(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/orders/${trackedOrder.id}/cancel`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setTrackedOrder(data.order);
        alert('Your order has been successfully cancelled.');
      } else {
        alert(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server to cancel order.');
    } finally {
      setLoadingTrack(false);
    }
  };

  React.useEffect(() => {
    const savedId = localStorage.getItem('activeOrderId');
    if (savedId) {
      fetchTrackedOrder(savedId);
      setTrackSearchId(savedId);
    }
  }, []);

  React.useEffect(() => {
    if (!trackedOrder) return;
    
    // Stop polling if the order reaches a terminal state (Completed or Cancelled)
    if (trackedOrder.status === 'Completed' || trackedOrder.status === 'Cancelled') {
      return;
    }

    // Polling interval for silent updates (no flashes or spinners)
    const interval = setInterval(async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/orders/${trackedOrder.id}`);
        if (response.ok) {
          const data = await response.json();
          setTrackedOrder(data);
        }
      } catch (err) {
        console.error('Silent status refresh failed:', err);
      }
    }, 5000); // poll every 5 seconds

    return () => clearInterval(interval);
  }, [trackedOrder?.id, trackedOrder?.status]);

  const filteredItems = activeCategory === 'All'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart(prevCart => {
      return prevCart.map(cartItem => {
        if (cartItem.id === itemId) {
          const newQty = cartItem.quantity + change;
          return newQty > 0 ? { ...cartItem, quantity: newQty } : null;
        }
        return cartItem;
      }).filter(Boolean);
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setCheckoutForm(prev => ({ ...prev, type }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const detail = checkoutForm.type === 'dine-in' 
      ? `Table: ${checkoutForm.tableNumber}` 
      : checkoutForm.deliveryAddress;

    const payload = {
      name: checkoutForm.name,
      phone: checkoutForm.phone,
      type: checkoutForm.type,
      detail,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: totalPrice,
      notes: checkoutForm.notes
    };

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setOrderResult({ success: true, orderId: data.orderId });
        setCart([]); // Clear cart
        localStorage.setItem('activeOrderId', data.orderId);
        setTrackSearchId(data.orderId);
        fetchTrackedOrder(data.orderId);
      } else {
        setOrderResult({ success: false, error: 'Failed to place order. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      setOrderResult({ success: false, error: 'Cannot connect to server. Please check connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setOrderResult(null);
    setIsCheckoutOpen(false);
    setCheckoutForm({
      name: '',
      phone: '',
      type: 'dine-in',
      tableNumber: '',
      deliveryAddress: '',
      notes: ''
    });
  };

  return (
    <section id="menu" className="section section-dark">
      <div className="container">
        <div className="section-title">
          <h2>Our Delicious Menu</h2>
          <div className="divider"></div>
        </div>

        {/* Live Order Tracker Section */}
        <div style={{ marginBottom: '50px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '30px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="bx bx-receipt"></i> Track & Cancel Your Order
          </h3>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' }}>
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. ORD-1234)" 
              value={trackSearchId}
              onChange={(e) => setTrackSearchId(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 20px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={() => fetchTrackedOrder(trackSearchId)}
              style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
              disabled={loadingTrack}
            >
              <i className="bx bx-search"></i> {loadingTrack ? 'Tracking...' : 'Track'}
            </button>
            
            {trackedOrder && (
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setTrackedOrder(null);
                  setTrackSearchId('');
                  localStorage.removeItem('activeOrderId');
                }}
                style={{ padding: '12px 20px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa' }}
              >
                Clear
              </button>
            )}
          </div>

          {trackError && (
            <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '15px', fontWeight: 'bold' }}>
              <i className="bx bx-error-circle"></i> {trackError}
            </p>
          )}

          {/* If an order is tracked successfully, show details and step bar */}
          {trackedOrder && (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '8px', border: '1px dashed rgba(201, 162, 39, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', margin: 0 }}>Order ID: <span style={{ color: 'var(--primary-color)' }}>{trackedOrder.id}</span></h4>
                  <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Placed: {new Date(trackedOrder.date).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => fetchTrackedOrder(trackedOrder.id)}
                    className="btn btn-outline"
                    style={{ padding: '8px 12px', fontSize: '11px', border: '1px solid rgba(201,162,39,0.3)', color: 'var(--primary-color)' }}
                  >
                    <i className="bx bx-refresh"></i> Refresh Status
                  </button>
                  {trackedOrder.status === 'Pending' && (
                    <button 
                      onClick={handleCancelTrackedOrder}
                      className="btn btn-primary"
                      style={{ padding: '8px 15px', fontSize: '11px', backgroundColor: '#ff4444', color: 'white', borderColor: '#ff4444' }}
                    >
                      <i className="bx bx-trash"></i> Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Steps UI */}
              <div className="order-steps-container">
                <div className="order-steps-line">
                  <div 
                    className="order-steps-progress" 
                    style={{ 
                      width: 
                        trackedOrder.status === 'Cancelled' ? '0%' :
                        trackedOrder.status === 'Pending' ? '0%' : 
                        trackedOrder.status === 'Preparing' ? '50%' : '100%' 
                    }}
                  ></div>
                </div>

                <div className="order-step-node active">
                  <div className="step-dot"><i className="bx bx-check"></i></div>
                  <span className="step-label">Placed</span>
                  <span className="step-sublabel">Pending Approval</span>
                </div>

                <div className={`order-step-node ${(trackedOrder.status === 'Preparing' || trackedOrder.status === 'Completed') && trackedOrder.status !== 'Cancelled' ? 'active' : ''}`}>
                  <div className="step-dot"><i className="bx bx-coffee"></i></div>
                  <span className="step-label">Preparing</span>
                  <span className="step-sublabel">Brewing Your Chai</span>
                </div>

                <div className={`order-step-node ${trackedOrder.status === 'Completed' && trackedOrder.status !== 'Cancelled' ? 'active' : ''}`}>
                  <div className="step-dot"><i className="bx bx-check-double"></i></div>
                  <span className="step-label">Complete</span>
                  <span className="step-sublabel">Ready for Pickup</span>
                </div>
              </div>

              {/* Cancelled Warning Notice */}
              {trackedOrder.status === 'Cancelled' && (
                <div style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '15px', borderRadius: '6px', textAlign: 'center', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <i className="bx bx-x-circle" style={{ fontSize: '20px' }}></i>
                  <strong>This order has been CANCELLED.</strong>
                </div>
              )}

              {trackedOrder.status !== 'Pending' && trackedOrder.status !== 'Cancelled' && (
                <p style={{ color: '#aaa', fontSize: '11px', textAlign: 'center', marginTop: '25px' }}>
                  <i className="bx bx-info-circle"></i> This order is in <strong>{trackedOrder.status}</strong> stage and can no longer be self-cancelled.
                </p>
              )}

              {/* Expanded details of order items */}
              <div style={{ marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', color: '#aaa', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Order Details</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '15px', fontSize: '13px', color: '#ccc' }}>
                  <p><strong>Customer:</strong> {trackedOrder.name} ({trackedOrder.phone})</p>
                  <p><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{trackedOrder.type}</span> ({trackedOrder.detail})</p>
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#ddd' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', color: 'var(--primary-color)' }}>
                    <span>Total Amount</span>
                    <span>₹{trackedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="menu-categories">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`menu-category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu items grid */}
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="menu-card">
              <div className="menu-card-img-wrapper">
                <img src={item.image} alt={item.name} className="menu-card-img" />
                {item.tag && <span className="menu-card-tag">{item.tag}</span>}
              </div>
              <div className="menu-card-content">
                <div>
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-desc">{item.description}</p>
                </div>
                <div className="menu-card-footer">
                  <span className="menu-card-price">₹{item.price}</span>
                  <button className="menu-card-btn" onClick={() => addToCart(item)}>
                    <i className="bx bx-plus"></i> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating cart button */}
      {totalItems > 0 && (
        <div className="cart-float-btn" onClick={() => setIsCartOpen(true)}>
          <i className="bx bx-shopping-bag"></i>
          <span className="cart-badge">{totalItems}</span>
        </div>
      )}

      {/* Slide-in cart drawer overlay */}
      <div 
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-in cart drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Your Order</h3>
          <span className="cart-drawer-close" onClick={() => setIsCartOpen(false)}>
            <i className="bx bx-x"></i>
          </span>
        </div>

        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
              <i className="bx bx-shopping-bag" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-drawer-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price} x {item.quantity}</p>
                </div>
                <div className="cart-item-controls">
                  <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '15px' }}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              Proceed to Order
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal Overlay */}
      <div className={`modal-overlay ${isCheckoutOpen ? 'open' : ''}`}>
        <div className="checkout-modal">
          <div className="modal-header">
            <h3>{orderResult ? 'Order Confirmed' : 'Complete Your Order'}</h3>
            {!orderResult && (
              <span className="modal-close" onClick={() => setIsCheckoutOpen(false)}>
                <i className="bx bx-x"></i>
              </span>
            )}
          </div>
          
          <div className="modal-body">
            {orderResult ? (
              orderResult.success ? (
                <div className="order-success-container">
                  <div className="success-icon-wrapper">
                    <i className="bx bx-check"></i>
                  </div>
                  <h3>Thank you for your order!</h3>
                  <p style={{ color: '#aaa', marginTop: '10px' }}>Your delicious drinks and bites are being prepared.</p>
                  <div className="success-order-id">
                    ORDER ID: {orderResult.orderId}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCloseSuccessModal}>
                    Okay, Great!
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <i className="bx bx-error" style={{ fontSize: '4rem', color: '#ff4444', marginBottom: '20px' }}></i>
                  <h3>Order Placement Failed</h3>
                  <p style={{ color: '#aaa', margin: '15px 0' }}>{orderResult.error}</p>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setOrderResult(null)}>
                    Try Again
                  </button>
                </div>
              )
            ) : (
              <form onSubmit={handlePlaceOrder}>
                <div className="order-type-toggle">
                  <button 
                    type="button" 
                    className={`toggle-btn ${checkoutForm.type === 'dine-in' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('dine-in')}
                  >
                    <i className="bx bx-restaurant"></i> Dine In
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-btn ${checkoutForm.type === 'delivery' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('delivery')}
                  >
                    <i className="bx bx-cycling"></i> Takeaway / Delivery
                  </button>
                </div>

                <div className="form-group">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Your Name" 
                    value={checkoutForm.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Phone Number" 
                    value={checkoutForm.phone} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                {checkoutForm.type === 'dine-in' ? (
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="tableNumber" 
                      placeholder="Table Number (e.g. Table 5)" 
                      value={checkoutForm.tableNumber} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="deliveryAddress" 
                      placeholder="Delivery Address / Suite" 
                      value={checkoutForm.deliveryAddress} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                )}

                <div className="form-group">
                  <textarea 
                    name="notes" 
                    placeholder="Special Instructions (e.g., Sugar-free, extra spicy)" 
                    value={checkoutForm.notes} 
                    onChange={handleInputChange} 
                    rows="3"
                  ></textarea>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '20px' }}>
                  <div className="cart-subtotal" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                    <span>Total Amount</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '15px' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing Order...' : 'Place Order Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
