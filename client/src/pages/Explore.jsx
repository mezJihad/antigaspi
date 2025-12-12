import React, { useState } from 'react';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';

const MOCK_OFFERS = [
    { id: 1, title: 'Baguettes Fraîches (Lot de 3)', shopName: 'La Boulangerie Bio', city: 'Paris', category: 'Boulangerie', price: 2.50, originalPrice: 5.00, expiresIn: '2h' },
    { id: 2, title: 'Pommes Bio (2kg)', shopName: 'Marché Vert', city: 'Lyon', category: 'Primeur', price: 3.00, originalPrice: 6.50, expiresIn: '1 jour' },
    { id: 3, title: 'Sélection de Yaourts', shopName: 'Délice Laitier', city: 'Paris', category: 'Produits Laitiers', price: 1.80, originalPrice: 3.60, expiresIn: '5h' },
    { id: 4, title: 'Assortiment Pâtisseries', shopName: 'Douceurs Sucrées', city: 'Marseille', category: 'Boulangerie', price: 4.00, originalPrice: 12.00, expiresIn: 'Fin de jrn' },
    { id: 5, title: 'Banc de Poulet (500g)', shopName: 'Boucherie du Coin', city: 'Bordeaux', category: 'Viande', price: 5.00, originalPrice: 8.50, expiresIn: '1 jour' },
    { id: 6, title: 'Lait Entier (1L)', shopName: 'Mini Marché', city: 'Lyon', category: 'Produits Laitiers', price: 0.80, originalPrice: 1.20, expiresIn: '2 jours' },
];

const Explore = () => {
    const [filters, setFilters] = useState({ query: '', city: 'Toutes', category: 'Toutes' });

    const filteredOffers = MOCK_OFFERS.filter(offer => {
        const matchesQuery = offer.title.toLowerCase().includes(filters.query.toLowerCase());
        const matchesCity = filters.city === 'Toutes' || offer.city === filters.city;
        const matchesCategory = filters.category === 'Toutes' || offer.category === filters.category;
        return matchesQuery && matchesCity && matchesCategory;
    });

    return (
        <div className="explore-page" style={{ padding: '2rem 1rem', backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <div className="container">
                <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Découvrez les offres près de chez vous</h1>

                <SearchFilters filters={filters} setFilters={setFilters} />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredOffers.length > 0 ? (
                        filteredOffers.map(offer => (
                            <OfferCard key={offer.id} offer={offer} />
                        ))
                    ) : (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', fontSize: '1.2rem', marginTop: '2rem' }}>
                            Aucune offre trouvée correspondant à vos critères.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Explore;
