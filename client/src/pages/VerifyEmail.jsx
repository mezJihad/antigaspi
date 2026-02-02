import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/auth';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
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
                setMessage(err.message || 'Le lien de vérification est invalide ou a expiré.');
            }
        };

        verify();
    }, [location.search, navigate]);

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email vérifié !</h2>
                    <p className="text-gray-600 mb-6">Votre compte est activé. Redirection vers la connexion...</p>
                    <button onClick={() => navigate('/login')} className="text-green-600 font-medium hover:underline">
                        Connexion immédiate
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Échec de la vérification</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button onClick={() => navigate('/register')} className="text-green-600 font-medium hover:underline">
                        Retour à l'inscription
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h2>
                    <p className="text-gray-600 mb-6">Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.</p>
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
                <h2 className="text-xl font-semibold text-gray-900">Vérification en cours...</h2>
            </div>
        </div>
    );
}
