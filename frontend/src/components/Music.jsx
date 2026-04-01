import { useEffect, useState } from 'react';
import axios from 'axios';

const MOODS = ['happy', 'chill', 'sad', 'energetic', 'focus'];

function Music({
  handlePlaySong, 
  selectedGenre,
  setSelectedGenre,
  loggedInUser 
}) {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  
  const [sotd, setSotd] = useState(null);
  const [isPersonal, setIsPersonal] = useState(false);

  const fetchSongs = async () => {
    const res = await axios.get('http://100.48.75.157:3001/songs');
    setSongs(res.data);
    setSelectedMood(null);
    return res.data;
  };

  const fetchBannerData = async (allSongs) => {
    if (!allSongs) return;

    if (loggedInUser) {
      try {
        const statRes = await axios.get(`http://100.48.75.157:3002/stats/${loggedInUser}`);
        if (statRes.data && !statRes.data.empty) {
          const userTop = allSongs.find(s => s.title === statRes.data.mostPlayed);
          if (userTop) {
            setSotd({ ...userTop, personalCount: statRes.data.mostPlayedCount });
            setIsPersonal(true);
            return; 
          }
        }
      } catch (err) {
        console.error("Failed to fetch personal stats, falling back to global");
      }
    }

    try {
      const globalRes = await axios.get('http://100.48.75.157:3001/song-of-the-day');
      setSotd(globalRes.data);
      setIsPersonal(false);
    } catch (err) {
      console.error("Failed to fetch global SOTD");
    }
  };

  useEffect(() => { 
    const init = async () => {
      const allSongs = await fetchSongs(); 
      fetchBannerData(allSongs);
    };
    init();
  }, [loggedInUser]); 

  const searchSongs = async () => {
    if (!query) return fetchSongs();
    const res = await axios.get(`http://100.48.75.157:3001/search?q=${query}`);
    setSongs(res.data);
  };

  const filterByMood = async (mood) => {
    setSelectedMood(mood);
    setSelectedGenre(null);
    const res = await axios.get(`http://100.48.75.157:3001/mood/${mood}`);
    setSongs(res.data);
  };

  const filteredSongs = selectedGenre
    ? songs.filter(song => song.genre === selectedGenre)
    : songs;

  return (
    <div style={{ padding: '10px', paddingBottom: '80px' }}>
      <h2>🎵 Music</h2>

      {/* DYNAMIC BANNER */}
      {!selectedGenre && !selectedMood && !query && sotd && (
        <div className="sotd-banner">
          
          <div className="sotd-badge" style={{ background: isPersonal ? '#ffaa00' : '#00ffcc' }}>
            {isPersonal ? '🎧 Your Top Track' : '👑 Global Song of the Day'}
          </div>

          <div className="sotd-content">
            <img src={`http://100.48.75.157:3001/images/${sotd.cover}`} alt="Cover" />
            <div className="sotd-info">
              <h3>{sotd.title}</h3>
              <p>{sotd.artist}</p>
              
              <div className="sotd-stats">
                🔥 {isPersonal ? `${sotd.personalCount} personal plays` : `${sotd.playCount} global plays`}
              </div>
              
              <button onClick={() => handlePlaySong(sotd)} className="sotd-play-btn">
                ▶ Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOOD FILTER */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '6px', color: '#00ffcc', fontSize: '13px' }}>
          Filter by mood:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => filterByMood(mood)}
              style={{
                padding: '4px 12px',
                border: `1px solid ${selectedMood === mood ? '#00ffcc' : '#444'}`,
                background: selectedMood === mood ? '#00ffcc22' : 'transparent',
                color: selectedMood === mood ? '#00ffcc' : '#888',
                fontFamily: 'monospace',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              {mood}
            </button>
          ))}
          {selectedMood && (
            <button
              onClick={fetchSongs}
              style={{
                padding: '4px 12px',
                border: '1px solid #ff4444',
                background: 'transparent',
                color: '#ff4444',
                fontFamily: 'monospace',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              ✕ clear
            </button>
          )}
        </div>
      </div>

      {/* GENRE HEADER */}
      {selectedGenre ? (
        <>
          <h3>Showing: {selectedGenre}</h3>
          <div style={{ marginBottom: '15px' }}>
            <span className="explore-text">Wanna explore all?</span>
            <div>
              <button className="explore-btn" onClick={() => setSelectedGenre(null)}>
                Show All Songs 🌍
              </button>
            </div>
          </div>
        </>
      ) : (
        <h3>
          {selectedMood ? `Mood: ${selectedMood} 🎭` : 'Showing: All Songs 🌍'}
        </h3>
      )}

      {/* SEARCH */}
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="What do you have in mind?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchSongs}>Search</button>
        <button onClick={fetchSongs} style={{ marginLeft: '10px' }}>Reset</button>
      </div>

      {/* SONG LIST */}
      {filteredSongs.map((song) => (
        <div key={song._id} className="card song-card">
          <img
            src={`http://100.48.75.157:3001/images/${song.cover}`}
            alt="cover"
          />
          <div className="song-meta">
            <div className="song-title">{song.title}</div>
            <div className="song-artist">{song.artist}</div>
            <div style={{ fontSize: '9px', color: '#666' }}>{song.genre}</div>
            <div style={{ marginTop: '10px' }}>
              
              <button onClick={() => handlePlaySong(song)}>Play</button>
              
              <a href={`http://100.48.75.157:3001/uploads/${song.file}`}
                target="_blank"
                rel="noreferrer"
                className="download-btn"
              >
                ⬇ Download
              </a>
            </div>
          </div>
        </div>
      ))}

      {filteredSongs.length === 0 && <p>No songs found</p>}
    </div>
  );
}

export default Music;