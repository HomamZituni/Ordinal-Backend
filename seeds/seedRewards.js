const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reward = require('../models/Reward');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const rewards = [
  {
    title: '$25 Amazon Gift Card',
    description: 'Redeem your points for a $25 Amazon gift card',
    pointsCost: 2500,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 25,
    imageUrl: 'https://example.com/amazon-gift-card.jpg',
    isActive: true
  },
  {
    title: '$50 Statement Credit',
    description: 'Apply $50 credit to your card statement',
    pointsCost: 5000,
    category: 'Statement Credit',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: 'Round-Trip Domestic Flight',
    description: 'Redeem for a domestic round-trip flight (up to $350 value)',
    pointsCost: 35000,
    category: 'Travel',
    tier: 'Silver',
    value: 350,
    imageUrl: 'https://example.com/flight.jpg',
    isActive: true
  },
  {
    title: '$100 Visa Gift Card',
    description: 'Redeem for a $100 Visa prepaid gift card',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: 'Hotel Stay (2 Nights)',
    description: '2-night hotel stay at select properties (up to $500 value)',
    pointsCost: 50000,
    category: 'Travel',
    tier: 'Gold',
    value: 500,
    imageUrl: 'https://example.com/hotel.jpg',
    isActive: true
  },
  {
    title: '$250 Cash Back',
    description: 'Receive $250 cash back deposited to your bank account',
    pointsCost: 25000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 250,
    isActive: true
  },
  {
    title: 'International Business Class Flight',
    description: 'One-way international business class flight (up to $2000 value)',
    pointsCost: 150000,
    category: 'Travel',
    tier: 'Platinum',
    value: 2000,
    imageUrl: 'https://example.com/business-class.jpg',
    isActive: true
  },
  {
    title: 'VIP Concert Experience',
    description: 'VIP tickets and meet & greet at select concerts',
    pointsCost: 75000,
    category: 'Experiences',
    tier: 'Platinum',
    value: 1000,
    imageUrl: 'https://example.com/concert.jpg',
    isActive: true
  },
  {
    title: 'Luxury Resort Week',
    description: '7-night stay at luxury resort (up to $5000 value)',
    pointsCost: 300000,
    category: 'Travel',
    tier: 'Premium',
    value: 5000,
    imageUrl: 'https://example.com/luxury-resort.jpg',
    isActive: true
  },
  {
    title: '$1000 Statement Credit',
    description: 'Apply $1000 credit to your card statement',
    pointsCost: 100000,
    category: 'Statement Credit',
    tier: 'Premium',
    value: 1000,
    isActive: true
  },
  {
    title: '$10 Starbucks Gift Card',
    description: 'Redeem for a $10 Starbucks gift card',
    pointsCost: 1000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 10,
    imageUrl: 'https://example.com/starbucks.jpg',
    isActive: true
  },
  {
    title: 'Apple AirPods Pro',
    description: 'Latest generation Apple AirPods Pro',
    pointsCost: 25000,
    category: 'Merchandise',
    tier: 'Gold',
    value: 249,
    imageUrl: 'https://example.com/airpods.jpg',
    isActive: true
  }
];

const seedRewards = async () => {
  try {
    // Clear existing rewards
    await Reward.deleteMany();
    console.log('Existing rewards deleted');

    // Insert new rewards
    await Reward.insertMany(rewards);
    console.log('Rewards seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding rewards:', error);
    process.exit(1);
  }
};

seedRewards();
