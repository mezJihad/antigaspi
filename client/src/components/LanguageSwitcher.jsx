import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
        document.body.dir = currentLang.dir;
        document.documentElement.lang = currentLang.code;
    }, [i18n.language]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group">
            <button className="flex items-center space-x-1 text-gray-700 hover:text-green-600 focus:outline-none">
                <Globe size={20} />
                <span className="uppercase text-sm font-semibold">{i18n.language.split('-')[0]}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
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
        </div>
    );
}
