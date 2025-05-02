const mongoose = require('mongoose');

const YearSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: String,
    required: true,
  },
});

YearSchema.index({ year: 1, user: 1 }, { unique: true });

module.exports = mongoose.models.Year || mongoose.model('Year', YearSchema);
