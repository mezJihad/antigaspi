import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, resendVerification } from '../services/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Leaf, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import heroImage from '../assets/auth-hero.png';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccess(location.state.successMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        setShowResend(false); // Reset on new attempt

        try {
            const data = await loginApi(email, password);
            login(data);
            if (data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login error:", error);
            if (error.message && error.message.includes("ACCOUNT_SUSPENDED")) {
                setError(t('auth.error_suspended'));
            } else if (error.message && error.message.includes("EMAIL_NOT_VERIFIED")) {
                setError(t('auth.error_verify_email'));
                setShowResend(true);
            } else if (error.response && error.response.status === 403 && error.response.data && error.response.data.message == "EMAIL_NOT_VERIFIED") {
                setError(t('auth.error_verify_email'));
                setShowResend(true);
            } else if (error.response && error.response.status === 403 && error.response.data && error.response.data.message == "ACCOUNT_SUSPENDED") {
                setError(t('auth.error_suspended'));
            } else {
                setError(t('auth.error_invalid_credentials'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendVerification(email);
            setSuccess(t('auth.success_resend'));
            setShowResend(false);
            setCooldown(60); // Start 60s cooldown
        } catch (err) {
            if (err.response && err.response.status === 429) {
                setError(t('auth.error_too_many_attempts'));
            } else {
                setError(t('auth.error_resend_failed'));
            }
            setCooldown(60); // Even on error, prevent spamming
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex text-gray-900 font-sans">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                    src={heroImage}
                    alt="Fresh produce"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 flex flex-col h-full p-12 text-white">
                    <div className="max-w-md my-auto">
                        <h1 className="text-4xl font-bold mb-6 leading-tight">{t('auth.welcome_back')}</h1>
                        <p className="text-lg text-gray-200 mb-8">{t('auth.hero_subtitle')}</p>
                    </div>
                    <div className="text-sm text-gray-400 mt-auto">{t('auth.copyright')}</div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <div className="lg:hidden mx-auto h-12 w-12 text-green-600 flex justify-center items-center mb-4">
                            <Leaf size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{t('auth.login_title')}</h2>
                        <p className="mt-2 text-gray-600">{t('auth.dashboard_access')}</p>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm flex items-center gap-2">
                            <CheckCircle2 size={18} /> {success}
                        </div>
                    )}

                    {error && (
                        <div className={`mb-6 p-4 rounded-lg border text-sm ${showResend
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {showResend ? <AlertCircle size={18} className="text-amber-600" /> : <span>⚠️</span>}
                                <span className={showResend ? "font-medium" : ""}>{error}</span>
                            </div>
                            {showResend && (
                                <div className="mt-3 ml-1">
                                    <button
                                        onClick={handleResend}
                                        disabled={isResending || cooldown > 0}
                                        className="text-xs font-semibold bg-white border border-amber-300 text-amber-900 px-4 py-2 rounded shadow-sm hover:bg-amber-50 hover:border-amber-400 transition-all disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed"
                                    >
                                        {isResending ? t('auth.sending') : cooldown > 0 ? `${t('auth.retry_in', { seconds: cooldown })}` : t('auth.resend_btn')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="mt-2">
                                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-500 font-medium">{t('auth.forgot_password')}</Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t('auth.logging_in') : (
                                <>
                                    {t('auth.submit')} <ArrowRight size={18} className="rtl:rotate-180" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center text-sm text-gray-600 mb-4">
                            {t('auth.no_account')} <Link to="/register" className="text-green-600 font-medium hover:underline">{t('auth.create_seller_account')}</Link>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">{t('auth.buyer_prompt')}</p>
                            <Link to="/" className="inline-block mt-2 text-sm font-medium text-gray-900 border-b border-gray-900 hover:text-green-600 hover:border-green-600 transition-colors">
                                {t('auth.explore_link')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
