import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerUser, login as loginUser } from '../services/auth';
import { registerSeller } from '../services/sellers';
import { Leaf, Store, ArrowRight, CheckCircle2 } from 'lucide-react';
import heroImage from '../assets/auth-hero.png';

export default function Register() {
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
            setError('Le mot de passe ne respecte pas les critères de sécurité.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create User Account
            await registerUser(formData.firstName, formData.lastName, formData.email, formData.password, 'SELLER');

            // 2. Redirect to Verify Page
            // Passing email and status to show correct message
            navigate('/verify-email', {
                state: {
                    email: formData.email,
                    message: "Un lien de vérification a été envoyé à votre adresse email."
                }
            });

        } catch (err) {
            console.error(err);
            setError(err.message || 'Une erreur est survenue.');
            setIsLoading(false);
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
                        <h1 className="text-4xl font-bold mb-6 leading-tight">Valorisez vos invendus, touchez de nouveaux clients.</h1>
                        <p className="text-lg text-gray-200 mb-8">Rejoignez la communauté de commerçants qui s'engagent contre le gaspillage alimentaire tout en augmentant leurs revenus.</p>

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-full text-green-400"><CheckCircle2 size={20} /></div>
                                <span>Gérez vos offres simplement</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-full text-green-400"><CheckCircle2 size={20} /></div>
                                <span>Touchez des clients locaux</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-400 mt-auto">© 2024 Antigaspi. Tous droits réservés.</div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Créez votre Espace Vendeur</h2>
                        <p className="mt-2 text-gray-600">Commencez à vendre en quelques minutes</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                <input name="firstName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input name="lastName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                            <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                onChange={handlePasswordChange}
                            />
                            {/* Password Strength Indicators */}
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-green-500' : 'bg-gray-300'}`} /> 8+ caractères
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-green-500' : 'bg-gray-300'}`} /> Majuscule
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.lowercase ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.lowercase ? 'bg-green-500' : 'bg-gray-300'}`} /> Minuscule
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.digit ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.digit ? 'bg-green-500' : 'bg-gray-300'}`} /> Chiffre
                                </div>
                                <div className={`flex items-center gap-1 ${passwordCriteria.special ? 'text-green-600' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.special ? 'bg-green-500' : 'bg-gray-300'}`} /> Spécial (@$!%*?&)
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="termsAccepted" required id="terms" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer" onChange={handleChange} />
                            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">J'accepte les <Link to="/terms" className="text-green-600 hover:underline" target="_blank">conditions générales d'utilisation</Link></label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Création en cours...' : (
                                <>
                                    Créer mon compte vendeur <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center text-sm text-gray-600 mb-4">
                            Déjà partenaire ? <Link to="/login" className="text-green-600 font-medium hover:underline">Connectez-vous</Link>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">Vous souhaitez simplement acheter des paniers ?</p>
                            <Link to="/explore" className="inline-block mt-2 text-sm font-medium text-gray-900 border-b border-gray-900 hover:text-green-600 hover:border-green-600 transition-colors">
                                Explorer les offres maintenant
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
