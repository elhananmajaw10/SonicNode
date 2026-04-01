import { useState, useEffect } from 'react';
import axios from 'axios';

// We map slider values (0-4) to your specific database moods
const MOOD_MAP = [
  { value: 0, label: 'Sad',color: '#4a90e2' },
  { value: 1, label: 'Chill', color: '#b8e986' },
  { value: 2, label: 'Focus', color: '#9013fe' },
  { value: 3, label: 'Happy',color: '#f8e71c' },
  { value: 4, label: 'Energetic', color: '#ff4d4d' }
];

function Recommendation({ handlePlaySong }) {
  const [tunerValue, setTunerValue] = useState(1); // Default to 'Chill'
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentMood = MOOD_MAP[tunerValue];

  // Fetch songs automatically whenever the tuner is dragged
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Fetch from your existing mood endpoint!
        const res = await axios.get(`http://100.48.75.157:3001/mood/${currentMood.label.toLowerCase()}`);
        setSongs(res.data);
      } catch (err) {
        console.error("Failed to fetch tuner recommendations");
      }
      setLoading(false);
    };

    fetchRecommendations();
  }, [tunerValue]); // 🔥 This triggers the API call every time the slider moves!

  return (
    <div style={{ padding: '10px', paddingBottom: '80px' }}>
      <h2>Vibe Tuner</h2>
      <p style={{ color: '#8b9bb4', fontSize: '11px', marginBottom: '30px' }}>
        Dial in your exact frequency to discover new tracks.
      </p>

      {/* THE RETRO TUNER UI */}
      <div className="tuner-container" style={{ borderColor: currentMood.color, boxShadow: `0 0 20px ${currentMood.color}33` }}>
        
        <div className="tuner-display">
          <span className="tuner-emoji">{currentMood.emoji}</span>
          <h1 style={{ color: currentMood.color, textShadow: `0 0 15px ${currentMood.color}` }}>
            {currentMood.label}
          </h1>
          <span className="tuner-mhz">{(88.1 + tunerValue * 4.2).toFixed(1)} MHz</span>
        </div>

        <div className="tuner-slider-wrapper">
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={tunerValue}
            onChange={(e) => setTunerValue(parseInt(e.target.value))}
            className="tuner-slider"
            style={{ '--tuner-color': currentMood.color }}
          />
          <div className="tuner-ticks">
            <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
          </div>
        </div>
      </div>

      {/* SONG RESULTS */}
      <h3 style={{ marginTop: '40px', marginBottom: '15px' }}>
        Tuned into: <span style={{ color: currentMood.color }}>{currentMood.label}</span>
      </h3>

      {loading ? (
        <p style={{ color: '#888' }}>Tuning frequencies...</p>
      ) : songs.length === 0 ? (
        <p style={{ color: '#888' }}>Static noise. No tracks found for this frequency.</p>
      ) : (
        <div className="rec-grid">
          {songs.map((song) => (
            <div key={song._id} className="card song-card" style={{ borderLeft: `3px solid ${currentMood.color}` }}>
              <img src={`http://100.48.75.157:3001/images/${song.cover}`} alt="cover" />
              <div className="song-meta">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => handlePlaySong(song)}>▶ Play</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommendation;