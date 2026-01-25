import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { token } = useAuth();
    const [offers, setOffers] = useState([]);
    const [mySellerId, setMySellerId] = useState(null);
    const [sellerProfile, setSellerProfile] = useState(null);

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
                    console.log("Seller info received:", seller);
                    setMySellerId(seller.id || seller.Id);
                    setSellerProfile(seller);
                }
            } catch (e) { console.error("Error fetching seller:", e); }

        }
        fetchData();
    }, [token]);

    // Fetch My Offers separately
    useEffect(() => {
        async function fetchMyOffers() {
            if (!token || !mySellerId) return;
            try {
                const offersRes = await fetch('http://localhost:5131/api/Sellers/me/offers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (offersRes.ok) {
                    const data = await offersRes.json();
                    setOffers(data);
                }
            } catch (e) { console.error(e); }
        }
        fetchMyOffers();
    }, [token, mySellerId]);

    const myOffers = offers; // Already filtered by backend

    return (
        <div className='p-8 max-w-7xl mx-auto'>
            <div className="flex justify-between items-center mb-8">
                <h1 className='text-3xl font-bold text-gray-900'>Mon Tableau de Bord</h1>
                {mySellerId && (
                    <Link to='/create-offer' className='bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 font-medium'>
                        + Nouvelle Offre
                    </Link>
                )}
            </div>

            <div className='mb-8'>
                {!mySellerId ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">Vous n'avez pas encore de profil vendeur</h3>
                            <p className="text-blue-700">Créez votre boutique pour commencer à publier des offres anti-gaspi.</p>
                        </div>
                        <Link to='/seller-register' className='bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition font-medium whitespace-nowrap'>
                            Créer ma boutique
                        </Link>
                    </div>
                ) : (
                    sellerProfile && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{sellerProfile.storeName}</h2>
                            <p className="text-gray-600 mb-4">{sellerProfile.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                                <span>📍 {sellerProfile.street}, {sellerProfile.zipCode} {sellerProfile.city}</span>
                            </div>
                        </div>
                    )
                )}
            </div>

            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Mes Offres Publiées</h2>
            {mySellerId ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {myOffers.length > 0 ? (
                        myOffers.map(offer => (
                            <div key={offer.id} className='border border-gray-100 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition'>
                                {offer.pictureUrl ? (
                                    <img src={offer.pictureUrl} alt={offer.title} className='w-full h-48 object-cover rounded-lg mb-4' />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                                        Pas d'image
                                    </div>
                                )}
                                <h3 className='text-xl font-bold text-gray-900 mb-1'>{offer.title}</h3>
                                <p className='text-gray-500 text-sm mb-3 line-clamp-2'>{offer.description}</p>
                                <div className='flex justify-between items-end'>
                                    <div className="flex flex-col">
                                        <span className='text-xs text-gray-400 uppercase font-semibold'>Prix</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className='font-bold text-2xl text-green-600'>{offer.price} Dhs</span>
                                            {offer.originalPrice && (
                                                <span className='line-through text-gray-400 text-sm'>{offer.originalPrice} Dhs</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <span className='text-xs text-gray-400 uppercase font-semibold'>Validité</span>
                                        <div className="text-sm font-medium text-gray-700 flex flex-col items-end">
                                            <span>du {new Date(offer.startDate).toLocaleDateString()}</span>
                                            {offer.endDate && (
                                                <span>au {new Date(offer.endDate).toLocaleDateString()}</span>
                                            )}

                                            {/* DLC Display */}
                                            <div className="mt-1 text-xs font-bold text-red-500 flex items-center gap-1">
                                                <span>⚠️ DLC: {new Date(offer.expirationDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className='text-gray-500 font-medium'>Vous n'avez publié aucune offre pour le moment.</p>
                            <Link to='/create-offer' className='inline-block mt-4 text-green-600 font-medium hover:underline'>
                                Publier ma première offre
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <p className='text-gray-500 italic'>Enregistrez votre boutique pour voir vos offres ici.</p>
            )}
        </div>
    );
}
