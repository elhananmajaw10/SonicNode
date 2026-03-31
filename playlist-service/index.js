const express = require('express');
const mongoose = require('mongoose');
const Playlist = require('./models/Playlist');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/music');

// Create playlist
app.post('/playlist', async (req, res) => {
  const playlist = new Playlist({
    name: req.body.name,
    owner: req.body.owner,
    collaborators: [],
    songs: []
  });
  await playlist.save();
  res.json(playlist);
});

// Add song to playlist
app.post('/playlist/:id/add', async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  const { username, songId } = req.body;

  // Only owner or collaborator can add
  const canAdd = playlist.owner === username ||
                 playlist.collaborators.includes(username);

  if (!canAdd) return res.status(403).send("Not authorized");

  await Playlist.findByIdAndUpdate(req.params.id, {
    $push: { songs: songId }
  });

  res.send("Song added");
});

// Invite collaborator
app.post('/playlist/:id/invite', async (req, res) => {
  const { username, collaborator } = req.body;
  const playlist = await Playlist.findById(req.params.id);

  if (playlist.owner !== username) {
    return res.status(403).send("Only owner can invite");
  }

  if (playlist.collaborators.includes(collaborator)) {
    return res.status(400).send("Already a collaborator");
  }

  await Playlist.findByIdAndUpdate(req.params.id, {
    $push: { collaborators: collaborator }
  });

  res.send("Collaborator added");
});

// Get all playlists for a user (owned or collaborating)
app.get('/playlist/:username', async (req, res) => {
  const { username } = req.params;
  const playlists = await Playlist.find({
    $or: [
      { owner: username },
      { collaborators: username }
    ]
  });
  res.json(playlists);
});

// Get all playlists (keep for backward compat)
app.get('/playlist', async (req, res) => {
  const playlists = await Playlist.find();
  res.json(playlists);
});

app.listen(3003, () => {
  console.log("Playlist Service running on port 3003");
});