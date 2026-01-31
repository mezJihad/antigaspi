import { Trash2, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmer", cancelText = "Annuler", type = "danger", icon }) {
    if (!isOpen) return null;

    const getTheme = () => {
        switch (type) {
            case 'danger':
                return {
                    bgIcon: 'bg-red-100',
                    textIcon: 'text-red-600',
                    btnBg: 'bg-red-600',
                    btnHover: 'hover:bg-red-700',
                    iconComp: <Trash2 size={24} />
                };
            case 'warning':
                return {
                    bgIcon: 'bg-orange-100',
                    textIcon: 'text-orange-600',
                    btnBg: 'bg-orange-600',
                    btnHover: 'hover:bg-orange-700',
                    iconComp: <AlertTriangle size={24} />
                };
            case 'success':
                return {
                    bgIcon: 'bg-green-100',
                    textIcon: 'text-green-600',
                    btnBg: 'bg-green-600',
                    btnHover: 'hover:bg-green-700',
                    iconComp: <CheckCircle2 size={24} />
                };
            default:
                return {
                    bgIcon: 'bg-blue-100',
                    textIcon: 'text-blue-600',
                    btnBg: 'bg-blue-600',
                    btnHover: 'hover:bg-blue-700',
                    iconComp: <Info size={24} />
                };
        }
    };

    const theme = getTheme();
    const IconComponent = icon || theme.iconComp;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
                <div className={`flex items-center gap-4 mb-4 ${theme.textIcon}`}>
                    <div className={`${theme.bgIcon} p-3 rounded-full`}>
                        {IconComponent}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>

                <div className="text-gray-600 mb-6">
                    {message}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white ${theme.btnBg} ${theme.btnHover} rounded-lg font-medium shadow-sm transition flex items-center gap-2`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
