import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2 } from 'lucide-react';
import Notification from '../components/Notification';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [offers, setOffers] = useState([]);
    const [mySellerId, setMySellerId] = useState(null);
    const [sellerProfile, setSellerProfile] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (location.state?.successMessage) {
            setNotification({ type: 'success', message: location.state.successMessage });
            // Clear location state to prevent showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;

            // Fetch My Seller ID
            try {
                const sellerRes = await fetch(`${API_URL}/Sellers/me`, {
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
                const offersRes = await fetch(`${API_URL}/Sellers/me/offers`, {
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

    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, offerId: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (offerId) => {
        setDeleteConfirmation({ show: true, offerId });
    };

    const confirmDelete = async () => {
        const { offerId } = deleteConfirmation;
        if (!offerId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`${API_URL}/Offers/${offerId}/cancel?userId=${sellerProfile.userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setOffers(prev => prev.filter(o => o.id !== offerId));
                setDeleteConfirmation({ show: false, offerId: null });
                setNotification({ type: 'success', message: t('seller_dashboard.offer_deleted_success') });
            } else {
                setNotification({ type: 'error', message: t('seller_dashboard.delete_error') });
            }
        } catch (e) {
            console.error(e);
            setNotification({ type: 'error', message: t('seller_dashboard.network_error') });
        }
    };

    const [shopDeleteConfirmation, setShopDeleteConfirmation] = useState({ show: false, sellerId: null });

    const confirmShopDelete = async () => {
        const { sellerId } = shopDeleteConfirmation;
        if (!sellerId) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`${API_URL}/Sellers/${sellerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setShopDeleteConfirmation({ show: false, sellerId: null });
                setMySellerId(null);
                setSellerProfile(null);
                setOffers([]);
                setNotification({ type: 'success', message: t('seller_dashboard.shop_deleted_success') });
            } else {
                setNotification({ type: 'error', message: t('seller_dashboard.delete_error') });
            }
        } catch (e) {
            console.error(e);
            setNotification({ type: 'error', message: t('seller_dashboard.network_error') });
        }
    };

    const myOffers = offers; // Already filtered by backend
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(i18n.language);
    };

    return (
        <div className='p-8 max-w-7xl mx-auto'>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className='text-3xl font-bold text-gray-900'>{t('seller_dashboard.title')}</h1>
                {mySellerId && (
                    <Link to='/create-offer' className='bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 font-medium'>
                        {t('seller_dashboard.new_offer')}
                    </Link>
                )}
            </div>

            <div className='mb-8'>
                {!mySellerId ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">{t('seller_dashboard.no_profile_title')}</h3>
                            <p className="text-blue-700">{t('seller_dashboard.no_profile_desc')}</p>
                        </div>
                        <Link to='/seller-register' className='bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition font-medium whitespace-nowrap'>
                            {t('seller_dashboard.create_shop_btn')}
                        </Link>
                    </div>
                ) : (
                    sellerProfile && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{sellerProfile.storeName}</h2>
                                    <p className="text-gray-600 mb-4">{sellerProfile.description}</p>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span>📍 {sellerProfile.street}, {sellerProfile.zipCode} {sellerProfile.city}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/edit-shop/${sellerProfile.id}`)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100"
                                        title={t('common.edit')}
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => setShopDeleteConfirmation({ show: true, sellerId: sellerProfile.id })}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            <h2 className='text-2xl font-bold text-gray-900 mb-6'>{t('seller_dashboard.published_offers')}</h2>
            {mySellerId ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {myOffers.length > 0 ? (
                        myOffers.map(offer => (
                            <div key={offer.id} className='border border-gray-100 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition'>
                                {offer.pictureUrl ? (
                                    <img src={offer.pictureUrl} alt={offer.title} className='w-full h-48 object-cover rounded-lg mb-4' />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                                        {t('seller_dashboard.no_image')}
                                    </div>
                                )}
                                <h3 className='text-xl font-bold text-gray-900 mb-1'>{offer.title}</h3>
                                <p className='text-gray-500 text-sm mb-3 line-clamp-2'>{offer.description}</p>
                                <div className='flex justify-between items-end'>
                                    <div className="flex flex-col">
                                        <span className='text-xs text-gray-400 uppercase font-semibold'>{t('seller_dashboard.price')}</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className='font-bold text-2xl text-green-600'>{offer.price} Dhs</span>
                                            {offer.originalPrice && (
                                                <span className='line-through text-gray-400 text-sm'>{offer.originalPrice} Dhs</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <span className='text-xs text-gray-400 uppercase font-semibold'>{t('seller_dashboard.validity')}</span>
                                        <div className="text-sm font-medium text-gray-700 flex flex-col items-end">
                                            <span>{t('seller_dashboard.from')} {formatDate(offer.startDate)}</span>
                                            {offer.endDate && (
                                                <span>{t('seller_dashboard.to')} {formatDate(offer.endDate)}</span>
                                            )}

                                            {/* DLC Display */}
                                            <div className="mt-1 text-xs font-bold text-red-500 flex items-center gap-1">
                                                <span>⚠️ {t('seller_dashboard.dlc')}: {formatDate(offer.expirationDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                    <button
                                        onClick={() => navigate(`/edit-offer/${offer.id}`)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title={t('common.edit')}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(offer.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className='text-gray-500 font-medium'>{t('seller_dashboard.no_offers')}</p>
                            <Link to='/create-offer' className='inline-block mt-4 text-green-600 font-medium hover:underline'>
                                {t('seller_dashboard.publish_first_offer')}
                            </Link>
                        </div>
                    )
                    }
                </div >
            ) : (
                <p className='text-gray-500 italic'>{t('seller_dashboard.register_shop_hint')}</p>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="bg-red-100 p-3 rounded-full">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{t('seller_dashboard.delete_confirm_title')}</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {t('seller_dashboard.delete_confirm_desc')} <br />
                            <span className="text-sm text-gray-500">{t('seller_dashboard.delete_irreversible')}</span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {t('seller_dashboard.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        {t('seller_dashboard.delete_btn')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Shop Delete Confirmation Modal */}
            {shopDeleteConfirmation.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="bg-red-100 p-3 rounded-full">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{t('seller_dashboard.delete_shop_title')}</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            <span dangerouslySetInnerHTML={{ __html: t('seller_dashboard.delete_shop_desc', { storeName: sellerProfile?.storeName }) }} /> <br />
                            <span className="text-sm text-red-500 font-bold">{t('seller_dashboard.delete_shop_warning')}</span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShopDeleteConfirmation({ show: false, sellerId: null })}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {t('seller_dashboard.cancel')}
                            </button>
                            <button
                                onClick={confirmShopDelete}
                                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        {t('seller_dashboard.delete_all_btn')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
