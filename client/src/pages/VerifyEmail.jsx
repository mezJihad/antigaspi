import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/auth';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying, success, error, missing-params
    const [message, setMessage] = useState('');

    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === true) return;

        const queryParams = new URLSearchParams(location.search);
        const email = queryParams.get('email');
        const token = queryParams.get('token');

        if (!email || !token) {
            setStatus('missing-params');
            return;
        }

        const verify = async () => {
            effectRan.current = true; // Mark as ran
            try {
                await verifyEmail(email, token);
                setStatus('success');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.message || t('auth.verify_link_invalid'));
            }
        };

        verify();
    }, [location.search, navigate, t]);

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.email_verified_title')}</h2>
                    <p className="text-gray-600 mb-6">{t('auth.email_verified_desc')}</p>
                    <button onClick={() => navigate('/login')} className="text-green-600 font-medium hover:underline">
                        {t('auth.login_immediate')}
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.verification_failed_title')}</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button onClick={() => navigate('/register')} className="text-green-600 font-medium hover:underline">
                        {t('auth.return_register')}
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'missing-params') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.verify_instruction_title')}</h2>
                    <p className="text-gray-600 mb-6">{t('auth.verify_instruction_desc')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="flex justify-center mb-6">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('auth.verifying')}</h2>
            </div>
        </div>
    );
}
