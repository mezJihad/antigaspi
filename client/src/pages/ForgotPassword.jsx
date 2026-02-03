import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/auth';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            await forgotPassword(email);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setError(t('common.error'));
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.check_email_title')}</h2>
                    <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: t('auth.check_email_desc', { email }) }}></p>
                    <Link to="/login" className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('auth.back_to_login')}
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
                    <h2 className="text-xl font-semibold text-gray-800">{t('auth.forgot_password_title')}</h2>
                    <p className="text-gray-500 text-sm mt-2">{t('auth.forgot_password_desc')}</p>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 rtl:right-3 rtl:left-auto top-2.5" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {status === 'loading' ? t('auth.sending') : t('auth.send_link_btn')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('auth.back_to_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
