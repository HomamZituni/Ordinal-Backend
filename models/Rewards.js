const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add reward title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add reward description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    pointsCost: {
      type: Number,
      required: [true, 'Please add points cost'],
      min: [0, 'Points cost cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Please add category'],
      enum: ['Travel', 'Cash Back', 'Gift Cards', 'Merchandise', 'Experiences', 'Statement Credit']
    },
    tier: {
      type: String,
      enum: ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'],
      default: 'Basic'
    },
    value: {
      type: Number,
      required: [true, 'Please add reward value'],
      min: [0, 'Value cannot be negative']
    },
    imageUrl: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reward', rewardSchema);
