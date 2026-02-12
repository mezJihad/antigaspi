import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, Loader } from 'lucide-react';
import api from '../services/api';

export default function CreateProduct() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Grocery',
        originalPriceAmount: '',
        originalPriceCurrency: 'MAD',
        pictureUrl: '',
        gtin: ''
    });

    const categories = [
        'Bakery', 'Grocery', 'FruitsAndVegetables', 'Dairy', 'Meat', 'ReadyMeals', 'Desserts', 'Beverages', 'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Get Seller ID
            const sellerRes = await api.get('/Sellers/me');
            const sellerId = sellerRes.data.id || sellerRes.data.Id;

            if (!sellerId) throw new Error("Seller not found");

            const payload = {
                ...formData,
                sellerId,
                originalPriceAmount: parseFloat(formData.originalPriceAmount)
            };

            await api.post('/products', payload);
            navigate('/products');
        } catch (err) {
            console.error(err);
            setError(t('common.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <button onClick={() => navigate('/products')} className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition">
                <ArrowLeft size={20} className="mr-1" />
                {t('common.back')}
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('products.create_new_product')}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.title')}</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.description')}</label>
                    <textarea
                        name="description"
                        required
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.category')}</label>
                        <select
                            name="category"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase()}`) || cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.original_price')} (MAD)</label>
                        <input
                            type="number"
                            name="originalPriceAmount"
                            required
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.originalPriceAmount}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.picture_url')}</label>
                    <input
                        type="url"
                        name="pictureUrl"
                        placeholder="https://example.com/image.jpg"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.pictureUrl}
                        onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('products.picture_url_hint')}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.gtin_optional')}</label>
                    <input
                        type="text"
                        name="gtin"
                        placeholder="EAN / UPC / Barcode"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.gtin}
                        onChange={handleChange}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {loading && <Loader className="animate-spin" size={20} />}
                        {t('products.save_product')}
                    </button>
                </div>
            </form>
        </div>
    );
}
