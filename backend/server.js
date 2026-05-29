import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Allows all origins by default
app.use(express.json());

// In-memory storage (resets when server restarts)
const messages = [];

// --- API ROUTES ---

// 1. Submit Contact Form
app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    
    console.log(`Received contact request from: ${name}`);
    
    // Store message
    messages.push({ name, email, phone, message, date: new Date().toISOString() });
    
    res.json({ status: 'success', message: "Thanks for contacting us! We'll get back to you soon." });
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
app.get('/api/contact/messages', (req, res) => {
    const authHeader = req.headers.authorization;
    
    // Simple mock authentication check
    if (!authHeader || !authHeader.includes('admin-secret-token-12345')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.json(messages);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Node.js server is running on http://localhost:${PORT}`);
});
