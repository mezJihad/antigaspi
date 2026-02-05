import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Store, MapPin, Search, Keyboard } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cityService } from '../services/cityService';
import { useTranslation } from 'react-i18next';
import VirtualKeyboard from '../components/VirtualKeyboard';

const API_URL = import.meta.env.VITE_API_URL;

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

export default function EditShop() {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const getCityName = (city) => {
        if (!city) return '';
        if (i18n.language === 'ar') return city.nameAr || city.nameFr;
        if (i18n.language === 'en') return city.nameEn || city.nameFr;
        return city.nameFr;
    };

    // Form Data
    const [formData, setFormData] = useState({
        storeName: '',
        street: '',
        city: '',
        zipCode: '',
        description: ''
    });

    const [sourceLanguage, setSourceLanguage] = useState('fr');

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
    const [loading, setLoading] = useState(true);

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

    // Sync sourceLanguage with UI language (User Intent)
    useEffect(() => {
        setSourceLanguage(i18n.language);
    }, [i18n.language]);

    // Fetch existing data
    useEffect(() => {
        if (!id || !token) return;
        async function fetchShop() {
            try {
                const res = await fetch(`${API_URL}/Sellers/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        storeName: data.storeName,
                        street: data.street,
                        city: data.city,
                        zipCode: data.zipCode,
                        description: data.description
                    });
                    if (data.latitude && data.longitude) {
                        setPosition({ lat: data.latitude, lng: data.longitude });
                    }
                    if (data.sourceLanguage) {
                        setSourceLanguage(data.sourceLanguage);
                    }
                } else {
                    setError(t('edit_shop.error_load'));
                }
            } catch (err) {
                console.error(err);
                setError(t('edit_shop.error_load_generic'));
            } finally {
                setLoading(false);
            }
        }
        fetchShop();
    }, [id, token]);


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
            alert(t('edit_shop.error_geo_support'));
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
                    alert(t('edit_shop.geo_found_no_address'));
                }
            } catch (err) {
                console.error("Reverse geocoding error", err);
                setPosition({ lat: latitude, lng: longitude });
            } finally {
                setGeoLoading(false);
            }
        }, (err) => {
            console.error(err);
            alert(t('edit_shop.error_geo_fetch'));
            setGeoLoading(false);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                ...formData,
                latitude: position.lat,
                longitude: position.lng,
                sourceLanguage: sourceLanguage
            };

            const response = await fetch(`${API_URL}/Sellers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                navigate('/dashboard', { state: { successMessage: t('edit_shop.success_update') } });
            } else {
                const errorText = await response.text();
                try {
                    const errObj = JSON.parse(errorText);
                    if (errObj.message === 'UPDATE_SELLER_FAILED') {
                        setError(t('errors.update_seller_failed'));
                    } else {
                        setError(t('errors.update_seller_failed'));
                    }
                } catch {
                    setError(t('errors.update_seller_failed'));
                }
            }
        } catch (error) {
            setError(t('errors.generic_error'));
        }
    };

    if (loading) return <div className="p-10 text-center">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-blue-600 flex justify-center items-center">
                        <Store size={48} className="rtl:flip" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {t('edit_shop.title')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('edit_shop.subtitle')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4">

                        {/* Store Name - Always First */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('edit_shop.store_name')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('storeName');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-blue-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.storeName}
                                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                                required
                                onFocus={() => setActiveInput('storeName')}
                            />
                        </div>

                        {/* Autocomplete Search Bar */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('edit_shop.search_address_label')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('query');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-blue-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <span className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-500">
                                        <Search size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50"
                                        placeholder={t('edit_shop.search_placeholder')}
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
                                    title={t('edit_shop.use_current_location')}
                                >
                                    {geoLoading ? <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div> : <MapPin size={18} />}
                                    {t('edit_shop.my_position')}
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
                                <label className="block text-sm font-medium text-gray-700">{t('edit_shop.city')}</label>
                                {isMorocco ? (
                                    <select
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    >
                                        <option value="">{t('edit_shop.select_city')}</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={getCityName(city)}>{getCityName(city)}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-not-allowed"
                                        value={formData.city}
                                        readOnly
                                        title={t('edit_shop.city_hint')}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                {t('edit_shop.street')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('street');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-blue-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                required
                                onFocus={() => setActiveInput('street')}
                            />
                        </div>

                        {/* Map Section */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> {t('edit_shop.adjust_position')}
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
                                {t('edit_shop.description')}
                                {sourceLanguage === 'ar' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveInput('description');
                                            setShowKeyboard(true);
                                        }}
                                        className="text-gray-500 hover:text-blue-600 transition"
                                        title="Clavier Virtuel"
                                    >
                                        <Keyboard size={18} />
                                    </button>
                                )}
                            </label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

                    <button type='submit' className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {t('edit_shop.save_btn')}
                    </button>
                    <button type='button' onClick={() => navigate('/dashboard')} className="w-full flex justify-center py-2 px-4 mt-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        {t('edit_shop.cancel')}
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
