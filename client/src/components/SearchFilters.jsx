import React from 'react';
import { Search } from 'lucide-react';

const SearchFilters = ({ filters, setFilters, onRequestLocation }) => {
    const [cities, setCities] = React.useState(['Toutes']);
    const [localQuery, setLocalQuery] = React.useState(filters.query || '');

    React.useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('/api/sellers/cities');
                if (response.ok) {
                    const data = await response.json();
                    setCities(['Toutes', ...data]);
                }
            } catch (error) {
                console.error("Error fetching cities", error);
            }
        };
        fetchCities();
    }, []);

    // Debounce search query
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery !== filters.query) {
                setFilters(prev => ({ ...prev, query: localQuery }));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localQuery, setFilters, filters.query]);

    // Match backend enum values
    const categories = [
        { value: 'Toutes', label: 'Toutes' },
        { value: 0, label: '🥖 Boulangerie' },
        { value: 1, label: '🍎 Fruits & Légumes' },
        { value: 2, label: '🥩 Viandes & Poissons' },
        { value: 3, label: '🧀 Produits Laitiers' },
        { value: 4, label: '🍱 Plats Cuisinés' },
        { value: 5, label: '🥫 Épicerie' },
        { value: 6, label: '🎁 Panier Surprise' },
        { value: 7, label: 'Autre' }
    ];

    const sortOptions = [
        { value: '', label: 'Pertinence' },
        { value: 'distance', label: '📍 Proximité' },
        { value: 'expiration_asc', label: '⏳ Finit bientôt' },
        { value: 'expiration_desc', label: '📅 Longue conservation' },
        { value: 'price_asc', label: '💶 Prix croissant' },
        { value: 'price_desc', label: '💎 Prix décroissant' },
    ];

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setFilters(prev => ({ ...prev, sortBy: newSort }));
        if (newSort === 'distance' && onRequestLocation) {
            onRequestLocation();
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search Bar */}
                <div style={{ flex: '1 1 250px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Rechercher des produits..."
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {/* City Filter */}
                <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    style={{
                        padding: '0.75rem 2rem 0.75rem 1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                    }}
                >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Category Filter */}
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    style={{
                        padding: '0.75rem 2rem 0.75rem 1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                    }}
                >
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                {/* Sort Filter */}
                <select
                    value={filters.sortBy || ''}
                    onChange={handleSortChange}
                    style={{
                        padding: '0.75rem 2rem 0.75rem 1rem',
                        border: '1px solid var(--color-border)',
                        fontWeight: 'bold',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer'
                    }}
                >
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>
    );
};

export default SearchFilters;


