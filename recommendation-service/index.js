const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

// Connect to same DB (simple approach)
mongoose.connect('mongodb://localhost:27017/music');

// Song schema (same as music-service)
const Song = mongoose.model('Song', {
  title: String,
  artist: String,
  genre: String,
  playCount: Number
});

// Recommendation API
app.get('/recommend/:songId', async (req, res) => {
  try {
    const songId = req.params.songId;

    // 1. Get selected song
    const currentSong = await Song.findById(songId);

    if (!currentSong) {
      return res.status(404).send("Song not found");
    }

    // 2. Find similar songs
    const recommendations = await Song.find({
      genre: currentSong.genre,
      _id: { $ne: songId }
    })
      .sort({ playCount: -1 })
      .limit(5);

    res.json(recommendations);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/recommend/:songId', async (req, res) => {
  try {
    const currentSong = await Song.findById(req.params.songId);
    if (!currentSong) return res.status(404).send("Song not found");

    // Match mood first, fallback to genre if no mood matches
    let recommendations = await Song.find({
      mood: currentSong.mood,
      _id: { $ne: req.params.songId }
    }).sort({ playCount: -1 }).limit(5);

    if (recommendations.length === 0) {
      recommendations = await Song.find({
        genre: currentSong.genre,
        _id: { $ne: req.params.songId }
      }).sort({ playCount: -1 }).limit(5);
    }

    res.json(recommendations);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3004, () => {
  console.log("Recommendation Service running on port 3004");
});