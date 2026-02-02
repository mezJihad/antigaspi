import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, resendVerification } from '../services/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import heroImage from '../assets/auth-hero.png';

export default function Login() {
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
                setError('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
            } else if (error.message && error.message.includes("EMAIL_NOT_VERIFIED")) {
                setError('Veuillez vérifier votre adresse email avant de vous connecter.');
                setShowResend(true);
            } else if (error.response && error.response.status === 403 && error.response.data && error.response.data.message == "EMAIL_NOT_VERIFIED") {
                setError('Veuillez vérifier votre adresse email avant de vous connecter.');
                setShowResend(true);
            } else if (error.response && error.response.status === 403 && error.response.data && error.response.data.message == "ACCOUNT_SUSPENDED") {
                setError('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
            } else {
                setError('Identifiants incorrects. Veuillez réessayer.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendVerification(email);
            setSuccess('Un nouveau lien de vérification a été envoyé.');
            setShowResend(false);
        } catch (err) {
            setError('Impossible de renvoyer l\'email. Veuillez réessayer plus tard.');
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
                        <h1 className="text-4xl font-bold mb-6 leading-tight">Bon retour parmi nous.</h1>
                        <p className="text-lg text-gray-200 mb-8">Connectez-vous à votre espace vendeur pour publier et gérer vos offres.</p>
                    </div>
                    <div className="text-sm text-gray-400 mt-auto">© 2024 Antigaspi. Tous droits réservés.</div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <div className="lg:hidden mx-auto h-12 w-12 text-green-600 flex justify-center items-center mb-4">
                            <Leaf size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Connexion Vendeur</h2>
                        <p className="mt-2 text-gray-600">Accédez à votre dashboard</p>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm flex items-center gap-2">
                            <CheckCircle2 size={18} /> {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span>⚠️</span> {error}
                            </div>
                            {showResend && (
                                <button
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="ml-6 text-xs font-semibold bg-white border border-red-200 px-3 py-1 rounded hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                                >
                                    {isResending ? 'Envoi en cours...' : 'Renvoyer email de vérification'}
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                                <a href="#" className="text-sm text-green-600 hover:text-green-500 font-medium">Mot de passe oublié ?</a>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Connexion...' : (
                                <>
                                    Se connecter <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center text-sm text-gray-600 mb-4">
                            Pas encore de compte ? <Link to="/register" className="text-green-600 font-medium hover:underline">Créer un espace vendeur</Link>
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
