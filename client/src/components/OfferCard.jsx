import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const OfferCard = ({ offer }) => {
    const discount = Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100);

    const getCategoryLabel = (cat) => {
        const labels = [
            '🥖 Boulangerie',
            '🍎 Fruits & Légumes',
            '🥩 Viandes & Poissons',
            '🧀 Produits Laitiers',
            '🍱 Plats Cuisinés',
            '🥫 Épicerie',
            '🎁 Panier Surprise',
            'Autre'
        ];
        // Handle string enum or index
        if (typeof cat === 'string') {
            // If backend sends string enum name (e.g. "Bakery")
            const map = {
                'Bakery': 0, 'Produce': 1, 'MeatFish': 2, 'Dairy': 3,
                'Prepared': 4, 'Grocery': 5, 'Surprise': 6, 'Other': 7
            };
            return labels[map[cat] ?? 7];
        }
        return labels[cat] || 'Produit';
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div style={{ position: 'relative', height: '160px', backgroundColor: '#eee' }}>
                {offer.pictureUrl ? (
                    <img
                        src={offer.pictureUrl}
                        alt={offer.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', background: '#e0e0e0' }}>
                        Image Produit
                    </div>
                )}
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                }}>
                    -{discount}%
                </div>

                {/* Category Badge */}
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    left: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#333',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {getCategoryLabel(offer.category)}
                </div>
            </div>

            <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {offer.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {offer.shopName}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                    <MapPin size={14} /> {offer.city}
                    <span style={{ margin: '0 0.25rem' }}>•</span>
                    <Clock size={14} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        {/* Validity Period */}
                        <span>Valide jusqu'au {offer.endDate
                            ? new Date(offer.endDate).toLocaleDateString()
                            : '...'}</span>

                        {/* Expiration Date (DLC) - HIGHLIGHTED */}
                        <div style={{
                            marginTop: '0.25rem',
                            color: '#ef4444',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <span>⚠️ DLC : {new Date(offer.expirationDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                        {offer.price.toFixed(2)} Dhs
                    </span>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                        {offer.originalPrice.toFixed(2)} Dhs
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OfferCard;
