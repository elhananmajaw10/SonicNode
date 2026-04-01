const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const PlayHistory = require('./models/PlayHistory');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://mongodb:27017/sonicnode');

// Register
app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({ username: req.body.username, password: hashedPassword });
  await user.save();
  res.send("User registered");
});

// Login
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.send("User not found");
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.send("Invalid password");
  res.send("Login successful");
});

// Save play history
app.post('/history', async (req, res) => {
  const entry = new PlayHistory(req.body);
  await entry.save();
  res.send("History saved");
});

// Get stats for a user
app.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const history = await PlayHistory.find({ username }).sort({ playedAt: -1 });

  if (history.length === 0) return res.json({ empty: true });

  // Total plays
  const totalPlays = history.length;

  // Most played song + count
  const songCount = {};
  history.forEach(h => {
    songCount[h.title] = (songCount[h.title] || 0) + 1;
  });
  const topSongData = Object.entries(songCount).sort((a, b) => b[1] - a[1])[0];
  const mostPlayed = topSongData[0];
  const mostPlayedCount = topSongData[1];

  // Favourite genre
  const genreCount = {};
  history.forEach(h => {
    genreCount[h.genre] = (genreCount[h.genre] || 0) + 1;
  });
  const favGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0][0];

  // Favourite mood
  const moodCount = {};
  history.forEach(h => {
    if (h.mood) moodCount[h.mood] = (moodCount[h.mood] || 0) + 1;
  });
  const favMood = Object.keys(moodCount).length
    ? Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  // Recent 5
  const recent = history;

  res.json({ totalPlays, mostPlayed, mostPlayedCount, favGenre, favMood, recent });
});

app.listen(3002, () => {
  console.log("User Service running on port 3002");
});