import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    description: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Boulangerie', 'Primeur', 'Produits Laitiers', 'Viande', 'Épicerie', 'Autre'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
    },
    expirationDate: { // Product expiration date
        type: Date,
        required: true,
    },
    offerStartDate: {
        type: Date,
        default: Date.now,
    },
    offerEndDate: {
        type: Date,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Offer', offerSchema);
