require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORRECT merchant-category mappings
const merchantsData = [
  { name: 'Whole Foods', category: 'Groceries' },
  { name: 'Kroger', category: 'Groceries' },
  { name: 'Walmart', category: 'Groceries' },
  { name: 'Target', category: 'Groceries' },
  { name: 'Chipotle', category: 'Dining' },
  { name: 'Starbucks', category: 'Dining' },
  { name: 'McDonald\'s', category: 'Dining' },
  { name: 'Shell Gas', category: 'Gas' },
  { name: 'BP', category: 'Gas' },
  { name: 'Chevron', category: 'Gas' },
  { name: 'Amazon', category: 'Shopping' },
  { name: 'Best Buy', category: 'Shopping' },
  { name: 'Apple Store', category: 'Shopping' },
  { name: 'Netflix', category: 'Entertainment' },
  { name: 'Spotify', category: 'Entertainment' },
  { name: 'Delta Airlines', category: 'Travel' },
  { name: 'Uber', category: 'Travel' },
  { name: 'Lyft', category: 'Travel' },
  { name: 'AT&T', category: 'Bills' },
  { name: 'Verizon', category: 'Bills' }
];

const seedTransactions = async () => {
  try {
    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log('Cleared existing transactions');

    // Get all users
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // For each user, get their cards and create transactions
    for (const user of users) {
      const cards = await Card.find({ user: user._id });
      
      for (const card of cards) {
        const numTransactions = Math.floor(Math.random() * 10) + 10; // 10-20 transactions per card
        const transactions = [];

        for (let i = 0; i < numTransactions; i++) {
          // Pick random merchant
          const merchant = merchantsData[Math.floor(Math.random() * merchantsData.length)];
          
          // Generate random date in last 60 days
          const daysAgo = Math.floor(Math.random() * 60);
          const transactionDate = new Date();
          transactionDate.setDate(transactionDate.getDate() - daysAgo);

          transactions.push({
            user: user._id,
            card: card._id,
            merchant: merchant.name,
            category: merchant.category,
            amount: Math.floor(Math.random() * 40000) / 100,
            date: transactionDate,
            description: `Purchase at ${merchant.name}`
          });
        }

        await Transaction.insertMany(transactions);
        console.log(`Created ${transactions.length} transactions for card: ${card.name}`);
      }
    }

    console.log('Transaction seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding transactions:', error);
    process.exit(1);
  }
};

seedTransactions();


