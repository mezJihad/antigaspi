import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Shop from './models/Shop.js';
import Offer from './models/Offer.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding');

        // Clean DB
        await User.deleteMany({});
        await Shop.deleteMany({});
        await Offer.deleteMany({});
        console.log('🧹 Database cleaned');

        // Create Users
        const shopUser = await User.create({
            email: 'shop@antigaspi.com',
            password: 'password123', // In real app, hash this!
            role: 'shop',
            firstName: 'Jean',
            lastName: 'Dupont'
        });
        console.log('👤 Shop User created');

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
        console.log('🏪 Shop created');

        // Create Offers
        const offers = [
            {
                title: 'Baguettes Fraîches (Lot de 3)',
                shopName: myShop.name,
                city: myShop.address.city,
                category: 'Boulangerie',
                price: 2.50,
                originalPrice: 5.00,
                expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // +1 day
            },
            {
                title: 'Croissants de la veille',
                shopName: myShop.name,
                city: myShop.address.city,
                category: 'Boulangerie',
                price: 3.00,
                originalPrice: 6.00,
                expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000) // +12 hours
            }
        ];

        await Offer.insertMany(offers);
        console.log(`🏷️ ${offers.length} Offers created`);

        console.log('🌱 Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
