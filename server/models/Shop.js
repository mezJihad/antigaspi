import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    address: {
        street: String,
        city: String,
        zipCode: String,
    },
    logoUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Shop', shopSchema);
