import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { token } = useAuth();
    const [offers, setOffers] = useState([]);
    const [mySellerId, setMySellerId] = useState(null);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;

            // Fetch My Seller ID
            try {
                const sellerRes = await fetch('http://localhost:5131/api/Sellers/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (sellerRes.ok) {
                    const seller = await sellerRes.json();
                    setMySellerId(seller.id);
                }
            } catch (e) { console.error(e); }

            // Fetch Offers
            try {
                const offersRes = await fetch('http://localhost:5131/api/Offers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (offersRes.ok) {
                    const data = await offersRes.json();
                    setOffers(data);
                }
            } catch (e) { console.error(e); }
        }
        fetchData();
    }, [token]);

    const myOffers = offers.filter(o => o.sellerId === mySellerId);

    return (
        <div className='p-4'>
            <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>

            <div className='flex gap-4 mb-8'>
                <Link to='/create-offer' className='bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition'>
                    + Create New Offer
                </Link>
                {!mySellerId && (
                    <Link to='/seller-register' className='bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition'>
                        Become a Seller
                    </Link>
                )}
            </div>

            <h2 className='text-2xl font-semibold mb-4'>My Published Offers</h2>
            {mySellerId ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {myOffers.length > 0 ? (
                        myOffers.map(offer => (
                            <div key={offer.id} className='border rounded-lg p-4 shadow-sm bg-white'>
                                {offer.pictureUrl && <img src={offer.pictureUrl} alt={offer.title} className='w-full h-40 object-cover rounded mb-4' />}
                                <h3 className='text-xl font-bold mb-2'>{offer.title}</h3>
                                <p className='text-gray-600 mb-2 truncate'>{offer.description}</p>
                                <div className='flex justify-between items-center'>
                                    <span className='font-bold text-lg text-green-600'>{offer.priceAmount} {offer.priceCurrency}</span>
                                    <span className='line-through text-gray-400 text-sm'>{offer.originalPriceAmount} {offer.originalPriceCurrency}</span>
                                </div>
                                <div className='mt-2 text-sm text-gray-500'>
                                    Expires: {new Date(offer.expirationDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className='text-gray-500'>You haven't published any offers yet.</p>
                    )}
                </div>
            ) : (
                <p className='text-gray-500 italic'>Register as a seller to start publishing offers.</p>
            )}
        </div>
    );
}
