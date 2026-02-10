const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    cardName: {
      type: String,
      required: [true, 'Please add a card name'],
      trim: true,
      maxlength: [100, 'Card name cannot be more than 100 characters']
    },
    issuer: {
      type: String,
      required: [true, 'Please add card issuer'],
      trim: true,
      maxlength: [50, 'Issuer cannot be more than 50 characters']
    },
    cardType: {
      type: String,
      required: [true, 'Please add card type'],
      enum: ['Visa', 'Mastercard', 'American Express', 'Discover', 'Other']
    },
    rewardsTier: {
      type: String,
      enum: ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'],
      default: 'Basic'
    },
    lastFourDigits: {
      type: String,
      required: [true, 'Please add last four digits'],
      minlength: [4, 'Must be 4 digits'],
      maxlength: [4, 'Must be 4 digits']
    },
    pointsBalance: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Card', cardSchema);

