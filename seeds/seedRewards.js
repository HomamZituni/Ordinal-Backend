const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reward = require('../models/Rewards');
const connectDB = require('../config/db');


dotenv.config();
connectDB();


const rewards = [
  // DINING & RESTAURANTS (4 rewards)
  {
    title: '5% Cash Back on Dining',
    description: 'Earn 5% cash back on all restaurant and dining purchases',
    pointsCost: 15000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 150,
    isActive: true
  },
  {
    title: '$50 Restaurant.com Gift Card',
    description: 'Redeem for dining experiences at thousands of restaurants',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '$100 DoorDash Credit',
    description: 'Order food delivery from your favorite restaurants',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: 'Gourmet Dinner Experience',
    description: 'Fine dining experience for two at select restaurants',
    pointsCost: 20000,
    category: 'Experiences',
    tier: 'Gold',
    value: 200,
    isActive: true
  },

  // TRAVEL (4 rewards)
  {
    title: 'Round-Trip Domestic Flight',
    description: 'Redeem for a domestic round-trip flight (up to $350 value)',
    pointsCost: 35000,
    category: 'Travel',
    tier: 'Gold',
    value: 350,
    isActive: true
  },
  {
    title: 'Hotel Stay (2 Nights)',
    description: '2-night hotel stay at select properties (up to $500 value)',
    pointsCost: 50000,
    category: 'Travel',
    tier: 'Platinum',
    value: 500,
    isActive: true
  },
  {
    title: '$200 Airbnb Credit',
    description: 'Credit towards your next Airbnb booking',
    pointsCost: 20000,
    category: 'Travel',
    tier: 'Gold',
    value: 200,
    isActive: true
  },
  {
    title: '3% Travel Bonus',
    description: 'Earn 3% back on all travel purchases for 6 months',
    pointsCost: 25000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 250,
    isActive: true
  },

  // GAS & AUTOMOTIVE (3 rewards)
  {
    title: '4% Cash Back on Gas',
    description: 'Earn 4% cash back on all gas station purchases',
    pointsCost: 12000,
    category: 'Cash Back',
    tier: 'Silver',
    value: 120,
    isActive: true
  },
  {
    title: '$75 Shell Gas Card',
    description: 'Redeem for gas at Shell stations nationwide',
    pointsCost: 7500,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 75,
    isActive: true
  },
  {
    title: 'Free Car Wash Package',
    description: '10 premium car washes at participating locations',
    pointsCost: 5000,
    category: 'Experiences',
    tier: 'Basic',
    value: 50,
    isActive: true
  },

  // GROCERIES (3 rewards)
  {
    title: '3% Cash Back on Groceries',
    description: 'Earn 3% cash back on all grocery store purchases',
    pointsCost: 10000,
    category: 'Cash Back',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: '$50 Whole Foods Gift Card',
    description: 'Shop for groceries at Whole Foods Market',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '$100 Walmart Gift Card',
    description: 'Use at Walmart stores or online for groceries and more',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },

  // SHOPPING & ENTERTAINMENT (3 rewards)
  {
    title: '$100 Amazon Gift Card',
    description: 'Redeem your points for a $100 Amazon gift card',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: 'Apple AirPods Pro',
    description: 'Latest generation Apple AirPods Pro',
    pointsCost: 25000,
    category: 'Merchandise',
    tier: 'Gold',
    value: 249,
    isActive: true
  },
  {
    title: '$50 Netflix Gift Card',
    description: 'Enjoy streaming entertainment with Netflix credit',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },

  // GENERAL CASH BACK & STATEMENT CREDIT (3 rewards)
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
    title: '$250 Cash Back',
    description: 'Receive $250 cash back deposited to your bank account',
    pointsCost: 25000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 250,
    isActive: true
  },
  {
    title: '2% Unlimited Cash Back',
    description: 'Earn 2% cash back on all purchases for 3 months',
    pointsCost: 20000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 200,
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
    console.log(`${rewards.length} rewards seeded successfully`);


    process.exit(0);
  } catch (error) {
    console.error('Error seeding rewards:', error);
    process.exit(1);
  }
};


seedRewards();


