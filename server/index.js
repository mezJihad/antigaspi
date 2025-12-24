import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Offer from './models/Offer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// For now we will use a local URI or placeholder. In production, use ENV var.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/antigaspi';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Antigaspi API is running...');
});

// Get all offers with filters
app.get('/api/offers', async (req, res) => {
    try {
        const { city, category } = req.query;
        let query = {};

        if (city && city !== 'Toutes') {
            query.city = city;
        }

        if (category && category !== 'Toutes') {
            query.category = category;
        }

        const offers = await Offer.find(query).sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
