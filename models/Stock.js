const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  likes: { type: Number, default: 0 },
  ipAddresses: { type: [String], default: [] },
});

module.exports = mongoose.model('Stock', stockSchema);
