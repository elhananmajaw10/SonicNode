const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const Song = require('./models/Song');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static('uploads/images'));
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://100.48.75.157:27017/music');

let currentSongOfTheDay = null;

// Cron Job: Calculates Global Song of the Day every minute (for demo)
cron.schedule('* * * * *', async () => {
  console.log("⚙️ [CRON JOB] Calculating new Song of the Day...");
  try {
    const topSong = await Song.findOne().sort({ playCount: -1 });
    if (topSong) {
      currentSongOfTheDay = topSong;
      console.log(`🏆 [CRON JOB] New Song of the Day updated: ${topSong.title} (${topSong.playCount} plays)`);
    }
  } catch (err) {
    console.error("Cron job error:", err);
  }
});

setTimeout(async () => {
  currentSongOfTheDay = await Song.findOne().sort({ playCount: -1 });
}, 2000);

app.listen(3001, () => {
  console.log("Music Service running on port 3001");
});

app.get('/song-of-the-day', (req, res) => {
  res.json(currentSongOfTheDay);
});

app.post('/songs', async (req, res) => {
  const song = new Song(req.body);
  await song.save();
  res.json(song);
});

app.post('/play/:id', async (req, res) => {
  await Song.findByIdAndUpdate(req.params.id, {
    $inc: { playCount: 1 }
  });
  res.send("Play count updated");
});

app.get('/songs', async (req, res) => {
  const songs = await Song.find();
  res.json(songs);
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  const songs = await Song.find({
    title: { $regex: query, $options: 'i' }
  });
  res.json(songs);
});

app.get('/mood/:mood', async (req, res) => {
  const songs = await Song.find({ mood: req.params.mood }).sort({ playCount: -1 });
  res.json(songs);
});

app.delete('/songs', async (req, res) => {
  await Song.deleteMany({});
  res.send("All songs deleted");
});