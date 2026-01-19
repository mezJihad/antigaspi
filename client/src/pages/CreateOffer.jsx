import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreateOffer() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        originalPriceAmount: '',
        expirationDate: '',
        pictureUrl: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Fetch Seller ID
            const sellerRes = await fetch('http://localhost:5131/api/Sellers/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let sellerId = null;
            if (sellerRes.ok) {
                const seller = await sellerRes.json();
                sellerId = seller.id;
            } else {
                alert('You must be a registered seller to create an offer.');
                return;
            }

            const response = await fetch('http://localhost:5131/api/Offers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    sellerId: sellerId,
                    priceCurrency: 'EUR',
                    originalPriceCurrency: 'EUR'
                })
            });
            if (response.ok) {
                navigate('/dashboard');
            } else {
                alert('Failed to create offer');
            }
        } catch (error) {
            alert('Error creating offer');
        }
    };

    return (
        <div className='p-4 max-w-md mx-auto'>
            <h1 className='text-2xl font-bold mb-4'>Publish an Offer</h1>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input placeholder='Title' className='border p-2 rounded'
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <textarea placeholder='Description' className='border p-2 rounded'
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <input type='number' placeholder='Price' className='border p-2 rounded'
                    value={formData.priceAmount} onChange={e => setFormData({ ...formData, priceAmount: e.target.value })} />
                <input type='number' placeholder='Original Price' className='border p-2 rounded'
                    value={formData.originalPriceAmount} onChange={e => setFormData({ ...formData, originalPriceAmount: e.target.value })} />
                <input type='datetime-local' placeholder='Expiration' className='border p-2 rounded'
                    value={formData.expirationDate} onChange={e => setFormData({ ...formData, expirationDate: e.target.value })} />
                <input placeholder='Picture URL' className='border p-2 rounded'
                    value={formData.pictureUrl} onChange={e => setFormData({ ...formData, pictureUrl: e.target.value })} />
                <button type='submit' className='bg-blue-600 text-white p-2 rounded'>Publish Offer</button>
            </form>
        </div>
    );
}
