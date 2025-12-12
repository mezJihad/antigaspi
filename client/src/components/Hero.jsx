import React from 'react';
import { Download, ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <div style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '6rem 1rem',
            textAlign: 'center',
            borderRadius: '0 0 2rem 2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    lineHeight: 1.1
                }}>
                    Transformez le gaspillage en revenus
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem',
                    opacity: 0.9
                }}>
                    Rejoignez le réseau Antigaspi. Vendez rapidement vos produits à date courte, attirez de nouveaux clients et combattez le gaspillage alimentaire.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn" style={{
                        backgroundColor: 'white',
                        color: 'var(--color-primary)',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem'
                    }}>
                        <Download size={20} style={{ marginRight: '0.5rem' }} />
                        Télécharger l'App
                    </button>
                    <button className="btn" style={{
                        border: '2px solid white',
                        color: 'white',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem'
                    }}>
                        En savoir plus <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>

            {/* Decorative Circle */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1200px',
                height: '1000px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none'
            }}></div>
        </div>
    );
};

export default Hero;
