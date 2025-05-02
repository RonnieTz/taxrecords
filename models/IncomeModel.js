const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
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
  user: {
    type: String,
    required: true,
  },
});

module.exports =
  mongoose.models.Income || mongoose.model('Income', IncomeSchema);
