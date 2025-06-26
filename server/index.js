const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;
const MONGODB_URI = 'mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your actual connection string
const ADMIN_PASSWORD = 'admin123';

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schemas
const EntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, // ISO date string
  text: { type: String, default: '' }
});

const SiteSchema = new mongoose.Schema({
  name: String,
  entries: [EntrySchema]
});

const LocationSchema = new mongoose.Schema({
  location: { type: String, unique: true },
  sites: [SiteSchema]
});

const Location = mongoose.model('Location', LocationSchema);

// Get all locations and sites (with entries)
app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new location or site (admin only)
app.post('/locations', async (req, res) => {
  const { password, location, site } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (!location || !site) return res.status(400).json({ error: 'Location and site required' });

  try {
    let loc = await Location.findOne({ location });
    if (!loc) {
      loc = new Location({ location, sites: [{ name: site, entries: [] }] });
      await loc.save();
    } else {
      if (!loc.sites.find(s => s.name === site)) {
        loc.sites.push({ name: site, entries: [] });
        await loc.save();
      }
    }
    res.json({ success: true, data: loc });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new entry for a site (admin only, date and text)
app.post('/site-entry', async (req, res) => {
  const { password, location, site, date, text } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (!location || !site || !date || !text) return res.status(400).json({ error: 'Location, site, date, and text required' });

  try {
    let loc = await Location.findOne({ location });
    if (!loc) return res.status(404).json({ error: 'Location not found' });
    let s = loc.sites.find(s => s.name === site);
    if (!s) return res.status(404).json({ error: 'Site not found' });
    s.entries.push({ date, text });
    await loc.save();
    res.json({ success: true, data: loc });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all entries for a site (by location and site name)
app.get('/site-entries', async (req, res) => {
  const { location, site } = req.query;
  if (!location || !site) return res.status(400).json({ error: 'Location and site required' });
  try {
    let loc = await Location.findOne({ location });
    if (!loc) return res.status(404).json({ error: 'Location not found' });
    let s = loc.sites.find(s => s.name === site);
    if (!s) return res.status(404).json({ error: 'Site not found' });
    // Sort entries by date descending
    const entries = s.entries.sort((a, b) => b.date.localeCompare(a.date));
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 