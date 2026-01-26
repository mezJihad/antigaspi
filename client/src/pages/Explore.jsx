import React, { useState, useEffect } from 'react';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';

const Explore = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ query: '', city: 'Toutes', category: 'Toutes', sortBy: '' });
    const [userLocation, setUserLocation] = useState(null); // { lat: number, lon: number }
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                // Build query params
                const params = new URLSearchParams();
                if (filters.category && filters.category !== 'Toutes') params.append('category', filters.category);
                if (filters.city && filters.city !== 'Toutes') params.append('city', filters.city);
                if (filters.query) params.append('search', filters.query);
                if (filters.sortBy) params.append('sortBy', filters.sortBy);

                // Add location if available
                if (userLocation) {
                    params.append('lat', userLocation.lat);
                    params.append('lon', userLocation.lon);
                }

                const response = await fetch(`/api/offers?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setOffers(data);
                } else {
                    setError('Failed to fetch offers');
                }
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [filters, userLocation]);

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

    return (
        <div className="explore-page" style={{ padding: '2rem 1rem', backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <div className="container">
                <SearchFilters
                    filters={filters}
                    setFilters={setFilters}
                    onRequestLocation={handleUseMyLocation}
                />

                {isLocating && <p>Obtention de la localisation...</p>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des offres...</div>
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                ) : (
                    <div className="offers-grid">
                        {offers.length === 0 ? (
                            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#666' }}>Aucune offre trouvée pour ces critères.</p>
                        ) : (
                            offers.map((offer) => {
                                const distance = userLocation
                                    ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, offer.sellerAddress?.latitude, offer.sellerAddress?.longitude)
                                    : null;

                                return (
                                    <OfferCard
                                        key={offer.id}
                                        offer={offer}
                                        distance={distance}
                                    />
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
