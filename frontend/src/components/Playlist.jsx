import { useEffect, useState } from 'react';
import axios from 'axios';

function Playlist({ loggedInUser, setCurrentSong, setIsPlaying }) {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [name, setName] = useState('');
  const [songId, setSongId] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [collaborator, setCollaborator] = useState('');
  const [inviteTarget, setInviteTarget] = useState('');
  const [message, setMessage] = useState('');
  const [openPlaylist, setOpenPlaylist] = useState(null); // NEW — modal state

  const fetchSongs = async () => {
    const res = await axios.get('http://localhost:3001/songs');
    setSongs(res.data);
  };

  const fetchPlaylists = async () => {
    if (loggedInUser) {
      const res = await axios.get(`http://localhost:3003/playlist/${loggedInUser}`);
      setPlaylists(res.data);
    } else {
      const res = await axios.get('http://localhost:3003/playlist');
      setPlaylists(res.data);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, [loggedInUser]);

  const createPlaylist = async () => {
    if (!name) return;
    await axios.post('http://localhost:3003/playlist', {
      name,
      owner: loggedInUser || 'guest'
    });
    setName('');
    fetchPlaylists();
  };

  const addSong = async () => {
    if (!selectedPlaylist || !songId) return;
    const res = await axios.post(
      `http://localhost:3003/playlist/${selectedPlaylist}/add`,
      { songId, username: loggedInUser || 'guest' }
    );
    if (res.data === "Not authorized") {
      setMessage("❌ You are not authorized to add songs to this playlist");
    } else {
      setMessage('');
      setSongId('');
      fetchPlaylists();
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteTarget || !collaborator) return;
    try {
      await axios.post(
        `http://localhost:3003/playlist/${inviteTarget}/invite`,
        { username: loggedInUser, collaborator }
      );
      setMessage(`✅ ${collaborator} added as collaborator!`);
      setCollaborator('');
      setInviteTarget('');
      fetchPlaylists();
    } catch (err) {
      setMessage(`❌ ${err.response?.data || 'Error inviting collaborator'}`);
    }
  };

  const playSongFromPlaylist = async (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    await axios.post(`http://localhost:3001/play/${song._id}`);
  };

  const ownedPlaylists = playlists.filter(p => p.owner === loggedInUser);
  const collabPlaylists = playlists.filter(p => p.owner !== loggedInUser);

  // Get full song objects for a playlist
  const getPlaylistSongs = (playlist) =>
    playlist.songs.map(s => songs.find(song => song._id === s)).filter(Boolean);

  // Playlist card component
  const PlaylistCard = ({ playlist, isShared }) => {
    const playlistSongs = getPlaylistSongs(playlist);
    return (
      <div
        onClick={() => setOpenPlaylist(playlist)}
        style={{
          border: '1px solid #00ffcc44',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '10px',
          cursor: 'pointer',
          background: '#00ffcc08',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#00ffcc'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#00ffcc44'}
      >
        <div style={{ color: '#00ffcc', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>
          📂 {playlist.name}
        </div>
        {isShared && (
          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
            👑 Owner: {playlist.owner}
          </div>
        )}
        {!isShared && playlist.collaborators.length > 0 && (
          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
            👥 {playlist.collaborators.join(', ')}
          </div>
        )}
        <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
          {playlistSongs.length} song{playlistSongs.length !== 1 ? 's' : ''} 
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '10px', paddingBottom: '80px' }}>
      <h2>📂 Playlist</h2>

      {message && (
        <div className="card">
          {message}
        </div>
      )}

      {/* CREATE PLAYLIST */}
      <div className="card">
        <h3>Create Playlist</h3>
        <input
          placeholder="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createPlaylist}>Create</button>
      </div>

      {/* ADD SONG */}
      <div className="card">
        <h3>Add Song to Playlist</h3>
        <select value={songId} onChange={(e) => setSongId(e.target.value)}>
          <option value="">Select Song</option>
          {songs.map((s) => (
            <option key={s._id} value={s._id}>{s.title}</option>
          ))}
        </select>
        <select value={selectedPlaylist} onChange={(e) => setSelectedPlaylist(e.target.value)}>
          <option value="">Select Playlist</option>
          {playlists.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <button onClick={addSong}>Add</button>
      </div>

      {/* INVITE COLLABORATOR */}
      <div className="card">
        <h3>👥 Invite Collaborator</h3>
        <select value={inviteTarget} onChange={(e) => setInviteTarget(e.target.value)}>
          <option value="">Select your playlist</option>
          {ownedPlaylists.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <input
          placeholder="Collaborator username"
          value={collaborator}
          onChange={(e) => setCollaborator(e.target.value)}
          style={{ marginTop: '8px' }}
        />
        <button onClick={inviteCollaborator} style={{ marginTop: '8px' }}>Invite</button>
      </div>

      {/* MY PLAYLISTS */}
      {ownedPlaylists.length > 0 && (
        <div className="card">
          <h3>👑 My Playlists</h3>
          {ownedPlaylists.map(p => (
            <PlaylistCard key={p._id} playlist={p} isShared={false} />
          ))}
        </div>
      )}

      {/* SHARED WITH ME */}
      {collabPlaylists.length > 0 && (
        <div className="card">
          <h3>🤝 Shared With Me</h3>
          {collabPlaylists.map(p => (
            <PlaylistCard key={p._id} playlist={p} isShared={true} />
          ))}
        </div>
      )}

      {playlists.length === 0 && (
        <p style={{ color: '#555' }}>No playlists yet. Create one!</p>
      )}

      {/* MODAL */}
      {openPlaylist && (
        <div
          onClick={() => setOpenPlaylist(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d0d0d',
              border: '1px solid #00ffcc44',
              borderRadius: '8px',
              padding: '20px',
              width: '90%',
              maxWidth: '480px',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#00ffcc', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>
                  📂 {openPlaylist.name}
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                  {openPlaylist.owner === loggedInUser
                    ? `👑 Your playlist · ${openPlaylist.collaborators.length} collaborator(s)`
                    : `👑 Owner: ${openPlaylist.owner}`}
                </div>
              </div>
              <button
                onClick={() => setOpenPlaylist(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                  fontFamily: 'monospace',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                ✕ close
              </button>
            </div>

            {/* SONG LIST IN MODAL */}
            {getPlaylistSongs(openPlaylist).length === 0 ? (
              <p style={{ color: '#555', fontSize: '13px' }}>No songs yet. Add some!</p>
            ) : (
              getPlaylistSongs(openPlaylist).map((song, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: '1px solid #00ffcc22',
                  }}
                >
                  <img
                    src={`http://localhost:3001/images/${song.cover}`}
                    alt="cover"
                    style={{ width: '52px', height: '52px', border: '2px solid #00ffcc44', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#00ffcc', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold' }}>
                      {song.title}
                    </div>
                    <div style={{ color: '#888', fontSize: '12px' }}>{song.artist}</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>{song.genre}</div>
                  </div>
                  <button
                    onClick={() => {
                      playSongFromPlaylist(song);
                      setOpenPlaylist(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #00ffcc',
                      color: '#00ffcc',
                      fontFamily: 'monospace',
                      padding: '4px 12px',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    ▶ Play
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlist;