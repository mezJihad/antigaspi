import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerUser, login as loginUser } from '../services/auth';
import { registerSeller } from '../services/sellers';
import { Leaf, Store, ArrowRight, CheckCircle2, Keyboard } from 'lucide-react';
import heroImage from '../assets/auth-hero.png';
import { useTranslation } from 'react-i18next';
import VirtualKeyboard from '../components/VirtualKeyboard';

export default function Register() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();

    // Step 1: Account, Step 2: Store
    // Combining them into one seamless form for the user
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        termsAccepted: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        digit: false,
        special: false
    });

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        handleChange(e);
        setPasswordCriteria({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            digit: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Client-side validation
        const isValidPassword = Object.values(passwordCriteria).every(Boolean);
        if (!isValidPassword) {
            setError(t('auth.password_security'));
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create User Account
            const lang = i18n.language || window.localStorage.getItem('i18nextLng') || 'fr';
            await registerUser(formData.firstName, formData.lastName, formData.email, formData.password, 'SELLER', lang);

            // 2. Redirect to Verify Page
            // Passing email and status to show correct message
            navigate('/verify-email', {
                state: {
                    email: formData.email,
                    message: t('auth.verification_sent')
                }
            });

        } catch (err) {
            console.error("Registration Error Caught:", err);
            console.log("Error Message:", err.message);
            if (err.message === 'EMAIL_EXISTS') {
                setError(t('errors.email_exists'));
            } else if (err.message === 'WEAK_PASSWORD') {
                setError(t('errors.weak_password'));
            } else {
                setError(t('errors.generic_error'));
            }
            setIsLoading(false);
        }
    };

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

    const handleInvalid = (e) => {
        e.target.setCustomValidity(t('errors.required_field'));
    };

    const handleInput = (e) => {
        e.target.setCustomValidity('');
        handleChange(e);
    };

    const handleEmailInvalid = (e) => {
        if (e.target.validity.valueMissing) {
            e.target.setCustomValidity(t('errors.required_field'));
        } else if (e.target.validity.typeMismatch) {
            e.target.setCustomValidity(t('errors.invalid_email'));
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
                        <h1 className="text-4xl font-bold mb-6 leading-tight rtl:leading-normal">{t('auth.hero_title')}</h1>
                        <p className="text-lg text-gray-200 mb-8">{t('auth.hero_description')}</p>

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-full text-green-400"><CheckCircle2 size={20} /></div>
                                <span>{t('auth.hero_benefit_1')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-full text-green-400"><CheckCircle2 size={20} /></div>
                                <span>{t('auth.hero_benefit_2')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-400 mt-auto">{t('auth.copyright')}</div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">{t('auth.create_title')}</h2>
                        <p className="mt-2 text-gray-600">{t('auth.create_subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    {t('auth.first_name')}
                                    {i18n.language === 'ar' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveInput('firstName');
                                                setShowKeyboard(true);
                                            }}
                                            className="text-gray-500 hover:text-green-600 transition"
                                            title="Clavier Virtuel"
                                        >
                                            <Keyboard size={18} />
                                        </button>
                                    )}
                                </label>
                                <input
                                    name="firstName"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    onChange={handleInput}
                                    onInvalid={handleInvalid}
                                    value={formData.firstName}
                                    onFocus={() => setActiveInput('firstName')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    {t('auth.last_name')}
                                    {i18n.language === 'ar' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveInput('lastName');
                                                setShowKeyboard(true);
                                            }}
                                            className="text-gray-500 hover:text-green-600 transition"
                                            title="Clavier Virtuel"
                                        >
                                            <Keyboard size={18} />
                                        </button>
                                    )}
                                </label>
                                <input
                                    name="lastName"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    onChange={handleInput}
                                    onInvalid={handleInvalid}
                                    value={formData.lastName}
                                    onFocus={() => setActiveInput('lastName')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.professional_email')}</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                onChange={handleInput}
                                onInvalid={handleEmailInvalid}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                onChange={(e) => { handlePasswordChange(e); e.target.setCustomValidity(''); }}
                                onInvalid={handleInvalid}
                            />
                            {/* Password Strength Indicators */}
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-green-500' : 'bg-gray-300'}`} /> {t('auth.char_8')}
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-green-500' : 'bg-gray-300'}`} /> {t('auth.uppercase')}
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.lowercase ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.lowercase ? 'bg-green-500' : 'bg-gray-300'}`} /> {t('auth.lowercase')}
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.digit ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.digit ? 'bg-green-500' : 'bg-gray-300'}`} /> {t('auth.digit')}
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.special ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.special ? 'bg-green-500' : 'bg-gray-300'}`} /> {t('auth.special_char')}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                required
                                id="terms"
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                onChange={handleInput}
                                onInvalid={handleInvalid}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">{t('auth.terms_accept')} <Link to="/terms" className="text-green-600 hover:underline" target="_blank">{t('auth.terms_link')}</Link></label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t('auth.creating_account') : (
                                <>
                                    {t('auth.create_btn')} <ArrowRight size={18} className="rtl:rotate-180" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center text-sm text-gray-600 mb-4">
                            {t('auth.already_partner')} <Link to="/login" className="text-green-600 font-medium hover:underline">{t('auth.login_link')}</Link>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">{t('auth.buyer_prompt')}</p>
                            <Link to="/explore" className="inline-block mt-2 text-sm font-medium text-gray-900 border-b border-gray-900 hover:text-green-600 hover:border-green-600 transition-colors">
                                {t('auth.explore_link')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {showKeyboard && activeInput && (
                <VirtualKeyboard
                    onChange={(val) => handleKeyboardChange(val)}
                    inputName={activeInput}
                    value={formData[activeInput]}
                    onClose={() => setShowKeyboard(false)}
                />
            )}
        </div>
    );
}
