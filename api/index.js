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
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }
};

// Initialize database connection
initDB();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://*.vercel.app'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', require('../src/routes/auth'));

// Default route: serve login.html
app.get('/', (req, res) => {
  const loginPath = path.join(__dirname, '../frontend/login.html');
  res.sendFile(loginPath, (err) => {
    if (err) {
      console.error('Error serving login.html:', err);
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login App</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                .container { max-width: 600px; margin: 0 auto; }
                .status { color: #28a745; }
                .error { color: #dc3545; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Login App Server</h1>
                <p class="status">✅ Server is running successfully!</p>
                <p>Frontend files not found at expected location.</p>
                <p>Please ensure your HTML files are in the <code>frontend/</code> folder.</p>
                <div style="margin-top: 30px;">
                    <a href="/api/health">📊 Check API Health</a>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #666;">
                    Time: ${new Date().toISOString()}
                </div>
            </div>
        </body>
        </html>
      `);
    }
  });
});

// Handle frontend routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/forgot-password.html'));
});

// Catch-all handler for other routes
app.get('*', (req, res) => {
  // For API routes that don't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path 
    });
  }
  
  // For all other routes, serve the main page
  res.sendFile(path.join(__dirname, '../frontend/login.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export the Express API
module.exports = app;