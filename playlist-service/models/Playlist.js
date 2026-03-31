const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: String,
  owner: String,
  collaborators: [String],
  songs: [String]
});

module.exports = mongoose.model('Playlist', playlistSchema);