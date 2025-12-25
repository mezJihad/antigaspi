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

// Maintenance Mode Middleware
app.use((req, res, next) => {
    // Debug: Log the value to check what Railway actually sees
    // console.log(`🔒 Maintenance Check: ${process.env.MAINTENANCE_MODE}`);

    const maintenanceMode = String(process.env.SITE_MAINTENANCE || '').trim().toLowerCase();

    // Check debugging log
    // console.log(`🔒 Maintenance Check: '${process.env.MAINTENANCE_MODE}' -> '${maintenanceMode}'`);

    if (maintenanceMode === 'true') {
        // Prevent browser caching so it doesn't get "stuck"
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        const maintenanceHtml = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Antigaspi - Bientôt disponible</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        text-align: center;
                    }
                    .container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 3rem;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                        max-width: 600px;
                        width: 90%;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.25rem;
                        line-height: 1.6;
                        margin-bottom: 2rem;
                        opacity: 0.9;
                    }
                    .loader {
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        border-top: 4px solid white;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Antigaspi</h1>
                    <p>Nous préparons quelque chose de spécial pour lutter contre le gaspillage alimentaire.</p>
                    <p>Notre plateforme sera bientôt disponible dans votre ville.</p>
                    <div class="loader"></div>
                </div>
            </body>
            </html>
        `;
        return res.send(maintenanceHtml);
    }
    next();
});

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
    console.log(`🔧 Maintenance Mode: ${process.env.SITE_MAINTENANCE || 'off'}`);
});
