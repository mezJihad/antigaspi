import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, Shield, Lock, Trash2, StopCircle, PlayCircle, MapPin } from 'lucide-react';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirmer'
    });

    // Redirect if not admin
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (token) fetchItems();
    }, [token]);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_URL}/Admin/users-overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            } else {
                setNotification({ type: 'error', message: 'Impossible de charger la liste des utilisateurs.' });
            }
        } catch (e) {
            console.error(e);
            setNotification({ type: 'error', message: 'Erreur réseau.' });
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (action, item) => {
        let config = {
            isOpen: true,
            onConfirm: () => { }, // placeholder
            cancelText: 'Annuler'
        };

        const targetName = `${item.firstName} ${item.lastName}`;

        if (action === 'suspend') {
            config = {
                ...config,
                type: 'warning',
                title: 'Désactiver l\'utilisateur ?',
                message: (
                    <>
                        Êtes-vous sûr de vouloir désactiver <strong>{targetName}</strong> ?<br />
                        <span className="text-sm text-gray-500">Il ne pourra plus se connecter. Si c'est un vendeur, sa boutique sera aussi suspendue.</span>
                    </>
                ),
                confirmText: 'Désactiver',
                onConfirm: () => executeAction(item.userId, 'deactivate')
            };
        } else if (action === 'activate') {
            config = {
                ...config,
                type: 'success',
                title: 'Activer l\'utilisateur ?',
                message: (
                    <>
                        Êtes-vous sûr de vouloir activer <strong>{targetName}</strong> ?<br />
                        <span className="text-sm text-gray-500">Il pourra de nouveau se connecter.</span>
                    </>
                ),
                confirmText: 'Activer',
                onConfirm: () => executeAction(item.userId, 'activate')
            };
        } else if (action === 'delete') {
            config = {
                ...config,
                type: 'danger',
                title: 'Supprimer l\'utilisateur ?',
                message: (
                    <>
                        Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT <strong>{targetName}</strong> ?<br />
                        <span className="text-sm text-red-500 font-bold">Cette action est irréversible et supprimera sa boutique et ses offres.</span>
                    </>
                ),
                confirmText: 'Supprimer',
                onConfirm: () => executeAction(item.userId, 'delete')
            };
        }

        setModalConfig(config);
    };

    const executeAction = async (id, action) => {
        setModalConfig(prev => ({ ...prev, isOpen: false })); // Close modal

        try {
            let url = '', method = '';
            // New User Endpoints
            if (action === 'deactivate') { url = `/Admin/users/${id}/deactivate`; method = 'POST'; }
            if (action === 'activate') { url = `/Admin/users/${id}/activate`; method = 'POST'; }
            if (action === 'delete') { url = `/Admin/users/${id}`; method = 'DELETE'; }

            const res = await fetch(`${API_URL}${url}`, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok || res.status === 204) {
                setNotification({ type: 'success', message: 'Action effectuée avec succès.' });
                fetchItems();
            } else {
                setNotification({ type: 'error', message: 'Erreur lors de l\'opération.' });
            }
        } catch (e) {
            setNotification({ type: 'error', message: 'Erreur réseau.' });
        }
    };

    const getUserStatusBadge = (isActive) => {
        if (isActive) {
            return <span className='px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit'><Check size={12} /> ACTIF</span>;
        } else {
            return <span className='px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit'><Lock size={12} /> INACTIF</span>;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement du tableau de bord admin...</div>;

    return (
        <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto'>
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}

                <div className='bg-indigo-900 rounded-xl p-8 mb-8 text-white shadow-lg'>
                    <h1 className='text-3xl font-bold flex items-center gap-3'>
                        <Shield size={32} /> Administration AntiGaspi
                    </h1>
                    <p className='mt-2 text-indigo-200'>Gestion centralisée des utilisateurs.</p>
                </div>

                <div className='bg-white rounded-xl shadow-md overflow-hidden'>
                    <div className='p-6 border-b border-gray-100'>
                        <h2 className='text-xl font-bold text-gray-800'>Tous les Utilisateurs ({items.length})</h2>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead className='bg-gray-50 text-gray-500 uppercase text-xs'>
                                <tr>
                                    <th className='p-4 font-semibold'>Utilisateur</th>
                                    <th className='p-4 font-semibold'>Boutique</th>
                                    <th className='p-4 font-semibold text-center'>Offres</th>
                                    <th className='p-4 font-semibold'>Statut Compte</th>
                                    <th className='p-4 font-semibold text-right'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {items.map(item => (
                                    <tr key={item.userId} className='hover:bg-gray-50 transition'>
                                        <td className='p-4'>
                                            <div className='font-bold text-gray-900'>{item.firstName} {item.lastName}</div>
                                            <div className='text-sm text-gray-500'>{item.email}</div>
                                            <div className='text-xs text-indigo-600 font-medium mt-1'>{item.role}</div>
                                        </td>
                                        <td className='p-4'>
                                            {item.storeName ? (
                                                <>
                                                    <div className='font-bold text-gray-900'>{item.storeName}</div>
                                                    <div className='flex items-center text-sm text-gray-600 gap-1'>
                                                        <MapPin size={12} /> {item.city || '-'}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Pas de boutique</span>
                                            )}
                                        </td>
                                        <td className='p-4 text-center'>
                                            {item.offerCount > 0 ? (
                                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                                    {item.offerCount}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className='p-4'>
                                            {getUserStatusBadge(item.isActive)}
                                        </td>
                                        <td className='p-4'>
                                            <div className='flex justify-end gap-2'>
                                                {item.role === 'ADMIN' ? (
                                                    <span className="text-gray-400 text-xs italic">Admin Système</span>
                                                ) : (
                                                    <>
                                                        {item.isActive ? (
                                                            <button
                                                                onClick={() => openConfirmModal('suspend', item)}
                                                                className='p-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition'
                                                                title='Désactiver l user'
                                                            >
                                                                <StopCircle size={18} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openConfirmModal('activate', item)}
                                                                className='p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition'
                                                                title='Activer l user'
                                                            >
                                                                <PlayCircle size={18} />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => openConfirmModal('delete', item)}
                                                            className='p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition'
                                                            title='Supprimer l user'
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={modalConfig.onConfirm}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                    confirmText={modalConfig.confirmText}
                />
            </div>
        </div>
    );
}
