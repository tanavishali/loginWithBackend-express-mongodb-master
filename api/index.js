const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../src/config/db');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Database connection for serverless
let isConnected = false;
const initDB = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('Database connected');
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }
};

// Initialize DB
initDB();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Default route: serve login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// API routes
app.use('/api/auth', require('../src/routes/auth'));

// Handle frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

module.exports = app;