import express from 'express';
import cors from 'cors';
import db, { dbRun, dbAll, dbGet } from './db.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Allows all origins by default
app.use(express.json());

// --- API ROUTES ---

// 1. Submit Contact Form (Public Route)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        console.log(`Received contact request from: ${name}`);
        
        await dbRun(
            'INSERT INTO messages (name, email, phone, message, date) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, message, new Date().toISOString()]
        );
        
        res.json({ status: 'success', message: "Thanks for contacting us! We'll get back to you soon." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database transaction failed' });
    }
});

// 2. Admin Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Hardcoded credentials for initial setup
    if (email === 'admin@thechaiwalah.in' && password === 'admin123') {
        const fakeToken = "admin-secret-token-12345";
        res.json({ success: true, message: 'Login successful', token: fakeToken });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// 3. Get Contact Messages (Admin Protected Route)
app.get('/api/contact/messages', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    // Simple mock authentication check
    if (!authHeader || !authHeader.includes('admin-secret-token-12345')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const messagesList = await dbAll('SELECT * FROM messages ORDER BY id DESC');
        res.json(messagesList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

// 4. Place a new order (Public Route)
app.post('/api/orders', async (req, res) => {
    try {
        const { name, phone, type, detail, items, total, notes } = req.body;
        
        if (!name || !phone || !type || !items || !items.length) {
            return res.status(400).json({ success: false, message: 'Missing required order details' });
        }
        
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        
        await dbRun(
            'INSERT INTO orders (id, name, phone, type, detail, items, total, notes, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [orderId, name, phone, type, detail, JSON.stringify(items), total, notes || '', 'Pending', new Date().toISOString()]
        );
        
        console.log(`Placed new order: ${orderId} by ${name}`);
        res.json({ success: true, orderId, message: 'Order placed successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database transaction failed' });
    }
});

// 5. Get orders (Admin Protected Route)
app.get('/api/orders', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.includes('admin-secret-token-12345')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const ordersList = await dbAll('SELECT * FROM orders ORDER BY date DESC');
        const parsedOrders = ordersList.map(o => ({ 
            ...o, 
            items: JSON.parse(o.items) 
        }));
        res.json(parsedOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});

// 6. Update order status (Admin Protected Route)
app.put('/api/orders/:id/status', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.includes('admin-secret-token-12345')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        const order = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
        console.log(`Updated order ${id} status to: ${status}`);
        res.json({ success: true, order: { ...order, items: JSON.parse(order.items) } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
});

// 7. Delete/Cancel order (Admin Protected Route)
app.delete('/api/orders/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.includes('admin-secret-token-12345')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { id } = req.params;
        const result = await dbRun('DELETE FROM orders WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        console.log(`Deleted order: ${id}`);
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
});

// 8. Get single order details (Public Route for Tracking)
app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({
            success: true,
            id: order.id,
            name: order.name,
            type: order.type,
            detail: order.detail,
            items: JSON.parse(order.items),
            total: order.total,
            status: order.status,
            date: order.date,
            notes: order.notes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to retrieve order status' });
    }
});

// 9. Cancel order by customer (Public, only permitted if status is 'Pending')
app.post('/api/orders/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (order.status !== 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot cancel order ${id} once it is already in preparation or completed. Current status: ${order.status}` 
            });
        }
        
        await dbRun("UPDATE orders SET status = 'Cancelled' WHERE id = ?", [id]);
        const updatedOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
        
        console.log(`Order ${id} cancelled by customer`);
        res.json({ success: true, message: 'Order cancelled successfully', order: { ...updatedOrder, items: JSON.parse(updatedOrder.items) } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to cancel order' });
    }
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Node.js server is running on http://localhost:${PORT}`);
    });
}

export default app;

// Trigger database reload with updated credentials

