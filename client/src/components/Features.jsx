import React from 'react';
import { TrendingUp, Users, Heart } from 'lucide-react';

const features = [
    {
        icon: <TrendingUp size={40} color="var(--color-secondary)" />,
        title: "Augmentez vos revenus",
        description: "Ne jetez plus votre argent. Vendez les produits qui seraient autrement perdus."
    },
    {
        icon: <Users size={40} color="var(--color-primary)" />,
        title: "Nouveaux Clients",
        description: "Attirez des consommateurs soucieux de leur budget qui découvriront votre boutique."
    },
    {
        icon: <Heart size={40} color="#E91E63" />, // Pinkish for heart
        title: "Éco-responsable",
        description: "Montrez votre engagement pour la planète. Les clients adorent les commerces durables."
    }
];

const Features = () => {
    return (
        <div style={{ padding: '6rem 1rem', backgroundColor: 'var(--color-bg)' }}>
            <div className="container">
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem', color: 'var(--color-text-main)' }}>
                    Pourquoi rejoindre Antigaspi ?
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {features.map((feature, index) => (
                        <div key={index} style={{
                            backgroundColor: 'white',
                            padding: '2.5rem',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-md)',
                            textAlign: 'center',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '1rem', background: 'var(--color-bg)', borderRadius: '50%' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
