import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, login } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth(); // If we want to auto-login after verify

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await verifyEmail(email, otp);
            setSuccess(true);

            // Auto login or redirect to login?
            // If we have the password we could auto-login, but we don't store it here generally.
            // But usually after verification, user is asked to login or is auto-logged in if token was already issued.
            // Currently backend issues token on Register, but let's assume valid flow is: 
            // Register -> Token (but not verified) -> Verify -> Updated Token (verified)

            // For now, let's redirect to login or dashboard if they are already logged in (context check?)
            // If they registered, they might have a token in localStorage from the Register step if we kept that logic.
            // But Register.jsx currently does: register -> login -> navigate. 
            // We should change Register.jsx to: register -> navigate to verify. NOT login yet.

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Code invalide ou expiré.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email vérifié !</h2>
                    <p className="text-gray-600 mb-6">Votre compte est désormais actif. Vous allez être redirigé...</p>
                    <button onClick={() => navigate('/login')} className="text-green-600 font-medium hover:underline">
                        Aller à la connexion
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h2>
                    <p className="mt-2 text-gray-600">Un code à 6 chiffres a été envoyé à <strong>{email}</strong></p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            placeholder="123456"
                            className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    >
                        {isLoading ? 'Vérification...' : 'Vérifier mon compte'} <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/register')} className="text-sm text-gray-500 hover:text-gray-700">
                        Retour à l'inscription
                    </button>
                </div>
            </div>
        </div>
    );
}
