import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Euro, Tag, Type, Image as ImageIcon, Keyboard, Search, Plus, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import VirtualKeyboard from '../components/VirtualKeyboard';

export default function CreateOffer() {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];

    const CAT_OPTIONS = [
        { value: 0, label_key: 'search.cat_bakery' },
        { value: 1, label_key: 'search.cat_fruits' },
        { value: 2, label_key: 'search.cat_meat' },
        { value: 3, label_key: 'search.cat_dairy' },
        { value: 4, label_key: 'search.cat_prepared' },
        { value: 5, label_key: 'search.cat_grocery' },
        { value: 6, label_key: 'search.cat_surprise' },
        { value: 7, label_key: 'search.cat_other' }
    ];

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 0,
        priceAmount: '',
        originalPriceAmount: '',
        startDate: today,
        endDate: '',
        expirationDate: '',
        pictureUrl: ''
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [myProducts, setMyProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');

    const [sourceLanguage, setSourceLanguage] = useState(i18n.language || 'fr');
    const [imageMode, setImageMode] = useState('file');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Virtual Keyboard
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [activeInput, setActiveInput] = useState(null);

    useEffect(() => {
        // Fetch products on mount
        async function fetchProducts() {
            setLoadingProducts(true);
            try {
                const sellerRes = await api.get('/Sellers/me');
                if (sellerRes.data && (sellerRes.data.id || sellerRes.data.Id)) {
                    const sellerId = sellerRes.data.id || sellerRes.data.Id;
                    const productsRes = await api.get(`/products/seller/${sellerId}`);
                    setMyProducts(productsRes.data);
                }
            } catch (e) {
                console.error("Error fetching products", e);
            } finally {
                setLoadingProducts(false);
            }
        }
        fetchProducts();
    }, []);

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setFormData(prev => ({
            ...prev,
            title: product.title,
            description: product.description,
            category: product.category, // Assuming category matches enum value
            originalPriceAmount: product.originalPrice.amount,
            pictureUrl: product.pictureUrl
        }));
        setShowProductSearch(false);
    };

    const handleClearProduct = () => {
        setSelectedProduct(null);
        setFormData(prev => ({
            ...prev,
            title: '',
            description: '',
            category: 0,
            originalPriceAmount: '',
            pictureUrl: ''
        }));
        setImageFile(null);
    };

    const handleKeyboardChange = (input) => {
        if (activeInput) {
            setFormData(prev => ({ ...prev, [activeInput]: input }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const sellerRes = await api.get('/Sellers/me');
            let sellerId = null;
            if (sellerRes.data && (sellerRes.data.id || sellerRes.data.Id)) {
                sellerId = sellerRes.data.id || sellerRes.data.Id;
            } else {
                alert(t('create_offer.error_no_shop'));
                setLoading(false);
                return;
            }

            const body = new FormData();
            body.append('sellerId', sellerId);
            body.append('priceAmount', formData.priceAmount);
            body.append('priceCurrency', 'MAD');
            body.append('startDate', formData.startDate);
            if (formData.endDate) body.append('endDate', formData.endDate);
            body.append('expirationDate', formData.expirationDate);
            body.append('sourceLanguage', sourceLanguage);
            body.append('originalPriceCurrency', 'MAD');

            if (selectedProduct) {
                body.append('productId', selectedProduct.id);
                // We don't need to send Title/Desc/etc if product is selected, BUT
                // backend requires OriginalPriceAmount if we want to override it? 
                // Currently backend command takes it. Let's send it to be safe or if we allow override.
                // The backend implementation of CreateOffer creates ValueObjects from request.PriceAmount etc.
                // It does NOT use Product's original price in Offer creation logic yet (it uses request.OriginalPriceAmount).
                // So we MUST send originalPriceAmount.
                body.append('originalPriceAmount', formData.originalPriceAmount);

                // Title/Desc/Category are optional in backend now if ProductId is present.
            } else {
                // New Product / Implicit Creation
                body.append('title', formData.title);
                body.append('description', formData.description);
                body.append('category', formData.category);
                body.append('originalPriceAmount', formData.originalPriceAmount);

                if (imageMode === 'url' && formData.pictureUrl) {
                    body.append('pictureUrl', formData.pictureUrl);
                } else if (imageFile) {
                    body.append('pictureFile', imageFile);
                }
            }

            await api.post('/Offers', body, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/dashboard', { state: { successMessage: t('create_offer.success_msg') } });

        } catch (error) {
            console.error("Error creating offer", error);
            alert(t('errors.create_offer_failed'));
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = myProducts.filter(p =>
        p.title.toLowerCase().includes(productSearchTerm.toLowerCase())
    );

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-green-600 px-8 py-6'>
                        <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
                            <Tag className='w-8 h-8 rtl:flip' />
                            {t('create_offer.title')}
                        </h1>
                        <p className='text-green-100 mt-2'>{t('create_offer.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className='p-8 space-y-8'>

                        {/* Product Selection Section */}
                        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                            <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                                <Package size={20} />
                                {t('create_offer.select_product_title') || "Select a Product"}
                            </h2>

                            {!selectedProduct ? (
                                <div>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowProductSearch(!showProductSearch)}
                                            className="flex-1 bg-white border border-green-200 text-green-700 py-3 rounded-lg font-medium shadow-sm hover:bg-green-50 transition flex items-center justify-center gap-2"
                                        >
                                            <Search size={18} />
                                            {t('create_offer.search_my_products') || "Select Existing Product"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/create-product')} // Assuming redirect to create product page? Or just fill form below?
                                            // Actually, "Create New" just means filling the form below manually.
                                            className="hidden" // Hiding for now, User can just fill form below
                                        >
                                        </button>
                                    </div>

                                    {showProductSearch && (
                                        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-2">
                                            <input
                                                type="text"
                                                placeholder={t('common.search') + "..."}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:ring-green-500 outline-none"
                                                value={productSearchTerm}
                                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                            />
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(product => (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => handleProductSelect(product)}
                                                        className="p-3 hover:bg-green-50 cursor-pointer rounded-md flex items-center gap-3 border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                            {product.pictureUrl && <img src={product.pictureUrl} alt="" className="h-full w-full object-cover" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{product.title}</p>
                                                            <p className="text-xs text-gray-500">{product.originalPrice.amount} {product.originalPrice.currency}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    {t('products.no_products_found')}
                                                    <br />
                                                    <button type="button" onClick={() => navigate('/create-product')} className="text-green-600 font-bold mt-1 hover:underline">
                                                        {t('products.add_product')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {t('create_offer.or_fill_details') || "Or fill details below to create a new one"}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {selectedProduct.pictureUrl ? (
                                                <img src={selectedProduct.pictureUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400"><Package /></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{selectedProduct.title}</h3>
                                            <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearProduct}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition"
                                    >
                                        {t('common.change') || "Change"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Product Details Form (Disabled/ReadOnly if Product Selected) */}
                        <div className={`space-y-4 ${selectedProduct ? 'opacity-70 pointer-events-none' : ''}`}>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1 flex justify-between'>
                                    {t('create_offer.offer_title')}
                                    {!selectedProduct && i18n.language === 'ar' && (
                                        <button type="button" onClick={() => { setActiveInput('title'); setShowKeyboard(true); }} className="text-gray-500 hover:text-green-600">
                                            <Keyboard size={18} />
                                        </button>
                                    )}
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-400'>
                                        <Type size={18} />
                                    </div>
                                    <input
                                        required={!selectedProduct}
                                        type="text"
                                        name="title"
                                        className='block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        onFocus={() => setActiveInput('title')}
                                        readOnly={!!selectedProduct}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1 flex justify-between'>
                                    {t('create_offer.description')}
                                    {!selectedProduct && i18n.language === 'ar' && (
                                        <button type="button" onClick={() => { setActiveInput('description'); setShowKeyboard(true); }} className="text-gray-500 hover:text-green-600">
                                            <Keyboard size={18} />
                                        </button>
                                    )}
                                </label>
                                <textarea
                                    required={!selectedProduct}
                                    name="description"
                                    rows={3}
                                    className='block w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition'
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    onFocus={() => setActiveInput('description')}
                                    readOnly={!!selectedProduct}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>{t('create_offer.category')}</label>
                                    <select
                                        className='block w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition bg-white disabled:bg-gray-100'
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: parseInt(e.target.value) })}
                                        disabled={!!selectedProduct}
                                    >
                                        {CAT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{t(opt.label_key)}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Original Price (ReadOnly if selected) */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>{t('create_offer.price_original')}</label>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-400'>
                                            <span className="text-sm font-bold">Dhs</span>
                                        </div>
                                        <input
                                            required
                                            type='number'
                                            step="0.01"
                                            className='block w-full pl-12 pr-3 rtl:pr-12 rtl:pl-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition text-gray-500 line-through'
                                            value={formData.originalPriceAmount}
                                            onChange={e => setFormData({ ...formData, originalPriceAmount: e.target.value })}
                                            readOnly={!!selectedProduct}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!selectedProduct && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>{t('create_offer.illustration')}</label>
                                    <div className="flex gap-4 mb-4">
                                        <button type="button" onClick={() => setImageMode('file')} className={`flex-1 py-2 text-sm font-medium rounded-lg border ${imageMode === 'file' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}>{t('create_offer.upload_image')}</button>
                                        <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-2 text-sm font-medium rounded-lg border ${imageMode === 'url' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}>{t('create_offer.url_link')}</button>
                                    </div>
                                    {imageMode === 'url' ? (
                                        <div className='relative'>
                                            <ImageIcon size={18} className="absolute left-3 top-3 text-gray-400" />
                                            <input type='url' placeholder='https://...' className='block w-full pl-10 py-2 border border-gray-300 rounded-lg' value={formData.pictureUrl} onChange={e => setFormData({ ...formData, pictureUrl: e.target.value })} />
                                        </div>
                                    ) : (
                                        <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                                    )}
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-200" />

                        {/* Offer Details (Always Editable) */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800">{t('create_offer.offer_details') || "Offer Details"}</h3>

                            {/* Discounted Price */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('create_offer.price_antigaspi')}</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-400'>
                                        <span className="text-sm font-bold">Dhs</span>
                                    </div>
                                    <input
                                        required
                                        type='number'
                                        step="0.01"
                                        placeholder='0.00'
                                        className='block w-full pl-12 pr-3 rtl:pr-12 rtl:pl-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition font-bold text-blue-900'
                                        value={formData.priceAmount}
                                        onChange={e => setFormData({ ...formData, priceAmount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Date Validity */}
                            <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                                <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                                    <Calendar size={16} />
                                    {t('create_offer.validity_title')}
                                </h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-xs font-medium text-gray-500 uppercase mb-1'>{t('create_offer.start_date')}</label>
                                        <input
                                            required
                                            type='date'
                                            className='block w-full px-3 py-2 border border-gray-300 rounded-lg'
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-xs font-medium text-gray-500 uppercase mb-1'>{t('create_offer.end_date')}</label>
                                        <input
                                            type='date'
                                            min={formData.startDate}
                                            className='block w-full px-3 py-2 border border-gray-300 rounded-lg'
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className='block text-xs font-medium text-red-500 uppercase mb-1'>{t('create_offer.dlc')}</label>
                                        <input
                                            required
                                            type='date'
                                            min={formData.endDate || formData.startDate}
                                            className='block w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-red-500'
                                            value={formData.expirationDate}
                                            onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='pt-4 flex gap-4'>
                            <button
                                type='button'
                                onClick={() => navigate('/dashboard')}
                                className='w-full sm:w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition'
                            >
                                {t('create_offer.cancel')}
                            </button>
                            <button
                                type='submit'
                                disabled={loading}
                                className={`w-full sm:w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? t('create_offer.publishing') : t('create_offer.publish_btn')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showKeyboard && activeInput && (
                <VirtualKeyboard
                    onChange={handleKeyboardChange}
                    inputName={activeInput}
                    value={formData[activeInput]}
                    onClose={() => setShowKeyboard(false)}
                />
            )}
        </div>
    );
}
