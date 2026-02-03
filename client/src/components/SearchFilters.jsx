import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cityService } from '../services/cityService';

const SearchFilters = ({ filters, setFilters, onRequestLocation }) => {
    const { t, i18n } = useTranslation();
    const [cities, setCities] = React.useState([]); // Store full city objects
    const [localQuery, setLocalQuery] = React.useState(filters.query || '');
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const sortMenuRef = React.useRef(null);

    React.useEffect(() => {
        const fetchCities = async () => {
            try {
                // Fetch all reference cities to get translations
                const data = await cityService.getAll();
                setCities(data);
            } catch (error) {
                console.error("Error fetching cities", error);
            }
        };
        fetchCities();
    }, []);

    const getCityName = (city) => {
        if (!city) return '';
        if (i18n.language === 'ar') return city.nameAr || city.nameFr;
        if (i18n.language === 'en') return city.nameEn || city.nameFr;
        return city.nameFr;
    };

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
        { value: 'Toutes', label: t('search.all_categories') },
        { value: 0, label: t('search.cat_bakery') },
        { value: 1, label: t('search.cat_fruits') },
        { value: 2, label: t('search.cat_meat') },
        { value: 3, label: t('search.cat_dairy') },
        { value: 4, label: t('search.cat_prepared') },
        { value: 5, label: t('search.cat_grocery') },
        { value: 6, label: t('search.cat_surprise') },
        { value: 7, label: t('search.cat_other') }
    ];

    const sortOptions = [
        { value: 'distance', label: t('search.sort_distance') },
        { value: 'expiration_asc', label: t('search.sort_exp_soon') },
        { value: 'expiration_desc', label: t('search.sort_long_shelf') },
        { value: 'price_asc', label: t('search.sort_price_asc') },
        { value: 'price_desc', label: t('search.sort_price_desc') },
    ];

    const currentSortLabel = sortOptions.find(o => o.value === filters.sortBy)?.label || t('search.sort_relevance');

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
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>{t('search.label')}</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} className='rtl:right-4 ltr:left-4' style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            className='rtl:pr-12 ltr:pl-12'
                            style={{
                                width: '100%',
                                paddingTop: '0.75rem',
                                paddingBottom: '0.75rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                {/* City Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>{t('search.city')}</label>
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
                        <option value="Toutes">{t('search.all_cities')}</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.nameFr}>
                                {getCityName(c)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>{t('search.category')}</label>
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
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>{t('search.sort')}</label>
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
