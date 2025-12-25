import React, { useState, useEffect } from 'react';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';

const Explore = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ query: '', city: 'Toutes', category: 'Toutes' });

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (filters.city !== 'Toutes') queryParams.append('city', filters.city);
                if (filters.category !== 'Toutes') queryParams.append('category', filters.category);

                const response = await fetch(`/api/offers?${queryParams.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch offers');
                }
                const data = await response.json();
                setOffers(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching offers:', err);
                setError('Impossible de charger les offres. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [filters.city, filters.category]);

    const filteredOffers = offers.filter(offer => {
        return offer.title.toLowerCase().includes(filters.query.toLowerCase());
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
                    {loading ? (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
                            Chargement des offres...
                        </p>
                    ) : error ? (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'red', fontSize: '1.2rem', marginTop: '2rem' }}>
                            {error}
                        </p>
                    ) : filteredOffers.length > 0 ? (
                        filteredOffers.map(offer => (
                            <OfferCard key={offer._id || offer.id} offer={offer} />
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
