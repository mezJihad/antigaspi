import React from 'react';
import { Search } from 'lucide-react';

const SearchFilters = ({ filters, setFilters }) => {
    const [cities, setCities] = React.useState(['Toutes']);

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

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Rechercher des produits..."
                        value={filters.query}
                        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
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
            </div>
        </div>
    );
};

export default SearchFilters;
