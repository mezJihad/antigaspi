import { useState } from 'react';
import { register } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(email, password, role);
            navigate('/login');
        } catch (error) {
            setError('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-green-600 flex justify-center items-center">
                        <Leaf size={48} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Rejoignez la communauté Antigaspi
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                type='email'
                                placeholder='Adresse Email'
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                type='password'
                                placeholder='Mot de passe'
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="sr-only">Rôle</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                            >
                                <option value='CUSTOMER'>Je veux acheter</option>
                                <option value='SELLER'>Je veux vendre (créer un profil vendeur ensuite)</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                                Déjà un compte ? Se connecter
                            </Link>
                        </div>
                    </div>

                    <button type='submit' className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                        S'inscrire
                    </button>
                </form>
            </div>
        </div>
    );
}
