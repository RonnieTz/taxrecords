const mongoose = require('mongoose');

const YearSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Year || mongoose.model('Year', YearSchema);
