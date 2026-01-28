import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Notification = ({ message, type = 'success', onClose, duration = 4000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!message) return null;

    // Styles based on type
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: 'text-green-500',
            Icon: CheckCircle
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: 'text-red-500',
            Icon: XCircle
        }
    };

    const currentStyle = styles[type] || styles.success;
    const Icon = currentStyle.Icon;

    return (
        <div className={`fixed top-24 right-4 z-[60] flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform animate-in slide-in-from-right-5 duration-300 ${currentStyle.bg} ${currentStyle.border} max-w-sm w-full pointer-events-auto`}>
            <Icon className={`mt-0.5 flex-shrink-0 ${currentStyle.icon}`} size={20} />
            <div className="flex-1">
                <p className={`text-sm font-medium ${currentStyle.text}`}>
                    {message}
                </p>
            </div>
            <button
                onClick={onClose}
                className={`p-1 rounded-full hover:bg-black/5 transition ${currentStyle.text} opacity-60 hover:opacity-100`}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Notification;
