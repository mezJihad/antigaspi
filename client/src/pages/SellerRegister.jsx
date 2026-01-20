import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function SellerRegister() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '',
        street: '',
        city: '',
        zipCode: '',
        description: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5131/api/Sellers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, userId: "00000000-0000-0000-0000-000000000000" })
            });
            if (response.ok) {
                navigate('/dashboard');
            } else {
                setError('Erreur lors de l\'enregistrement de la boutique.');
            }
        } catch (error) {
            setError('Une erreur est survenue.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-green-600 flex justify-center items-center">
                        <Store size={48} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Ouvrir votre Boutique
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Commencez à vendre vos paniers anti-gaspi
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <input
                                placeholder='Nom de la boutique'
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                value={formData.storeName}
                                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                placeholder='Rue'
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-4 mb-4">
                            <input
                                placeholder='Ville'
                                className="appearance-none relative block w-1/2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                            <input
                                placeholder='Code Postal'
                                className="appearance-none relative block w-1/2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                value={formData.zipCode}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <textarea
                                placeholder='Description de votre commerce...'
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button type='submit' className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                        Enregistrer la Boutique
                    </button>
                </form>
            </div>
        </div>
    );
}
