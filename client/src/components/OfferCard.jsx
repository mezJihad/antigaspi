import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Store, ArrowRight } from 'lucide-react';

const OfferCard = ({ offer, distance }) => {
    const { t } = useTranslation();

    // Helper to get color based on category
    const getCategoryColor = (category) => {
        const colors = {
            'Bakery': 'orange',
            'Produce': 'green',
            'MeatFish': 'red',
            'Dairy': 'blue',
            'Prepared': 'brown',
            'Grocery': 'purple',
            'Surprise': 'pink',
            'Other': 'gray'
        };
        return colors[category] || 'green';
    };

    const getCategoryLabel = (cat) => {
        // Map backend values (likely English/Enum strings) to translation keys used in SearchFilters
        const map = {
            'Bakery': 'cat_bakery',
            'Produce': 'cat_fruits', // Assuming 'Produce' maps to Fruits
            'Fruits': 'cat_fruits',
            'MeatFish': 'cat_meat',
            'Dairy': 'cat_dairy',
            'Prepared': 'cat_prepared',
            'Grocery': 'cat_grocery',
            'Surprise': 'cat_surprise',
            'Other': 'cat_other'
        };
        // If exact match found, return translated. Else try direct translation or fallback.
        const key = map[cat] || `cat_${cat?.toLowerCase()}`;
        return t(`search.${key}`, cat); // Fallback to cat if key not found (though t returns key usually)
    };

    return (
        <Link to={`/offers/${offer.id}`} className="group block h-full">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-100 h-full flex flex-col relative transform hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                        src={offer.pictureUrl || "https://placehold.co/600x400/e2e8f0/1e293b?text=Antigaspi"}
                        alt={offer.title}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges on Image */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {/* Distance Badge */}
                        {distance !== null && distance !== undefined && !isNaN(Number(distance)) && (
                            <div className="backdrop-blur-md bg-black/30 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                <MapPin size={12} />
                                {Number(distance).toFixed(1)} km
                            </div>
                        )}
                    </div>
                    <div className="absolute top-3 left-3">
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 bg-white/90 backdrop-blur-sm text-${getCategoryColor(offer.category)}-700 border border-white/50`}>
                            {getCategoryLabel(offer.category)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-green-700 transition">
                            {offer.title}
                        </h3>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                        {offer.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Store size={14} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{offer.shopName}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">{offer.city}</span>
                    </div>

                    {/* Footer: Price & Date */}
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                                <Clock size={12} />
                                {t('explore.expire_on', { date: new Date(offer.expirationDate).toLocaleDateString() })}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-green-600">
                                    {offer.price} {offer.priceCurrency}
                                </span>
                                {offer.originalPrice > offer.price && (
                                    <span className="text-sm text-gray-400 line-through decoration-red-300">
                                        {offer.originalPrice}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default OfferCard;
