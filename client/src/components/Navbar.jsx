import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav style={{
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
        <Leaf size={24} />
        Antigaspi
      </Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 500 }}>Espace Boutiques</Link>
        <Link to="/explore" style={{ fontWeight: 500 }}>Explorer les Offres</Link>

        {/* Become a Seller Button */}
        <Link to="/seller-register" className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium'>
          Devenir Vendeur
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" style={{ fontWeight: 500 }}>Dashboard</Link>
            <button onClick={logout} className="btn" style={{ fontWeight: 500 }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
