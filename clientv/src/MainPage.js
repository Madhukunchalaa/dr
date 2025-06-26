import React, { useEffect, useState, useMemo } from 'react';

const API_URL = 'http://localhost:5000/locations';
const ENTRIES_URL = 'http://localhost:5000/site-entries';

function MainPage() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [siteEntries, setSiteEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setLocations(data));
  }, []);

  const handleSiteClick = (site, location) => {
    setSelectedSite(site.name);
    setSelectedLocation(location);
    setLoadingEntries(true);
    setStartDate('');
    setEndDate('');
    fetch(`${ENTRIES_URL}?location=${encodeURIComponent(location)}&site=${encodeURIComponent(site.name)}`)
      .then(res => res.json())
      .then(data => {
        setSiteEntries(data.entries || []);
        setLoadingEntries(false);
      })
      .catch(() => {
        setSiteEntries([]);
        setLoadingEntries(false);
      });
  };

  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return siteEntries;
    return siteEntries.filter(entry => {
      const entryDate = entry.date;
      const isAfterStart = !startDate || entryDate >= startDate;
      const isBeforeEnd = !endDate || entryDate <= endDate;
      return isAfterStart && isBeforeEnd;
    });
  }, [siteEntries, startDate, endDate]);

  const filteredLocations = locations.filter(loc =>
    loc.location.toLowerCase().includes(search.toLowerCase()) ||
    loc.sites.some(site => site.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: '2rem', background: '#f5f5f7', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src="/favicon.ico" alt="logo" style={{ width: 60, height: 60 }} />
        <h1 style={{ fontWeight: 700 }}>Dr. Reddy's GMO Sites</h1>
        <input
          type="text"
          placeholder="Search Here..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', padding: '0.5rem 1rem', borderRadius: 20, border: '1px solid #ccc', fontSize: 16 }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
        {filteredLocations.map(loc => (
          <div key={loc.location} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', minWidth: 300, boxShadow: '0 2px 8px #0001' }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>{loc.location}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {loc.sites.map(site => (
                <button
                  key={site.name}
                  style={{ background: '#5e2590', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.5rem', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => handleSiteClick(site, loc.location)}
                >
                  {site.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Site Data Modal/Section */}
      {selectedSite && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => { setSelectedSite(null); setSiteEntries([]); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', minWidth: 300, maxWidth: 600, boxShadow: '0 2px 16px #0002', position: 'relative', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }} onClick={() => { setSelectedSite(null); setSiteEntries([]); }}>&times;</button>
            <h2 style={{ marginBottom: 16 }}>{selectedSite}</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: 14 }}>From:</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: 14 }}>To:</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }} />
              </div>
            </div>
            <div style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.6, maxHeight: '60vh', overflowY: 'auto', padding: 8, background: '#f5f5f7', borderRadius: 8 }}>
              {loadingEntries ? (
                <div>Loading...</div>
              ) : filteredEntries.length === 0 ? (
                <div>No data available for the selected date range.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredEntries.map((entry, idx) => (
                    <li key={idx} style={{ marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                      <div style={{ fontWeight: 600, color: '#5e2590', marginBottom: 4 }}>{entry.date}</div>
                      <div>{entry.text}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage; 