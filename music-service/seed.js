const mongoose = require('mongoose');
const Song = require('./models/Song'); // Ensure this path matches your model

const songs = [
  { title: "Stuck", artist: "LANY", genre: "Pop", playCount: 52, file: "stuck.mp3", cover: "stuck.jpeg", mood: "sad" },
  { title: "Pink+White", artist: "Frank Ocean", genre: "R&B", playCount: 18, file: "pink+white.mp3", cover: "pink+white.jpeg", mood: "chill" },
  { title: "Do I Wanna Know", artist: "Arctic Monkeys", genre: "Rock", playCount: 9, file: "do i wanna know.mp3", cover: "do i wanna know.jpeg", mood: "chill" },
  { title: "Don't Stop Believin'", artist: "Journey", genre: "Rock", playCount: 8, file: "dont stop believing.mp3", cover: "dont stop believing.jpeg", mood: "energetic" },
  { title: "Die For You", artist: "The Weeknd", genre: "R&B", playCount: 10, file: "die for you.mp3", cover: "die for you.jpeg", mood: "sad" },
  { title: "Best Part", artist: "Daniel Caesar, H.E.R", genre: "R&B", playCount: 23, file: "best part.mp3", cover: "best part.jpeg", mood: "chill" },
  { title: "Photograph", artist: "Ed Sheeran", genre: "Pop", playCount: 13, file: "photograph.mp3", cover: "photograph.jpeg", mood: "sad" },
  { title: "Every Breath You Take", artist: "The Police", genre: "Rock", playCount: 4, file: "every breath you take.mp3", cover: "every breath you take.jpeg", mood: "chill" },
  { title: "Don't Stop Me Now", artist: "Queen", genre: "Rock", playCount: 3, file: "dont stop me now.mp3", cover: "dont stop me now.jpeg", mood: "energetic" },
  { title: "Best Song Ever", artist: "One Direction", genre: "Pop", playCount: 9, file: "best song ever.mp3", cover: "best song ever.jpeg", mood: "happy" },
  { title: "Passionfruit", artist: "Drake", genre: "R&B", playCount: 25, file: "passionfruit.mp3", cover: "passionfruit.jpeg", mood: "chill" },
  { title: "Happy", artist: "Pharrell Williams", genre: "Pop", playCount: 12, file: "happy.mp3", cover: "happy.jpeg", mood: "happy" },
  { title: "As It Was", artist: "Harry Styles", genre: "Pop", playCount: 23, file: "as it was.mp3", cover: "as it was.jpeg", mood: "sad" },
  { title: "What Once Was", artist: "Her's", genre: "Indie Rock", playCount: 9, file: "what once was.mp3", cover: "what once was.jpeg", mood: "chill" },
  { title: "'Cause You Have To", artist: "LANY", genre: "Pop", playCount: 9, file: "cause you have to.mp3", cover: "cause you have to.jpeg", mood: "sad" },
  { title: "Raindance", artist: "Dave, Tems", genre: "UK Rap", playCount: 8, file: "raindance.mp3", cover: "raindance.jpeg", mood: "chill" }
];

async function seedDB() {
  try {
    // Connects to the mongodb container on the internal Docker network
    await mongoose.connect('mongodb://mongodb:27017/sonicnode');
    
    console.log("🧹 Clearing old data...");
    await Song.deleteMany({}); 
    
    console.log("🌱 Planting new songs...");
    await Song.insertMany(songs);
    
    console.log("✅ Database Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
}

seedDB();