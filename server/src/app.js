const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tweetsRouter = require('./routes/tweets');
const devtoRouter = require('./routes/devto');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - ORDER MATTERS!
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Use express.json() instead of body-parser
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, 'Body:', req.body);
    next();
});

// Routes
app.use('/api/tweets', tweetsRouter);
app.use('/api/devto', devtoRouter);
app.use('/auth', authRouter);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Twitter Post Generator API is running!' });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('GET  /');
    console.log('POST /api/tweets/generate');
    console.log('POST /api/tweets/post');
    console.log('GET  /api/devto/random');
    console.log('GET  /api/devto/generate');
    console.log('GET  /auth/twitter');
    console.log('GET  /auth/twitter/callback');
});