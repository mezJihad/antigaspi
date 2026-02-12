import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit, Trash2, Upload } from 'lucide-react';
import api from '../services/api';

export default function ProductList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Get Seller ID first
                const sellerRes = await api.get('/Sellers/me');
                const sellerId = sellerRes.data.id || sellerRes.data.Id;

                if (sellerId) {
                    const productsRes = await api.get(`/products/seller/${sellerId}`);
                    setProducts(productsRes.data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            await api.post('/products/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Refresh list
            const sellerRes = await api.get('/Sellers/me');
            const sellerId = sellerRes.data.id || sellerRes.data.Id;
            if (sellerId) {
                const productsRes = await api.get(`/products/seller/${sellerId}`);
                setProducts(productsRes.data);
            }
            alert(t('products.import_success'));
        } catch (error) {
            console.error("Import failed:", error);
            alert(t('products.import_error'));
        } finally {
            setLoading(false);
            e.target.value = null; // Reset input
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('products.my_products')}</h1>
                    <p className="text-gray-500 mt-1">{t('products.manage_catalog')}</p>
                </div>
                <div className="flex gap-2">
                    <label className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-medium cursor-pointer">
                        <Upload size={20} />
                        {t('products.import_csv')}
                        <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                    </label>
                    <Link to="/create-product" className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 font-medium">
                        <Plus size={20} />
                        {t('products.add_product')}
                    </Link>
                </div>
            </div>

            {/* Import Status Notification? */}

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder={t('products.search_placeholder')}
                    className="pl-10 w-full md:w-1/3 border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.image')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.category')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('products.original_price')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                                            {product.pictureUrl ? (
                                                <img src={product.pictureUrl} alt={product.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.originalPrice.amount} {product.originalPrice.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    {t('products.no_products_found')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
