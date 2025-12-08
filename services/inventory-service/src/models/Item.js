const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  expiryDate: {
    type: Date
  },
  location: {
    type: String,
    enum: ['Pantry', 'Fridge', 'Freezer', 'Other'],
    default: 'Pantry'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);

