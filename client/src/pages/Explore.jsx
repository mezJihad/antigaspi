import React, { useState, useEffect } from 'react';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';

const Explore = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ query: '', city: 'Toutes', category: 'Toutes' });
    const [userLocation, setUserLocation] = useState(null); // { lat: number, lon: number }
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (filters.city !== 'Toutes') queryParams.append('city', filters.city);
                if (filters.category !== 'Toutes') queryParams.append('category', filters.category);

                // Add location to query if available for backend sorting
                if (userLocation) {
                    queryParams.append('lat', userLocation.lat);
                    queryParams.append('lon', userLocation.lon);
                }

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
    }, [filters.city, filters.category, userLocation]);

    // Handle "Use My Location"
    const handleUseMyLocation = () => {
        // Toggle OFF if already active
        if (userLocation) {
            setUserLocation(null);
            return;
        }

        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas supportée par votre navigateur.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setIsLocating(false);
            },
            (err) => {
                console.error(err);
                alert('Impossible de récupérer votre position.');
                setIsLocating(false);
            }
        );
    };

    // Calculate distance for display (km)
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d.toFixed(1);
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const filteredOffers = offers.filter(offer => {
        return offer.title.toLowerCase().includes(filters.query.toLowerCase());
    });

    return (
        <div className="explore-page" style={{ padding: '2rem 1rem', backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>Découvrez les offres</h1>

                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                                ${userLocation ? 'bg-blue-600' : 'bg-gray-200'}
                            `}
                            role="switch"
                            aria-checked={!!userLocation}
                        >
                            <span
                                aria-hidden="true"
                                className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${userLocation ? 'translate-x-5' : 'translate-x-0'}
                                `}
                            />
                        </button>
                        <span className="ml-3 text-sm font-medium text-gray-900" onClick={handleUseMyLocation} style={{ cursor: 'pointer' }}>
                            {isLocating ? 'Localisation...' : userLocation ? 'Trié par proximité' : 'Autour de moi'}
                        </span>
                    </div>
                </div>

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
                        filteredOffers.map(offer => {
                            // Calculate distance if user location is known
                            const distance = userLocation
                                ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, offer.seller?.address?.latitude, offer.seller?.address?.longitude)
                                : null;

                            return (
                                <div key={offer._id || offer.id} style={{ position: 'relative' }}>
                                    <OfferCard offer={offer} />
                                    {distance && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            color: '#059669',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 10
                                        }}>
                                            📍 {distance} km
                                        </div>
                                    )}
                                </div>
                            );
                        })
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
