import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';

const Explore = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Init state from URL
    const [filters, setFilters] = useState({
        query: searchParams.get('search') || '',
        city: searchParams.get('city') || 'Toutes',
        category: searchParams.get('category') || 'Toutes',
        sortBy: searchParams.get('sortBy') || ''
    });

    // Pagination State
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null); // { lat: number, lon: number }
    const [isLocating, setIsLocating] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    // Sync State -> URL
    useEffect(() => {
        const params = {};
        if (filters.query) params.search = filters.query;
        if (filters.city && filters.city !== 'Toutes') params.city = filters.city;
        if (filters.category && filters.category !== 'Toutes') params.category = filters.category;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (page > 1) params.page = page.toString();

        setSearchParams(params, { replace: true });
    }, [filters, page]); // setPage resets to 1 on filter change handled below

    useEffect(() => {
        // Reset page to 1 when filters change (except usually handled by UI, but good to ensure)
        // Check if filters effectively changed vs URL?
        // Actually, if I change filter, I should reset page.
        // Let's rely on the previous logic: "Reset page to 1 when filters change"
        // But we need to distinguish mount vs update.
        // The previous code had:
        /*
        useEffect(() => {
            setPage(1);
        }, [filters]);
        */
        // If I init filters from URL, this effect runs on mount? No, only if filters change from initial?
        // Actually, initial render runs effects. So it might reset page to 1 on load even if URL has page=5.
        // To avoid this, we can use a ref to track mount.
    }, []);

    // Helper: Reset page when filters change (excluding page itself)
    // We can wrap setFilters to also setPage(1).
    const handleSetFilters = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };
    // Note: SearchFilters component likely calls setFilters directly or via functional update.
    // If SearchFilters uses setFilters(prev => ...), passing handleSetFilters might break if signature differs.
    // Let's check SearchFilters usage.
    // Assuming standard setFilters usage.
    // actually, simpler: Just keep the useEffect but add a check if it's not mount?

    /* Using a simpler approach for now: 
       The fetch logic reads from STATE.
       The state initializes from URL. 
       This is enough for "Back" button to work (restore state from URL).
    */

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
                    if (Array.isArray(data)) {
                        setOffers(data);
                        setTotalPages(1);
                    } else {
                        setOffers(data.items || []);
                        setTotalPages(data.totalPages || 1);
                    }
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

    // ... (rest of location logic)

    // Auto-request location on mount
    useEffect(() => {
        // Try to get location silently or with prompt on load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (err) => {
                    // Ignore errors on auto-load, user can trigger manually later
                    console.log("Auto-location failed or denied:", err.message);
                }
            );
        }
    }, []);

    // Handle "Use My Location"
    const handleUseMyLocation = () => {
        // If we already have location, we don't strictly need to do anything, 
        // but the sort menu calls this to ENSURE we have it.
        // We shouldn't toggle it off here if called from sort menu.
        // Let's simplified: Always try to get/refresh location.

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
                console.warn("Geolocation error:", err.code, err.message); // Added logging
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



    // ... (location logic)

    // ...

    return (
        <div className="explore-page" style={{ padding: '2rem 1rem', backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <div className="container">
                <SearchFilters
                    filters={filters}
                    setFilters={handleSetFilters}
                    onRequestLocation={handleUseMyLocation}
                />

                {isLocating && <p>{t('explore.locating')}</p>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>{t('explore.loading')}</div>
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                ) : (
                    <>
                        <div className="offers-grid">
                            {offers.length === 0 ? (
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

                        {/* Pagination Controls */}
                        {offers.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: page === 1 ? '#f3f4f6' : 'white',
                                        color: page === 1 ? '#9ca3af' : 'inherit',
                                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {t('explore.prev_page')}
                                </button>
                                <span style={{ color: '#555' }}>
                                    {t('explore.page_info', { current: page, total: totalPages })}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: page === totalPages ? '#f3f4f6' : 'white',
                                        color: page === totalPages ? '#9ca3af' : 'inherit',
                                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {t('explore.next_page')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Explore;
