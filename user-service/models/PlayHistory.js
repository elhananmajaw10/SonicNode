const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
  username: String,
  songId: String,
  title: String,
  artist: String,
  genre: String,
  mood: String,
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlayHistory', playHistorySchema);