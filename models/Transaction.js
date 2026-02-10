const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add transaction amount'],
      min: [0, 'Amount cannot be negative']
    },
    merchant: {
      type: String,
      required: [true, 'Please add merchant name'],
      trim: true,
      maxlength: [100, 'Merchant name cannot be more than 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Please add category'],
      enum: ['Dining', 'Travel', 'Groceries', 'Gas', 'Entertainment', 'Shopping', 'Bills', 'Other']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
