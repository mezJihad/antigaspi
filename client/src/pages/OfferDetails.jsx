import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, MapPin, Store, Calendar, Tag, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const OfferDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await fetch(`/api/offers/${id}`);
                if (!response.ok) throw new Error('Offre introuvable');
                const data = await response.json();
                setOffer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOffer();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!offer) return null;

    const hasLocation = offer.sellerAddress?.latitude && offer.sellerAddress?.longitude;
    const position = hasLocation ? [offer.sellerAddress.latitude, offer.sellerAddress.longitude] : null;



    // ... (rest of hook calls)

    // ...

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6 transition bg-transparent border-none cursor-pointer"
            >
                <ArrowLeft size={20} className="mr-2" />
                Retour aux offres
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Image & Details */}
                <div>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm mb-6 bg-gray-100">
                        <img
                            src={offer.pictureUrl || "https://placehold.co/600x400/e2e8f0/1e293b?text=Antigaspi"}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{offer.title}</h1>
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700`}>
                            {offer.category}
                        </span>
                        {offer.status === 'PUBLISHED' && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                Disponible
                            </span>
                        )}
                    </div>

                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-4xl font-bold text-green-600">
                            {offer.price} {offer.priceCurrency}
                        </span>
                        {offer.originalPrice > offer.price && (
                            <span className="text-xl text-gray-400 line-through decoration-red-400">
                                {offer.originalPrice} {offer.originalPriceCurrency}
                            </span>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold mb-3">Description</h2>
                        <p className="text-gray-600 leading-relaxed">{offer.description}</p>
                    </div>
                </div>

                {/* Right Column: Key Info & Map */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Store className="text-green-600" size={20} />
                            Le Commerçant
                        </h2>
                        <div className="space-y-3">
                            <p className="font-medium text-gray-900">{offer.shopName}</p>
                            <p className="text-gray-600 flex items-start gap-2">
                                <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                                <span>
                                    {offer.sellerAddress?.street}, <br />
                                    {offer.sellerAddress?.zipCode} {offer.sellerAddress?.city}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm h-80 overflow-hidden relative z-0">
                        {hasLocation ? (
                            <MapContainer
                                center={position}
                                zoom={15}
                                style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position}>
                                    <Popup>
                                        <b>{offer.shopName}</b><br />
                                        {offer.title}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                <MapPin size={48} className="mb-2 opacity-20" />
                                <p>Localisation non disponible pour cette offre.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-sm flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">À récupérer avant le :</p>
                            <p>{new Date(offer.expirationDate).toLocaleDateString()} à {new Date(offer.expirationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>

                    {/*
                    <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200">
                        Réserver ce panier
                    </button>
                    */}
                </div>
            </div>
        </div>
    );
};

export default OfferDetails;
