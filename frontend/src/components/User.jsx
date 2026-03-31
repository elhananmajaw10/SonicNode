import { useState, useEffect } from 'react';
import axios from 'axios';

function User({ setLoggedInUser, onLogin, loggedInUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const [localUser, setLocalUser] = useState(loggedInUser || null);
  const [stats, setStats] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (localUser) fetchStats();
  }, [localUser]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://localhost:3002/stats/${localUser}`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const register = async () => {
    try {
      const res = await axios.post('http://localhost:3002/register', { username, password });
      setMessage(res.data);
    } catch {
      setMessage("Error registering user");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:3002/login', { username, password });
      if (res.data === "Login successful") {
        setLoggedInUser(username); 
        setLocalUser(username);    
        setMessage('');
        if (onLogin) onLogin();    
      } else {
        setMessage(res.data);
      }
    } catch {
      setMessage("Login failed");
    }
  };

  const logout = () => {
    setLocalUser(null);
    setLoggedInUser(null);
    setUsername('');
    setPassword('');
    setStats(null);
    setShowAll(false);
  };

  return (
    <div className="card" style={{ paddingBottom: '80px', background: 'transparent', border: 'none' }}>

      {!localUser ? (
        /* LOGIN FORM WITH GUEST MODE */
        <div className="auth-card" style={{ margin: '0 auto' }}>

          <h2 className="auth-title">Welcome Back!</h2>

          <div className="auth-form">

            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="auth-actions">
              <button onClick={register}>Register</button>
              <button onClick={login}>Login</button>
            </div>

            {/* GUEST MODE BUTTON */}
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                onClick={() => {
                  setLoggedInUser(null); 
                  if (onLogin) onLogin(); 
                }}
                style={{ 
                  background: 'transparent', 
                  color: '#00ffcc', 
                  border: '1px dashed #00ffcc',
                  width: '100%',
                  padding: '10px'
                }}
              >
                Browse as Guest
              </button>
            </div>

            {message && (
              <p style={{ fontSize: '11px', color: '#ff6b6b', textAlign: 'center', marginTop: '10px' }}>
                {message}
              </p>
            )}

          </div>
        </div>

      ) : (
        /* USER DASHBOARD */
        <div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Welcome, <span style={{ color: '#00ffcc' }}>{localUser}</span> 🎉</h2>
            <button onClick={logout} className="logout-btn" style={{ margin: 0 }}>Logout</button>
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#8b9bb4' }}>📊 Your Stats</h3>

          {!stats || stats.empty ? (
            <div className="empty-stats" style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px dashed #444' }}>
              <p style={{ color: '#888' }}>No listening history yet. Go play some tunes!</p>
            </div>
          ) : (
            <>
              {/* STATS GRID */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '15px',
                  marginBottom: '30px'
                }}
              >
                {[
                  { label: 'Total Plays', value: stats.totalPlays, icon: '▶' },
                  { label: 'Most Played', value: stats.mostPlayed, icon: '🏆' },
                  { label: 'Fav Genre', value: stats.favGenre, icon: '🎸' },
                  { label: 'Fav Mood', value: stats.favMood, icon: '🎭' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(0,255,204,0.2)' }}>
                    <div style={{ fontSize: '11px', color: '#8b9bb4', marginBottom: '10px' }}>
                      {stat.icon} {stat.label}
                    </div>
                    <div style={{ fontSize: '16px', color: '#00ffcc', fontWeight: 'bold' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* RECENT HISTORY */}
              <h3 style={{ marginBottom: '15px', color: '#8b9bb4' }}>🕓 Recently Played</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(showAll ? stats.recent : stats.recent.slice(0, 5)).map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 15px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      borderLeft: '3px solid #00ffcc'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{entry.title}</div>
                      <div style={{ fontSize: '10px', color: '#888' }}>{entry.artist} • {entry.mood}</div>
                    </div>

                    <div style={{ color: '#555', fontSize: '10px' }}>
                      {new Date(entry.playedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* CONTROLS */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                {stats.recent.length > 5 && (
                  <button onClick={() => setShowAll(!showAll)}>
                    {showAll ? '▲ Show Less' : `▼ Show More (${stats.recent.length - 5})`}
                  </button>
                )}
                
                <button onClick={fetchStats} style={{ borderColor: '#888', color: '#888' }}>
                  🔄 Refresh
                </button>
              </div>

            </>
          )}
        </div>
      )}

    </div>
  );
}

export default User;