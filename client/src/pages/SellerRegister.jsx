import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Search, Keyboard } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cityService } from '../services/cityService';
import { useTranslation } from 'react-i18next';
import VirtualKeyboard from '../components/VirtualKeyboard';
import api from '../services/api';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

// Map Recenter Component
function MapRecenter({ lat, lng }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.flyTo([lat, lng], 16);
    }, [lat, lng]);
    return null;
}

export default function SellerRegister() {
    const { t, i18n } = useTranslation();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const getCityName = (city) => {
        if (!city) return '';
        if (i18n.language === 'ar') return city.nameAr || city.nameFr;
        if (i18n.language === 'en') return city.nameEn || city.nameFr;
        return city.nameFr;
    };

    const [formData, setFormData] = useState({
        storeName: '',
        street: '',
        city: '',
        zipCode: '',
        description: ''
    });

    const [sourceLanguage, setSourceLanguage] = useState(i18n.language || 'fr');

    // Virtual Keyboard State
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [activeInput, setActiveInput] = useState(null);

    const handleKeyboardChange = (input) => {
        if (activeInput) {
            setFormData(prev => ({
                ...prev,
                [activeInput]: input
            }));
        }
    };

    // Map & Geolocation State
    const [position, setPosition] = useState({ lat: 33.5731, lng: -7.5898 }); // Casablanca default
    const [error, setError] = useState('');

    // Autocomplete State
    const [query, setQuery] = useState(''); // The input value
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const searchTimeout = useRef(null);

    // IP Detection State
    const [isMorocco, setIsMorocco] = useState(true); // Default to true to show dropdown initially

    // Cities State
    const [cities, setCities] = useState([]);

    useEffect(() => {
        setSourceLanguage(i18n.language);
    }, [i18n.language]);

    useEffect(() => {
        // Fetch Cities
        async function fetchCities() {
            const data = await cityService.getAll();
            setCities(data);
        }
        fetchCities();

        // Detect Country
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                if (data.country_code && data.country_code !== 'MA') {
                    setIsMorocco(false);
                }
            })
            .catch(() => {
                // On error, default to Morocco 
                setIsMorocco(true);
            });
    }, []);

    // Sync City Name with Language
    useEffect(() => {
        if (formData.city && cities.length > 0) {
            const currentCity = cities.find(c =>
                c.nameFr === formData.city ||
                c.nameEn === formData.city ||
                c.nameAr === formData.city
            );

            if (currentCity) {
                const newName = getCityName(currentCity);
                if (newName !== formData.city) {
                    setFormData(prev => ({ ...prev, city: newName }));
                }
            }
        }
    }, [i18n.language, cities, formData.city]);

    // Handle Address Search Input
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setShowSuggestions(true);

        // Debounce API calls
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (val.length > 3) {
            searchTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`);
                    const data = await res.json();
                    setSuggestions(data);
                } catch (err) {
                    console.error("Autocomplete error", err);
                }
            }, 500); // 500ms delay
        } else {
            setSuggestions([]);
        }
    };

    // Handle Selection from Dropdown
    const handleSelectAddress = (item) => {
        const { lat, lon, address } = item;
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        updateFormFromLocation(newLat, newLng, address, item.display_name);
        setShowSuggestions(false);
    };

    // Helper to update form from address object
    const updateFormFromLocation = (lat, lng, addressObj, displayName) => {
        setPosition({ lat, lng });

        // Helper to normalize strings (remove accents, lowercase)
        const normalize = (str) => {
            return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
        };

        const road = addressObj.road || addressObj.pedestrian || addressObj.suburb || "";
        const houseNumber = addressObj.house_number ? `${addressObj.house_number}, ` : "";

        // Extended city detection for OpenStreetMap
        let city = addressObj.city ||
            addressObj.town ||
            addressObj.village ||
            addressObj.municipality ||
            addressObj.county ||
            addressObj.state ||
            "";

        console.log("OSM Address:", addressObj); // Debug logic
        console.log("Detected City:", city);

        // Normalize city name for dropdown matching if in Morocco mode
        if (isMorocco && cities.length > 0) {
            const normalizedInput = normalize(city);

            const matchedCity = cities.find(c =>
                normalize(c.nameFr) === normalizedInput ||
                normalize(c.nameEn) === normalizedInput ||
                (c.nameAr && c.nameAr === city)
            );

            if (matchedCity) {
                console.log("Matched City:", matchedCity.nameFr);
                city = matchedCity.nameFr;
            }
        }

        setFormData(prev => ({
            ...prev,
            street: houseNumber + road,
            city: city
        }));

        if (displayName) setQuery(displayName);
    };

    // Handle "My Current Location"
    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert(t('seller_shop.geolocation_unsupported'));
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                // Reverse Geocoding
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
                const data = await res.json();

                if (data && data.address) {
                    updateFormFromLocation(latitude, longitude, data.address, data.display_name);
                } else {
                    // Fallback if address not found but coords are good
                    setPosition({ lat: latitude, lng: longitude });
                    alert(t('seller_shop.location_found_no_addr'));
                }
            } catch (err) {
                console.error("Reverse geocoding error", err);
                setPosition({ lat: latitude, lng: longitude });
            } finally {
                setGeoLoading(false);
            }
        }, (err) => {
            console.error(err);
            alert(t('seller_shop.location_error'));
            setGeoLoading(false);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Seller Registration Form...", formData); // DEBUG: Log form data

        try {
            const body = {
                ...formData,
                userId: "00000000-0000-0000-0000-000000000000",
                latitude: position.lat,
                longitude: position.lng,
                sourceLanguage: sourceLanguage
            };

            console.log("Payload sent to server:", body); // DEBUG: Log payload

            // Using api instance - token is handled by interceptor
            const response = await api.post('/Sellers', body);

            console.log("Server Response Status:", response.status); // DEBUG: Log status

            if (response.status === 200 || response.status === 201) {
                console.log("Seller created successfully"); // DEBUG
                navigate('/dashboard', { state: { successMessage: t('seller_shop.success') } });
            }
        } catch (error) {
            console.error("Network or Client Error during submission:", error);
            if (error.response) {
                const errorData = error.response.data;
                console.error("Server Error Response:", errorData);
                if (errorData?.message === 'CREATE_SELLER_FAILED') {
                    setError(t('errors.create_seller_failed'));
                } else {
                    setError(t('errors.create_seller_failed'));
                }
            } else {
                setError(t('errors.generic_error'));
            }
        }
    };

    const handleSearchInput = (value) => {
        setQuery(value);
        if (value.length > 3) {
            // Trigger search logic similar to handleSearchChange but directly with value
            // Note: debouncing is handled in handleSearchChange, here we might need manual trigger or rely on effect if we refactor. 
            // Ideally we just update query, and if we want live search we call the fetch logic.
            // For simplicity, let's just reuse the existing event handler logic logic or extract it.
            // But since handleSearchChange expects an event, let's create a synthetic event or extract logic.
            // Extracting logic is safer.
        }
        // ... (We need to refactor handleSearchChange slightly to support direct value update if we want live suggestions while typing on virtual keyboard)
        // For now, let's just setQuery. The user might need to type one char on real keyboard to trigger search or we improve this later. 
        // Actually, VirtualKeyboard calls 'onChange' which we map to handleKeyboardChange. 
        // If activeInput is 'query', we need to handle it.
        // Wait, 'query' is not in formData. It's a separate state.
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-green-600 flex justify-center items-center">
                        <Store size={48} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {t('seller_shop.title')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('seller_shop.subtitle')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4">

                        {/* Store Name - Always First */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('seller_shop.store_name')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('storeName');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-green-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.storeName}
                                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                                required
                                onFocus={() => setActiveInput('storeName')}
                            />
                        </div>

                        {/* Autocomplete Search Bar */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('seller_shop.search_address')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('query'); // Special case for query state
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-green-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <span className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none text-gray-500">
                                        <Search size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50"
                                        placeholder={t('seller_shop.search_placeholder')}
                                        value={query}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            setShowSuggestions(true);
                                            setActiveInput('query');
                                        }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCurrentLocation}
                                    disabled={geoLoading}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-200 flex items-center gap-2 text-sm font-medium transition whitespace-nowrap"
                                    title={t('seller_shop.use_my_location')}
                                >
                                    {geoLoading ? <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div> : <MapPin size={18} />}
                                    {t('seller_shop.my_location')}
                                </button>
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b last:border-0"
                                            onClick={() => handleSelectAddress(item)}
                                        >
                                            {item.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* City (No ZipCode) */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('seller_shop.city')}</label>
                                {isMorocco ? (
                                    <select
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    >
                                        <option value="">{t('seller_shop.select_city')}</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={getCityName(city)}>{getCityName(city)}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 focus:ring-green-500 focus:border-green-500 sm:text-sm cursor-not-allowed"
                                        value={formData.city}
                                        readOnly
                                        title={t('seller_shop.search_address')}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('seller_shop.street')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('street');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-green-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                required
                                onFocus={() => setActiveInput('street')}
                            />
                        </div>

                        {/* Map Section */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> {t('seller_shop.adjust_position')}
                            </label>
                            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0">
                                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker position={position} setPosition={setPosition} />
                                    <MapRecenter lat={position.lat} lng={position.lng} />
                                </MapContainer>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Latitude: {position.lat.toFixed(5)}, Longitude: {position.lng.toFixed(5)}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('seller_shop.description')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('description');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-green-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                onFocus={() => setActiveInput('description')}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button type='submit' className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        {t('seller_shop.submit')}
                    </button>
                </form>
            </div>

            {showKeyboard && activeInput && (
                <VirtualKeyboard
                    onChange={(val) => {
                        if (activeInput === 'query') {
                            setQuery(val);
                            handleSearchChange({ target: { value: val } });
                        } else {
                            handleKeyboardChange(val);
                        }
                    }}
                    inputName={activeInput}
                    value={activeInput === 'query' ? query : formData[activeInput]}
                    onClose={() => setShowKeyboard(false)}
                />
            )}
        </div>
    );
}
