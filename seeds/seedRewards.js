

const dotenv = require('dotenv');
const Reward = require('../models/Reward');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const rewards = [
  // DINING 
  {
    title: '$25 McDonald’s Gift Card',
    description: 'Use at McDonald’s locations.',
    pointsCost: 2500,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 25,
    isActive: true
  },
  {
    title: '$25 Chipotle Gift Card',
    description: 'Use at Chipotle restaurants.',
    pointsCost: 2500,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 25,
    isActive: true
  },
  {
    title: '$25 Starbucks Gift Card',
    description: 'Use at Starbucks locations.',
    pointsCost: 2500,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 25,
    isActive: true
  },
  {
    title: '$100 DoorDash Credit',
    description: 'Food delivery credit (Dining-related fallback).',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: '$50 Restaurant.com Gift Card',
    description: 'Dining experiences at thousands of restaurants.',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '5% Cash Back on Dining',
    description: 'Earn 5% cash back on restaurant and dining purchases.',
    pointsCost: 15000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 150,
    isActive: true
  },

  
  // GROCERIES 
  {
    title: '$50 Kroger Gift Card',
    description: 'Use at Kroger for groceries and household items.',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '$50 Whole Foods Gift Card',
    description: 'Shop for groceries at Whole Foods Market.',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '$100 Walmart Gift Card',
    description: 'Use at Walmart stores or online.',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: '$50 Target Gift Card',
    description: 'Use at Target stores or online.',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '3% Cash Back on Groceries',
    description: 'Earn 3% cash back on grocery store purchases.',
    pointsCost: 10000,
    category: 'Cash Back',
    tier: 'Silver',
    value: 100,
    isActive: true
  },

  
  // GAS 
  {
    title: '$75 Shell Gas Card',
    description: 'Redeem for gas at Shell stations.',
    pointsCost: 7500,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 75,
    isActive: true
  },
  {
    title: '$50 Chevron Gas Card',
    description: 'Redeem for gas at Chevron stations.',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
    title: '4% Cash Back on Gas',
    description: 'Earn 4% cash back on gas station purchases.',
    pointsCost: 12000,
    category: 'Cash Back',
    tier: 'Silver',
    value: 120,
    isActive: true
  },


  // ENTERTAINMENT 
  {
    title: '$50 Netflix Gift Card',
    description: 'Netflix credit.',
    pointsCost: 5000,
    category: 'Gift Cards',
    tier: 'Basic',
    value: 50,
    isActive: true
  },

  
  // SHOPPING 
  {
    title: '$100 Amazon Gift Card',
    description: 'Amazon gift card.',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
  title: '$200 Apple Gift Card',
  description: 'Use for Apple purchases (Apple Store / online).',
  pointsCost: 20000,
  category: 'Gift Cards',
  tier: 'Gold',
  value: 200,
  isActive: true
},
  {
    title: '$100 Best Buy Gift Card',
    description: 'Best Buy gift card.',
    pointsCost: 10000,
    category: 'Gift Cards',
    tier: 'Silver',
    value: 100,
    isActive: true
  },
  {
    title: 'Apple AirPods Pro',
    description: 'Apple AirPods Pro (Merchandise reward).',
    pointsCost: 25000,
    category: 'Merchandise',
    tier: 'Gold',
    value: 249,
    isActive: true
  },

 
  // TRAVEL 
  {
    title: '$50 Lyft Credit',
    description: 'Credit toward Lyft rides.',
    pointsCost: 5000,
    category: 'Travel',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
  title: '$100 Delta Airlines Credit',
  description: 'Credit toward Delta Airlines purchases.',
  pointsCost: 10000,
  category: 'Travel',
  tier: 'Silver',
  value: 100,
  isActive: true
},
  {
    title: '$200 Airbnb Credit',
    description: 'Credit towards your next Airbnb booking.',
    pointsCost: 20000,
    category: 'Travel',
    tier: 'Gold',
    value: 200,
    isActive: true
  },
  {
    title: '3% Travel Bonus',
    description: 'Earn 3% back on travel purchases for 6 months.',
    pointsCost: 25000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 250,
    isActive: true
  },

  
  // BILLS
  {
    title: '$50 Statement Credit',
    description: 'Apply $50 credit to your card statement.',
    pointsCost: 5000,
    category: 'Statement Credit',
    tier: 'Basic',
    value: 50,
    isActive: true
  },
  {
  title: '$100 Verizon Statement Credit',
  description: 'Statement credit for Verizon bill payments.',
  pointsCost: 10000,
  category: 'Statement Credit',
  tier: 'Silver',
  value: 100,
  isActive: true
},
  {
    title: '$250 Cash Back',
    description: 'Receive $250 cash back deposited to your bank account.',
    pointsCost: 25000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 250,
    isActive: true
  },
  {
    title: '2% Unlimited Cash Back',
    description: 'Earn 2% cash back on all purchases for 3 months.',
    pointsCost: 20000,
    category: 'Cash Back',
    tier: 'Gold',
    value: 200,
    isActive: true
  }
];

const seedRewards = async () => {
  try {
    await Reward.deleteMany();
    console.log('Existing rewards deleted');

    await Reward.insertMany(rewards);
    console.log(`${rewards.length} rewards seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding rewards:', error);
    process.exit(1);
  }
};

seedRewards();




