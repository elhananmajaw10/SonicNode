import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Don't forget the CSS import!

import Music from './components/Music';
import Playlist from './components/Playlist';
import User from './components/User';
import Recommendation from './components/Recommendation';

function App() {

  const [page, setPage] = useState('auth');
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [selectedGenre, setSelectedGenre] = useState(null);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [recommendations, setRecommendations] = useState([]);
  const [showRec, setShowRec] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // memory tracker to prevent loops
  const [sessionHistory, setSessionHistory] = useState([]); 

  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setMeta);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setMeta);
    };
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Global Play Function
  const handlePlaySong = async (song) => {
    if (!song) return;
    
    setCurrentSong(song);
    setIsPlaying(true);

    // Add this song to our memory tracker
    setSessionHistory(prev => [...prev, song._id]);

    try {
      // 1. Increment Play Count
      await axios.post(`http://localhost:3001/play/${song._id}`);

      // 2. Save to history if logged in
      if (loggedInUser) {
        await axios.post('http://localhost:3002/history', {
          username: loggedInUser,
          songId: song._id,
          title: song.title,
          artist: song.artist,
          genre: song.genre,
          mood: song.mood
        });
      }

      // 3. Fetch New Recommendations based on this new song
      const rec = await axios.get(`http://localhost:3004/recommend/${song._id}`);
      const upNextSongs = rec.data.filter(s => s._id !== song._id);
      
      setRecommendations(upNextSongs);
    } catch (error) {
      console.error("Playback sequence error:", error);
    }
  };

  const logout = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setRecommendations([]);
    setSessionHistory([]); // clear memory on logout
    setShowRec(false);
    setShowNowPlaying(false);

    setLoggedInUser(null);
    setPage('auth');
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Helper function to break the ping-pong loop
  const getNextUnplayedSong = (recs) => {
    if (!recs || recs.length === 0) return null;
    
    const unplayedSong = recs.find(r => !sessionHistory.includes(r._id));
    
    if (unplayedSong) {
      return unplayedSong;
    } else {
      setSessionHistory(currentSong ? [currentSong._id] : []); 
      return recs[0];
    }
  };

  const playNext = () => {
    const nextSong = getNextUnplayedSong(recommendations);
    if (nextSong) {
      handlePlaySong(nextSong);
    }
  };

  const playPrev = () => {
    if (recommendations && recommendations.length > 0) {
      handlePlaySong(recommendations[recommendations.length - 1]);
    }
  };

  return (
    <div>

      {/* AUTH */}
      {page === 'auth' && (
        <div className="auth-screen">
          <h1>🎵 SonicNode</h1>
          <p>Welcome to your retro music universe</p>
          <User setLoggedInUser={setLoggedInUser} loggedInUser={loggedInUser} onLogin={() => setPage('genre')} />
        </div>
      )}

      {/* GENRE */}
      {page === 'genre' && (
        <div className="auth-screen">
          <div className="genre-panel">

            <h2>🎧 Choose your vibe</h2>

            <div className="genre-buttons">
              <button onClick={() => { setSelectedGenre('Pop'); setPage('music'); }}>Pop</button>
              <button onClick={() => { setSelectedGenre('R&B'); setPage('music'); }}>R&B</button>
              <button onClick={() => { setSelectedGenre('Rock'); setPage('music'); }}>Rock</button>
            </div>

            <button
              className="explore-btn"
              onClick={() => { setSelectedGenre(null); setPage('music'); }}
            >
              🌍 Explore Everything
            </button>

          </div>
        </div>
      )}

      {/* MAIN */}
      {page !== 'auth' && page !== 'genre' && (
        <div className={`app-layout ${currentSong ? 'with-now-playing' : ''}`}>

          <div className="sidebar">
            <h2>🎧</h2>

            <button onClick={() => setPage('music')}>Music</button>
            <button onClick={() => setPage('recommend')}>Recommend</button>
            <button onClick={() => setPage('playlist')}>Playlist</button>
            <button onClick={() => setPage('user')}>User</button>

            {loggedInUser ? (
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            ) : (
              <button onClick={logout} className="logout-btn" style={{ borderColor: '#00ffcc', color: '#00ffcc' }}>
                Login
              </button>
            )}
          </div>

          <div className="main-content">

            {page === 'music' && (
              <Music
                handlePlaySong={handlePlaySong} 
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                loggedInUser={loggedInUser}
              />
            )}

            {page === 'recommend' && (
              <Recommendation
                handlePlaySong={handlePlaySong}
              />
            )}

            {page === 'playlist' && (
              <Playlist
                loggedInUser={loggedInUser}
                setCurrentSong={setCurrentSong}
                setIsPlaying={setIsPlaying}
              />
            )}

            {page === 'user' && (
              <User
                setLoggedInUser={setLoggedInUser}
                loggedInUser={loggedInUser}
              />
            )}

          </div>

          {/* NOW PLAYING PANEL */}
          {currentSong && (
            <div className="now-playing-panel">
              <div className="now-playing-header">Now Playing</div>
              <img
                src={`http://localhost:3001/images/${currentSong.cover}`}
                alt="cover"
                className="now-playing-cover"
              />
              <div className="now-playing-meta">
                <div className="now-playing-title">{currentSong.title}</div>
                <div className="now-playing-artist">{currentSong.artist}</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* FIXED PLAYER */}
      {currentSong && (
        <div className="player">

          <div className="player-left">
            <img src={`http://localhost:3001/images/${currentSong.cover}`} alt="cover" />
            <div className="song-meta">
              <div className="player-title">{currentSong.title}</div>
              <div className="player-artist">{currentSong.artist}</div>
            </div>
          </div>

          <div className="player-center">

            <div className="controls-row">
              <button onClick={playPrev}>⏮</button>
              <button onClick={() => {
                if (isPlaying) audioRef.current.pause();
                else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button onClick={playNext}>⏭</button>
            </div>

            <div
              className="seek-bar"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={(e) => {
                if (!isDragging || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = percent * duration;
              }}
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = percent * duration;
              }}
            >
              <div
                className="seek-progress"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>

            <div className="time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

          </div>

          <div className="player-right">
            <button onClick={() => setShowNowPlaying(true)}>⛶</button>
            <button onClick={() => setShowRec(!showRec)}>✨</button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ '--value': `${volume * 100}%` }}
            />
          </div>

          {/* SMART QUEUE */}
          <audio 
            ref={audioRef} 
            autoPlay 
            key={currentSong.file}
            onEnded={() => {
              const nextSong = getNextUnplayedSong(recommendations);
              if (nextSong) {
                handlePlaySong(nextSong);
              } else {
                setIsPlaying(false);
              }
            }}
          >
            <source
              src={`http://localhost:3001/uploads/${currentSong.file}`}
              type="audio/mpeg"
            />
          </audio>

        </div>
      )}

      {/* RECOMMENDATIONS */}
      {showRec && recommendations.length > 0 && (
        <div className="rec-popup">
          <h4>Up Next:</h4>

          {recommendations.map((song) => (
            <div key={song._id} className="rec-popup-item">
              <span>{song.title}</span>

              <button onClick={() => handlePlaySong(song)}>
                ▶
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN */}
      {showNowPlaying && currentSong && (
        <div className="now-playing">

          <button className="back-btn" onClick={() => setShowNowPlaying(false)}>
            ←
          </button>

          <div className="now-content">

            <img
              className="now-cover"
              src={`http://localhost:3001/images/${currentSong.cover}`}
              alt="cover"
            />

            <h2>{currentSong.title}</h2>
            <p>{currentSong.artist}</p>

            <button onClick={() => {
              if (isPlaying) audioRef.current.pause();
              else audioRef.current.play();
              setIsPlaying(!isPlaying);
            }}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;