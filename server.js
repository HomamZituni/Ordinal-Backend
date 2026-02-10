const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const rewardRoutes = require('./routes/rewardRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/cards/:cardId/transactions', transactionRoutes);
app.use('/api/cards/:cardId/rewards', rewardRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Ordinal API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

