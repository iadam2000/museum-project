//test
// const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Temporary in-memory exhibition store
const exhibitions = {};

// Simple home route
app.get('/', (req, res) => {
    res.send('Museum API running.');
});

// Fetch artwork from The Met API
app.get('/api/met/search', async (req, res) => {
    const { q } = req.query;
    try {
        const searchRes = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/search`, {
            params: { q }
        });

        const objectIDs = searchRes.data.objectIDs?.slice(0, 10) || [];

        const details = await Promise.all(objectIDs.map(async id => {
            const { data } = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            return {
                id: data.objectID,
                title: data.title,
                image: data.primaryImageSmall,
                artist: data.artistDisplayName,
                date: data.objectDate,
                museum: 'The Met'
            };
        }));

        res.json(details);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from The Met' });
    }
});

// Fetch artwork from Harvard Art Museums API
app.get('/api/harvard/search', async (req, res) => {
    const { q } = req.query;
    const apiKey = 'a0eeda8c-296e-4ea7-89d3-92600d4baa37'; 
    try {
        const searchRes = await axios.get(`https://api.harvardartmuseums.org/object`, {
            params: { q, apikey: apiKey }
        });

        const results = searchRes.data.records || [];

        const details = results.slice(0, 10).map(item => ({
            id: item.id,
            title: item.title,
            image: item.primaryimageurl,
            artist: item.artist,
            date: item.date,
            museum: 'Harvard Art Museums'
        }));

        res.json(details);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from Harvard Art Museums' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
