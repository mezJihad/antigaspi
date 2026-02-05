import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';

const Explore = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Init state from URL (Filters only)
    const [filters, setFilters] = useState({
        query: searchParams.get('search') || '',
        city: searchParams.get('city') || 'Toutes',
        category: searchParams.get('category') || 'Toutes',
        sortBy: searchParams.get('sortBy') || ''
    });

    // Pagination State - Internal only, not synced to URL for infinite scroll simplicity
    const [page, setPage] = useState(1);

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    // Sentinel ref for infinite scroll
    const observerTarget = React.useRef(null);

    // Sync State -> URL (Filters only)
    useEffect(() => {
        const params = {};
        if (filters.query) params.search = filters.query;
        if (filters.city && filters.city !== 'Toutes') params.city = filters.city;
        if (filters.category && filters.category !== 'Toutes') params.category = filters.category;
        if (filters.sortBy) params.sortBy = filters.sortBy;

        // Remove page syncing to prevent starting in middle of list on refresh
        setSearchParams(params, { replace: true });
    }, [filters]);

    // Reset page when filters change
    const handleSetFilters = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
        setOffers([]); // Clear offers immediately to show loading state cleanly
    };

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                // Build query params from STATE
                const params = new URLSearchParams();
                if (filters.category && filters.category !== 'Toutes') params.append('category', filters.category);
                if (filters.city && filters.city !== 'Toutes') params.append('city', filters.city);
                if (filters.query) params.append('search', filters.query);
                if (filters.sortBy) params.append('sortBy', filters.sortBy);

                // Pagination
                params.append('page', page);
                params.append('pageSize', 12);

                // Add location if available
                if (userLocation) {
                    params.append('lat', userLocation.lat);
                    params.append('lon', userLocation.lon);
                }

                const response = await fetch(`/api/offers?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    let newItems = [];
                    let total = 1;

                    if (Array.isArray(data)) {
                        newItems = data;
                        total = 1;
                    } else {
                        newItems = data.items || [];
                        total = data.totalPages || 1;
                    }

                    if (page === 1) {
                        setOffers(newItems);
                    } else {
                        setOffers(prev => [...prev, ...newItems]);
                    }
                    setTotalPages(total);
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
    }, [filters, userLocation, page]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && page < totalPages) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loading, page, totalPages]);

    // Auto-request location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (err) => {
                    console.log("Auto-location failed or denied:", err.message);
                }
            );
        }
    }, []);

    // Handle "Use My Location"
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert(t('edit_shop.error_geo_support'));
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
                console.warn("Geolocation error:", err.code, err.message);
                if (err.code === 1) {
                    alert(t('explore.location_denied'));
                } else {
                    alert(`${t('explore.location_error')} ${err.message}`);
                }
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
                    setFilters={handleSetFilters}
                    onRequestLocation={handleUseMyLocation}
                />

                {isLocating && <p className="text-center text-gray-500 py-4">{t('explore.locating')}</p>}

                {error ? (
                    <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                ) : (
                    <>
                        <div className="offers-grid">
                            {offers.length === 0 && !loading ? (
                                <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#666' }}>{t('explore.no_results')}</p>
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

                        {/* Loading Indicator / Sentinel */}
                        <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
                            {loading && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t('explore.loading')}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Explore;
