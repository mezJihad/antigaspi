import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Navbar = () => {
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
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link to="/" style={{ fontWeight: 500 }}>Espace Boutiques</Link>
        <Link to="/explore" style={{ fontWeight: 500 }}>Explorer les Offres</Link>
      </div>
      <div>
        <button className="btn btn-primary">Télécharger l'App</button>
      </div>
    </nav>
  );
};

export default Navbar;
