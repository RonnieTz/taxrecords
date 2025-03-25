const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    ref: 'Year',
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  taxDeductions: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports =
  mongoose.models.Income || mongoose.model('Income', IncomeSchema);
