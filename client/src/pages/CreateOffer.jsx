import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Euro, Tag, Type, Image as ImageIcon } from 'lucide-react';

export default function CreateOffer() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Default startDate to today YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        originalPriceAmount: '',
        startDate: today,
        endDate: '',
        pictureUrl: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Fetch Seller ID (Keep existing logic or improve context later)
            const sellerRes = await fetch('http://localhost:5131/api/Sellers/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let sellerId = null;
            if (sellerRes.ok) {
                const seller = await sellerRes.json();
                sellerId = seller.id || seller.Id;
            } else {
                alert('Vous devez avoir une boutique pour publier une offre.');
                setLoading(false);
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
                    priceCurrency: 'MAD',
                    originalPriceCurrency: 'MAD',
                    // Ensure endDate is null if empty string
                    endDate: formData.endDate || null
                })
            });

            if (response.ok) {
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                console.error("Publication failed", errorData);
                alert('Erreur lors de la publication: ' + (errorData.detail || 'Vérifiez les champs'));
            }
        } catch (error) {
            console.error("Error creating offer", error);
            alert('Erreur lors de la communication avec le serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-2xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-green-600 px-8 py-6'>
                        <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
                            <Tag className='w-8 h-8' />
                            Publier une Offre
                        </h1>
                        <p className='text-green-100 mt-2'>Rendez visible vos produits anti-gaspi en quelques clics.</p>
                    </div>

                    <form onSubmit={handleSubmit} className='p-8 space-y-6'>

                        {/* Title & Description */}
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Titre de l'offre</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                                        <Type size={18} />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Panier de légumes Bio"
                                        className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Décrivez le contenu, la quantité, la raison (DLC courte, etc.)"
                                    className='block w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Prices */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Prix Anti-gaspi (Dhs)</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                                        <span className="text-sm font-bold">Dhs</span>
                                    </div>
                                    <input
                                        required
                                        type='number'
                                        step="0.01"
                                        placeholder='0.00'
                                        className='block w-full pl-12 pr-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition font-bold text-blue-900'
                                        value={formData.priceAmount}
                                        onChange={e => setFormData({ ...formData, priceAmount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Prix d'origine (Dhs)</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                                        <span className="text-sm font-bold">Dhs</span>
                                    </div>
                                    <input
                                        required
                                        type='number'
                                        step="0.01"
                                        placeholder='0.00'
                                        className='block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition text-gray-500 line-through'
                                        value={formData.originalPriceAmount}
                                        onChange={e => setFormData({ ...formData, originalPriceAmount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date Validity */}
                        <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                            <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                                <Calendar size={16} />
                                Validité de l'offre
                            </h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-xs font-medium text-gray-500 uppercase mb-1'>Date de début (requis)</label>
                                    <input
                                        required
                                        type='date'
                                        className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-500 uppercase mb-1'>Date de fin (optionnel)</label>
                                    <input
                                        type='date'
                                        min={formData.startDate}
                                        className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    <p className='text-xs text-gray-400 mt-1'>Laissez vide pour une durée indéterminée.</p>
                                </div>
                            </div>
                        </div>

                        {/* Picture URL */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Illustration (URL)</label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                                    <ImageIcon size={18} />
                                </div>
                                <input
                                    type='url'
                                    placeholder='https://exemple.com/image.jpg'
                                    className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                    value={formData.pictureUrl}
                                    onChange={e => setFormData({ ...formData, pictureUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='pt-4'>
                            <button
                                type='submit'
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Publication en cours...' : 'Publier mon annonce'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
