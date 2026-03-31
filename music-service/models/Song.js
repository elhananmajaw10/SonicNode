const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  genre: String,
  mood: { type: String, default: 'chill' }, // NEW
  playCount: { type: Number, default: 0 },
  file: String,
  cover: String
});

module.exports = mongoose.model('Song', songSchema);