const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
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
  user: {
    type: String,
    required: true,
  },
});

module.exports =
  mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
