import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:l2pDoOinv3oX2AOV@cluster0.zobhxx8.mongodb.net/antigaspi?appName=Cluster0';

console.log('Attempting to connect to MongoDB...', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:');
        console.error(err);
        process.exit(1);
    });
