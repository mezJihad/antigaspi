import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Euro, Tag, Type, Image as ImageIcon, ArrowLeft, Edit, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VirtualKeyboard from '../components/VirtualKeyboard';

const API_URL = import.meta.env.VITE_API_URL;

export default function EditOffer() {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const CAT_OPTIONS = [
        { value: 0, label_key: 'search.cat_bakery', key: 'Bakery' },
        { value: 1, label_key: 'search.cat_fruits', key: 'Produce' },
        { value: 2, label_key: 'search.cat_meat', key: 'MeatFish' },
        { value: 3, label_key: 'search.cat_dairy', key: 'Dairy' },
        { value: 4, label_key: 'search.cat_prepared', key: 'PreparedMeals' },
        { value: 5, label_key: 'search.cat_grocery', key: 'Groceries' },
        { value: 6, label_key: 'search.cat_surprise', key: 'SurpriseBag' },
        { value: 7, label_key: 'search.cat_other', key: 'Other' }
    ];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 0, // Default to Bakery
        priceAmount: '',
        originalPriceAmount: '',
        startDate: '',
        endDate: '',
        expirationDate: '',
        pictureUrl: ''
    });

    const [sourceLanguage, setSourceLanguage] = useState('fr');
    const [imageMode, setImageMode] = useState('file'); // 'file' or 'url'
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Virtual Keyboard State
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [activeInput, setActiveInput] = useState(null);

    const handleKeyboardChange = (input) => {
        if (activeInput) {
            setFormData(prev => ({
                ...prev,
                [activeInput]: input
            }));
        }
    };

    // Load Offer Data
    useEffect(() => {
        async function fetchOffer() {
            try {
                const res = await fetch(`${API_URL}/Offers/${id}`);
                if (res.ok) {
                    const data = await res.json();

                    // Map category string to int
                    let catVal = 0;
                    // Helper to map backend string to ID.
                    // Backend Enum: Bakery=0, Produce=1, MeatFish=2, Dairy=3, PreparedMeals=4, Groceries=5, SurpriseBag=6, Other=7
                    const catMap = {
                        'Bakery': 0, 'Produce': 1, 'MeatFish': 2, 'Dairy': 3,
                        'PreparedMeals': 4, 'Groceries': 5, 'SurpriseBag': 6, 'Other': 7
                    };
                    if (data.category && catMap.hasOwnProperty(data.category)) {
                        catVal = catMap[data.category];
                    }

                    setFormData({
                        title: data.title,
                        description: data.description,
                        category: catVal,
                        priceAmount: data.price, // It's already a number
                        originalPriceAmount: data.originalPrice, // It's already a number
                        startDate: data.startDate.split('T')[0],
                        endDate: data.endDate ? data.endDate.split('T')[0] : '',
                        expirationDate: data.expirationDate.split('T')[0],
                        pictureUrl: data.pictureUrl || ''
                    });
                    // Set source language if available, otherwise default fallback
                    if (data.sourceLanguage) {
                        setSourceLanguage(data.sourceLanguage);
                    }
                    if (data.pictureUrl) setImageMode('url');
                } else {
                    alert(t('edit_offer.error_not_found'));
                    navigate('/dashboard');
                }
            } catch (e) {
                console.error("Error loading offer", e);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchOffer();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = new FormData();
            // SellerId not needed for update

            body.append('title', formData.title);
            body.append('description', formData.description);
            body.append('category', formData.category);
            body.append('priceAmount', formData.priceAmount);
            body.append('priceCurrency', 'MAD');
            if (formData.originalPriceAmount) body.append('originalPriceAmount', formData.originalPriceAmount);
            body.append('originalPriceCurrency', 'MAD');
            body.append('startDate', formData.startDate);
            if (formData.endDate) body.append('endDate', formData.endDate);
            body.append('expirationDate', formData.expirationDate);
            body.append('sourceLanguage', sourceLanguage);

            if (imageMode === 'url') {
                body.append('pictureUrl', formData.pictureUrl);
            } else if (imageFile) {
                body.append('pictureFile', imageFile);
                body.append('pictureUrl', '');
            } else {
                // Keep existing? If we send empty, implementation might overwrite?
                // Backend: "pictureUrl ?? """.
                // In Entity Update: if (!string.IsNullOrWhiteSpace(pictureUrl)) PictureUrl = pictureUrl;
                // So if we send empty string, it won't update. That's good, preserves existing.
                body.append('pictureUrl', '');
            }

            const response = await fetch(`${API_URL}/Offers/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: body
            });

            if (response.ok) { // 204 No Content
                navigate('/dashboard');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Update failed", errorData);
                if (errorData.message === 'UPDATE_OFFER_FAILED') {
                    alert(`${t('errors.update_offer_failed')}: ${errorData.detail || ''}`);
                } else {
                    alert(`${t('errors.update_offer_failed')}: ${errorData.detail || ''}`);
                }
            }
        } catch (error) {
            console.error("Error updating offer", error);
            alert(t('errors.generic_error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.title) return <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>;

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-2xl mx-auto'>
                <div className="mb-6">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-600 hover:text-green-600 font-medium">
                        <ArrowLeft size={20} className="mr-2 rtl:flip" /> {t('edit_offer.back_dashboard')}
                    </button>
                </div>

                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-blue-600 px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700'>
                        <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
                            <Edit size={28} className="rtl:flip" />
                            {t('edit_offer.title')}
                        </h1>
                        <p className='text-blue-100 mt-2'>{t('edit_offer.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className='p-8 space-y-6'>

                        {/* Title & Description */}
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1 flex justify-between'>
                                    {t('create_offer.offer_title')}
                                    {i18n.language === 'ar' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveInput('title');
                                                setShowKeyboard(true);
                                            }}
                                            className="text-gray-500 hover:text-blue-600 transition"
                                            title="Clavier Virtuel"
                                        >
                                            <Keyboard size={18} />
                                        </button>
                                    )}
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-400'>
                                        <Type size={18} />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        name="title"
                                        placeholder={t('create_offer.title_placeholder')}
                                        className='block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition'
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        onFocus={() => {
                                            setActiveInput('title');
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1 flex justify-between'>
                                    {t('create_offer.description')}
                                    {i18n.language === 'ar' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveInput('description');
                                                setShowKeyboard(true);
                                            }}
                                            className="text-gray-500 hover:text-blue-600 transition"
                                            title="Clavier Virtuel"
                                        >
                                            <Keyboard size={18} />
                                        </button>
                                    )}
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    rows={4}
                                    placeholder={t('edit_offer.desc_placeholder')}
                                    className='block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition'
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    onFocus={() => setActiveInput('description')}
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('create_offer.category')}</label>
                                <select
                                    className='block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white'
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: parseInt(e.target.value) })}
                                >
                                    {CAT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{t(opt.label_key)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Prices */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
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
                                        placeholder='0.00'
                                        className='block w-full pl-12 pr-3 rtl:pr-12 rtl:pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition text-gray-500 line-through'
                                        value={formData.originalPriceAmount}
                                        onChange={e => setFormData({ ...formData, originalPriceAmount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date Validity */}
                        <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                            <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                                <Calendar size={16} className="rtl:ml-2" />
                                {t('create_offer.validity_title')}
                            </h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-xs font-medium text-gray-500 uppercase mb-1'>{t('create_offer.start_date')}</label>
                                    <input
                                        required
                                        type='date'
                                        className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition'
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-500 uppercase mb-1'>{t('create_offer.end_date')}</label>
                                    <input
                                        type='date'
                                        min={formData.startDate}
                                        className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition'
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
                                        className='block w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-red-500 focus:border-red-500 transition'
                                        value={formData.expirationDate}
                                        onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Picture Input (File or URL) */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>{t('create_offer.illustration')}</label>

                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setImageMode('file')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${imageMode === 'file' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                >
                                    {t('create_offer.upload_image')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageMode('url')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${imageMode === 'url' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                >
                                    {t('create_offer.url_link')}
                                </button>
                            </div>

                            {imageMode === 'url' ? (
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-400'>
                                        <ImageIcon size={18} />
                                    </div>
                                    <input
                                        type='url'
                                        required={imageMode === 'url'}
                                        placeholder='https://exemple.com/image.jpg'
                                        className='block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition'
                                        value={formData.pictureUrl}
                                        onChange={e => setFormData({ ...formData, pictureUrl: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-white relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required={imageMode === 'file' && !formData.pictureUrl} // allow keep existing if empty
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="space-y-1 text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative font-medium text-blue-600 rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 truncate max-w-xs">
                                                {imageFile ? imageFile.name : t('edit_offer.change_file')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{t('edit_offer.keep_image_hint')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='pt-4 flex gap-4'>
                            <button
                                type='button'
                                onClick={() => navigate('/dashboard')}
                                className='w-full sm:w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition'
                            >
                                {t('create_offer.cancel')}
                            </button>
                            <button
                                type='submit'
                                disabled={loading}
                                className={`w-full sm:w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? t('edit_offer.saving') : t('edit_offer.save_btn')}
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
