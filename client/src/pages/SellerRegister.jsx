import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

export default function SellerRegister() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Form Data
    const [formData, setFormData] = useState({
        storeName: '',
        street: '',
        city: '',
        zipCode: '',
        description: ''
    });

    // Map & Geolocation State
    const [position, setPosition] = useState({ lat: 33.5731, lng: -7.5898 }); // Casablanca default
    const [error, setError] = useState('');

    // Autocomplete State
    const [query, setQuery] = useState(''); // The input value
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const searchTimeout = useRef(null);

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

        const road = addressObj.road || addressObj.pedestrian || addressObj.suburb || "";
        const houseNumber = addressObj.house_number ? `${addressObj.house_number}, ` : "";
        const city = addressObj.city || addressObj.town || addressObj.village || addressObj.state || "Inconnu";
        const postcode = addressObj.postcode || "";

        setFormData(prev => ({
            ...prev,
            street: houseNumber + road,
            city: city,
            zipCode: postcode
        }));

        if (displayName) setQuery(displayName);
    };

    // Handle "My Current Location"
    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
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
                    alert("Position trouvée, mais adresse exacte inconnue.");
                }
            } catch (err) {
                console.error("Reverse geocoding error", err);
                setPosition({ lat: latitude, lng: longitude });
            } finally {
                setGeoLoading(false);
            }
        }, (err) => {
            console.error(err);
            alert("Impossible de récupérer votre position.");
            setGeoLoading(false);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                ...formData,
                userId: "00000000-0000-0000-0000-000000000000",
                latitude: position.lat,
                longitude: position.lng
            };

            const response = await fetch(`${API_URL}/Sellers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                navigate('/dashboard', { state: { successMessage: 'Boutique créée avec succès !' } });
            } else {
                setError('Erreur lors de l\'enregistrement de la boutique.');
            }
        } catch (error) {
            setError('Une erreur est survenue.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-green-600 flex justify-center items-center">
                        <Store size={48} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Ouvrir votre Boutique
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Renseignez les informations de votre commerce
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4">

                        {/* Store Name - Always First */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom de la boutique</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.storeName}
                                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                                required
                            />
                        </div>

                        {/* Autocomplete Search Bar */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher votre adresse</label>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <Search size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50"
                                        placeholder="Commencez à taper votre adresse..."
                                        value={query}
                                        onChange={handleSearchChange}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCurrentLocation}
                                    disabled={geoLoading}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-200 flex items-center gap-2 text-sm font-medium transition whitespace-nowrap"
                                    title="Utiliser ma position actuelle"
                                >
                                    {geoLoading ? <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div> : <MapPin size={18} />}
                                    Ma position
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

                        {/* Auto-filled Fields (Read-Only or Editable) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ville</label>
                                <input
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Code Postal</label>
                                <input
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={formData.zipCode}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rue</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                required
                            />
                        </div>

                        {/* Map Section */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> Ajuster la position si nécessaire
                            </label>
                            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0">
                                <MapContainer center={[33.5731, -7.5898]} zoom={13} style={{ height: '100%', width: '100%' }}>
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
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button type='submit' className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Enregistrer la Boutique
                    </button>
                </form>
            </div>
        </div>
    );
}
