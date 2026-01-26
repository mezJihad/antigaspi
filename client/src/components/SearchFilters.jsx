import React from 'react';
import { Search } from 'lucide-react';

const SearchFilters = ({ filters, setFilters, onRequestLocation }) => {
    const [cities, setCities] = React.useState(['Toutes']);
    const [localQuery, setLocalQuery] = React.useState(filters.query || '');
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const sortMenuRef = React.useRef(null);

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

    // Close sort menu on outside click
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
                setIsSortMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sortMenuRef]);


    const handleSortSelect = (value) => {
        setFilters(prev => ({ ...prev, sortBy: value }));
        setIsSortMenuOpen(false);

        // If "Proximité" is selected, trigger location request
        if (value === 'distance' && onRequestLocation) {
            onRequestLocation();
        }
    };

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

    const currentSortLabel = sortOptions.find(o => o.value === filters.sortBy)?.label || 'Pertinence';

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {/* Search Bar */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Recherche</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Mots-clés..."
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
                </div>

                {/* City Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Ville</label>
                    <select
                        value={filters.city}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        style={{
                            padding: '0.75rem 2rem 0.75rem 1rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            color: 'inherit',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                    >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Catégorie</label>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        style={{
                            padding: '0.75rem 2rem 0.75rem 1rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            minWidth: '180px'
                        }}
                    >
                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>

                {/* Sort Icon Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative' }} ref={sortMenuRef}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Trier</label>
                    <button
                        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                        className="btn"
                        title={currentSortLabel}
                        style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Using a simple SVG icon for Sort if Lucide ArrowUpDown isn't imported, let's stick to generic or import it if we can. 
                            Since I cannot easily add imports at top without replacing whole file, I will use an SVG here directly or assume styling is enough.
                            Wait, I can replace the whole file content to get the import.
                            Actually the user file has `import { Search } from 'lucide-react';` at top. I should use that.
                        */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
                        </svg>
                    </button>

                    {/* Sort Popup */}
                    {isSortMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                            zIndex: 50,
                            minWidth: '200px',
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb'
                        }}>
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSortSelect(option.value)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        backgroundColor: filters.sortBy === option.value ? '#f0fdf4' : 'white',
                                        color: filters.sortBy === option.value ? 'var(--color-primary)' : 'inherit',
                                        cursor: 'pointer',
                                        fontWeight: filters.sortBy === option.value ? '600' : '400',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;


