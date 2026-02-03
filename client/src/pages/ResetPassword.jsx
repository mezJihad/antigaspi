import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token || !email) {
            setStatus('invalid');
            setError(t('auth.invalid_link_desc'));
        }
    }, [token, email, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setError(t('auth.password_mismatch'));
            return;
        }

        setStatus('loading');
        setError('');

        try {
            await resetPassword(email, token, password);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000); // Auto redirect
        } catch (err) {
            setStatus('error');
            setError(err.message || t('common.error'));
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.reset_password_success_title')}</h2>
                    <p className="text-gray-600 mb-6">
                        {t('auth.reset_password_success_desc')}
                    </p>
                    <Link to="/login" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                        {t('auth.login_now_btn')}
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.invalid_link_title')}</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/forgot-password" className="text-green-600 hover:underline">
                        {t('auth.request_new_link')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-600 mb-2">NoGaspi</h1>
                    <h2 className="text-xl font-semibold text-gray-800">{t('auth.reset_password_title')}</h2>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.new_password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 rtl:right-3 rtl:left-auto top-2.5" />
                            <button
                                type="button"
                                className="absolute right-3 rtl:left-3 rtl:right-auto top-2.5 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('auth.password_requirements')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirm_password')}</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 rtl:right-3 rtl:left-auto top-2.5" />
                            <button
                                type="button"
                                className="absolute right-3 rtl:left-3 rtl:right-auto top-2.5 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {status === 'loading' ? t('auth.resetting') : t('auth.reset_btn')}
                    </button>
                </form>
            </div>
        </div>
    );
}
