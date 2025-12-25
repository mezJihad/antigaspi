import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Offer from './models/Offer.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend (Production)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Database Connection
// For now we will use a local URI or placeholder. In production, use ENV var.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/antigaspi';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
// app.get('/', (req, res) => {
//     res.send('Antigaspi API is running...');
// });

app.get('/api/health', (req, res) => {
    res.send('Antigaspi API is healthy');
});

// Catch-all handler for any request that doesn't match an API route
// Send back React's index.html file.


// Get all offers with filters
app.get('/api/offers', async (req, res) => {
    try {
        console.log('🔍 Fetching offers...');
        const { city, category } = req.query;
        let query = {};

        if (city && city !== 'Toutes') {
            query.city = city;
        }

        if (category && category !== 'Toutes') {
            query.category = category;
        }

        console.log('🔍 Query params:', query);

        const offers = await Offer.find(query).sort({ createdAt: -1 });
        console.log(`✅ Found ${offers.length} offers`);
        res.json(offers);
    } catch (error) {
        console.error('❌ Error fetching offers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// TEMPORARY: Route to seed the database remotely
import User from './models/User.js';
import Shop from './models/Shop.js';

app.get('/api/test-seed', async (req, res) => {
    try {
        console.log('🌱 Starting remote seed...');
        // Clean DB
        await User.deleteMany({});
        await Shop.deleteMany({});
        await Offer.deleteMany({});
        console.log('🧹 Database cleaned');

        // Create Users
        const shopUser = await User.create({
            email: 'shop@antigaspi.com',
            password: 'password123',
            role: 'shop',
            firstName: 'Jean',
            lastName: 'Dupont'
        });

        // Create Shop
        const myShop = await Shop.create({
            user: shopUser._id,
            name: 'La Boulangerie Bio',
            description: 'Pains et viennoiseries bio faits maison.',
            address: {
                street: '10 Rue de la Paix',
                city: 'Paris',
                zipCode: '75001'
            }
        });

        // Create Offers
        const offers = [
            {
                title: 'Baguettes Fraîches (Lot de 3)',
                shop: myShop._id,
                description: 'Trois baguettes traditionnelles.',
                city: myShop.address.city,
                category: 'Boulangerie',
                price: 2.50,
                originalPrice: 5.00,
                expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                offerStartDate: new Date(),
                offerEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            {
                title: 'Croissants de la veille',
                shop: myShop._id,
                description: 'Croissants pur beurre.',
                city: myShop.address.city,
                category: 'Boulangerie',
                price: 3.00,
                originalPrice: 6.00,
                expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
                offerStartDate: new Date(),
                offerEndDate: new Date(Date.now() + 12 * 60 * 60 * 1000)
            }
        ];

        await Offer.insertMany(offers);
        console.log(`🏷️ ${offers.length} Offers created`);

        res.json({ message: '✅ Seeding successful', offersCreated: offers.length });
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        res.status(500).json({ message: 'Seeding failed', error: error.message });
    }
});

// Catch-all handler for any request that doesn't match an API route
// Send back React's index.html file.
// Debug: Log the path we are trying to serve
const clientDistPath = path.join(__dirname, '../client/dist');
console.log(`📂 Serving static files from: ${clientDistPath}`);

app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Explicitly bind to 0.0.0.0 to ensure external access in Docker/Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
