import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const languages = [
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
        document.body.dir = currentLang.dir;
        document.documentElement.lang = currentLang.code;
    }, [i18n.language]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 focus:outline-none"
            >
                <span className="uppercase text-sm font-bold">{i18n.language.split('-')[0]}</span>
                <ChevronDown size={14} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fade-in">
                    <ul className="py-1">
                        {languages.map((lng) => (
                            <li key={lng.code}>
                                <button
                                    onClick={() => changeLanguage(lng.code)}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${i18n.language === lng.code ? 'font-bold text-green-600' : 'text-gray-700'}`}
                                >
                                    {lng.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
