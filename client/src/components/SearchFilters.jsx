import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cityService } from '../services/cityService';

const SearchFilters = ({ filters, setFilters, onRequestLocation }) => {
    const { t, i18n } = useTranslation();
    const [cities, setCities] = React.useState([]); // Store full city objects
    const [localQuery, setLocalQuery] = React.useState(filters.query || '');
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
    const sortMenuRef = React.useRef(null);

    React.useEffect(() => {
        const fetchCities = async () => {
            try {
                let userCountry = null;
                // 1. Try to detect country from IP
                try {
                    const ipRes = await fetch('https://api.country.is/');
                    if (ipRes.ok) {
                        const ipData = await ipRes.json();
                        // Map country code to full name if needed, or use country code directly?
                        // Backend expects full country name (e.g. "France", "Maroc") matching Address.
                        // api.country.is returns 2-letter code (e.g. "US", "FR", "MA").
                        // We need a mapper.

                        const countryMap = {
                            'FR': 'France',
                            'MA': 'Maroc',
                            'US': 'United States',
                            // Add others as needed or fallback to code if Address uses codes (Address defaults to "France")
                        };

                        userCountry = countryMap[ipData.country];
                        console.log("Detected Country:", userCountry);
                    }
                } catch (e) {
                    console.warn("Could not detect country from IP", e);
                }

                // 2. Fetch cities filtered by active offers AND country
                const data = await cityService.getAll(true, userCountry);
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

    const currentSortLabel = sortOptions.find(o => o.value === filters.sortBy)?.label || t('search.sort');

    // Reusable controls to avoid duplication
    const FilterControls = ({ mobile = false }) => (
        <>
            {/* City Filter */}
            <div className={`${mobile ? 'w-full' : 'w-full md:w-auto'} flex flex-col gap-1`}>
                <label className="text-sm font-bold text-gray-600 ml-1">{t('search.city')}</label>
                <div className="relative">
                    <select
                        value={filters.city}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        className={`w-full ${!mobile && 'md:w-48'} appearance-none py-3 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 border border-gray-200 rounded-full bg-white focus:outline-none focus:border-green-500 cursor-pointer text-base`}
                    >
                        <option value="Toutes">{t('search.all_cities')}</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.nameFr}>
                                {getCityName(c)}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center px-3 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className={`${mobile ? 'w-full' : 'w-full md:w-auto'} flex flex-col gap-1`}>
                <label className="text-sm font-bold text-gray-600 ml-1">{t('search.category')}</label>
                <div className="relative">
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className={`w-full ${!mobile && 'md:w-56'} appearance-none py-3 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 border border-gray-200 rounded-full bg-white focus:outline-none focus:border-green-500 cursor-pointer text-base`}
                    >
                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center px-3 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* Sort Icon Button - Desktop Only (visible inline) */}
            {!mobile && (
                <div className="flex flex-col gap-1 relative z-10" ref={sortMenuRef}>
                    <label className="text-sm font-bold text-gray-600 ml-1 hidden md:block opacity-0">{t('search.sort')}</label>
                    <button
                        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                        className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-green-500 hover:text-green-600 transition-colors"
                        title={currentSortLabel}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
                        </svg>
                    </button>

                    {/* Sort Popup */}
                    {isSortMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 min-w-[200px] overflow-hidden z-50 origin-top-right">
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSortSelect(option.value)}
                                    className={`block w-full ltr:text-left rtl:text-right px-4 py-3 text-sm transition-colors ${filters.sortBy === option.value
                                        ? 'bg-green-50 text-green-700 font-semibold'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sort Select for Mobile Modal (simpler than popup) */}
            {mobile && (
                <div className="w-full flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600 ml-1">{t('search.sort')}</label>
                    <div className="relative">
                        <select
                            value={filters.sortBy || ''}
                            onChange={(e) => handleSortSelect(e.target.value)}
                            className="w-full appearance-none py-3 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 border border-gray-200 rounded-full bg-white focus:outline-none focus:border-green-500 cursor-pointer text-base"
                        >
                            <option value="">{t('search.sort')}</option>
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                {/* Search Bar */}
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600 ml-1">{t('search.label')}</label>
                    <div className="relative">
                        <Search size={20} className='rtl:right-4 ltr:left-4 absolute top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            className='w-full py-3 ltr:pl-12 rtl:pr-12 pr-4 border border-gray-200 rounded-full focus:outline-none focus:border-green-500 transition-colors text-base'
                        />
                        {/* Mobile Filter Toggle Button */}
                        <button
                            className="md:hidden absolute rtl:left-2 ltr:right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Desktop Filters (Hidden on Mobile) */}
                <div className="hidden md:flex flex-row gap-4 items-end">
                    <FilterControls />
                </div>

                {/* Mobile Filter Modal */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center md:hidden animate-fade-in px-4" onClick={() => setIsMobileFilterOpen(false)}>
                        <div
                            className="bg-white w-full max-w-sm rounded-2xl p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto animate-fade-in shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <h3 className="text-xl font-bold text-gray-800">{t('search.filters')}</h3>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <FilterControls mobile={true} />
                            </div>

                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors mt-4 shadow-lg shadow-green-200"
                            >
                                {t('common.apply')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchFilters;
