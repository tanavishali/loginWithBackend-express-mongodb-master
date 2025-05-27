const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  // If connecting, wait for it
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log('Database already connected');
    return;
  }

  try {
    // Set mongoose options for newer versions
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB - using MONGO_URI to match your current setup
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections  
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    isConnected = conn.connection.readyState === 1;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Database connection error:', err.message);
    isConnected = false;
    // In serverless, don't exit the process
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw err;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
  isConnected = false;
});

module.exports = connectDB;