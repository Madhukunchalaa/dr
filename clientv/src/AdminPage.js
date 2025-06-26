import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [newSite, setNewSite] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [editSite, setEditSite] = useState(null);
  const [message, setMessage] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entryText, setEntryText] = useState('');
  const [siteEntries, setSiteEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchLocations();
    // eslint-disable-next-line
  }, [isLoggedIn]);

  const fetchLocations = async () => {
    const res = await fetch(`${API_URL}/locations`);
    const data = await res.json();
    setLocations(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') setIsLoggedIn(true);
    else setMessage('Incorrect password');
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation || !newSite) return setMessage('Location and site required');
    const res = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, location: newLocation, site: newSite })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Location and site added');
      setNewLocation('');
      setNewSite('');
      fetchLocations();
    } else setMessage(data.error || 'Error');
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!selectedLocation || !newSite) return setMessage('Select location and enter site');
    const res = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, location: selectedLocation, site: newSite })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Site added');
      setNewSite('');
      fetchLocations();
    } else setMessage(data.error || 'Error');
  };

  const handleEditSite = (loc, site) => {
    setEditSite({ location: loc.location, name: site.name });
    setMessage('');
    setEntryDate(new Date().toISOString().slice(0, 10));
    setEntryText('');
    fetchSiteEntries(loc.location, site.name);
  };

  const fetchSiteEntries = async (location, site) => {
    setLoadingEntries(true);
    const res = await fetch(`${API_URL}/site-entries?location=${encodeURIComponent(location)}&site=${encodeURIComponent(site)}`);
    const data = await res.json();
    setSiteEntries(data.entries || []);
    setLoadingEntries(false);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!editSite || !entryDate || !entryText) return setMessage('Date and text required');
    const res = await fetch(`${API_URL}/site-entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, location: editSite.location, site: editSite.name, date: entryDate, text: entryText })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Entry added');
      setEntryText('');
      fetchSiteEntries(editSite.location, editSite.name);
    } else setMessage(data.error || 'Error');
  };

  if (!isLoggedIn) {
    return (
      <div className="App-header">
        <h1>Admin Panel</h1>
        <form onSubmit={handleLogin} style={{ margin: 20 }}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ marginLeft: 10, padding: 8, fontSize: 16, borderRadius: 8, background: '#5e2590', color: '#fff', border: 'none' }}>Login</button>
        </form>
        {message && <div style={{ color: 'red' }}>{message}</div>}
        <Link to="/">Back to Main</Link>
      </div>
    );
  }

  return (
    <div className="App-header" style={{ alignItems: 'flex-start', minHeight: '100vh' }}>
      <h1>Admin Panel</h1>
      <Link to="/">Back to Main</Link>
      <div style={{ margin: '2rem 0', background: '#fff', padding: 24, borderRadius: 12, color: '#222', minWidth: 350 }}>
        <h2>Add New Location & Site</h2>
        <form onSubmit={handleAddLocation} style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Location name"
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
            style={{ marginRight: 8, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="First site name"
            value={newSite}
            onChange={e => setNewSite(e.target.value)}
            style={{ marginRight: 8, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: 6, borderRadius: 6, background: '#5e2590', color: '#fff', border: 'none' }}>Add</button>
        </form>
        <h2>Add Site to Existing Location</h2>
        <form onSubmit={handleAddSite} style={{ marginBottom: 16 }}>
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} style={{ marginRight: 8, padding: 6, borderRadius: 6 }}>
            <option value="">Select location</option>
            {locations.map(loc => <option key={loc._id} value={loc.location}>{loc.location}</option>)}
          </select>
          <input
            type="text"
            placeholder="Site name"
            value={newSite}
            onChange={e => setNewSite(e.target.value)}
            style={{ marginRight: 8, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: 6, borderRadius: 6, background: '#5e2590', color: '#fff', border: 'none' }}>Add</button>
        </form>
        <h2>Edit/Add Site Data (Date-wise)</h2>
        {locations.map(loc => (
          <div key={loc._id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>{loc.location}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {loc.sites.map(site => (
                <button
                  key={site.name}
                  style={{ background: '#5e2590', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', fontSize: 14, cursor: 'pointer' }}
                  onClick={() => handleEditSite(loc, site)}
                >
                  {site.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        {editSite && (
          <div style={{ marginTop: 16, background: '#f5f5f7', padding: 16, borderRadius: 8, maxWidth: 600, width: '100%', boxShadow: '0 2px 8px #0001', overflow: 'auto', maxHeight: 400 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}><b>Editing:</b> {editSite.location} - {editSite.name}</div>
            <form onSubmit={handleAddEntry} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Date:</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                style={{ marginBottom: 8, padding: 6, borderRadius: 6, border: '1px solid #ccc', width: 180 }}
              />
              <label style={{ display: 'block', marginBottom: 4 }}>Text:</label>
              <textarea
                value={entryText}
                onChange={e => setEntryText(e.target.value)}
                rows={6}
                style={{ width: '100%', minHeight: 80, maxHeight: 180, resize: 'vertical', borderRadius: 6, border: '1px solid #ccc', padding: 12, fontSize: 16, fontFamily: 'inherit', lineHeight: 1.5, overflow: 'auto', boxSizing: 'border-box', background: '#fff', marginBottom: 8 }}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button type="submit" style={{ padding: 8, borderRadius: 6, background: '#5e2590', color: '#fff', border: 'none', fontSize: 16 }}>Add Entry</button>
                <button type="button" style={{ padding: 8, borderRadius: 6, background: '#ccc', color: '#222', border: 'none', fontSize: 16 }} onClick={() => { setEditSite(null); setSiteEntries([]); }}>Cancel</button>
              </div>
            </form>
            <div style={{ maxHeight: 180, overflowY: 'auto', background: '#fff', borderRadius: 6, padding: 8 }}>
              <b>Entries:</b>
              {loadingEntries ? (
                <div>Loading...</div>
              ) : siteEntries.length === 0 ? (
                <div>No entries yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {siteEntries.map((entry, idx) => (
                    <li key={idx} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: '#5e2590', marginBottom: 4 }}>{entry.date}</div>
                      <div>{entry.text}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {message && <div style={{ color: 'green', marginTop: 12 }}>{message}</div>}
          </div>
        )}
        {message && !editSite && <div style={{ color: 'green', marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
}

export default AdminPage; 