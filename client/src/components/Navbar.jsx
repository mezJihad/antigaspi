import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, LogOut, LayoutDashboard, ChevronDown, Shield, Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const languages = [
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 rtl:flex-row-reverse">
          <div className="flex items-center">
            <Link to="/" dir="ltr" className="flex items-center gap-2 text-xl font-bold text-green-600 hover:text-green-700 transition">
              <Leaf size={24} />
              <span>NoGaspi</span>
            </Link>
          </div>

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <Link to="/" className="text-green-700 font-medium text-sm bg-green-50 px-3 py-1 rounded-full whitespace-nowrap hover:bg-green-100 transition">
              {t('home.subtitle')}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 rtl:flex-row-reverse">
            <LanguageSwitcher />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-200 focus:outline-none"
                >
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm border border-green-200">
                    {getInitials(user.firstName, user.lastName) || <User size={18} />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.firstName}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 transform origin-top-right transition-all z-50">
                    <div className="px-4 py-3">
                      <p className="text-xs text-gray-500 uppercase font-semibold">{t('nav.login')}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {user.role === 'ADMIN' ? (
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                        >
                          <Shield size={16} className="ltr:mr-3 rtl:ml-3 text-gray-400 group-hover:text-green-600" />
                          {t('nav.dashboard')}
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                        >
                          <LayoutDashboard size={16} className="ltr:mr-3 rtl:ml-3 text-gray-400 group-hover:text-green-600" />
                          {t('nav.dashboard')}
                        </Link>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                          navigate('/');
                        }}
                        className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="ltr:mr-3 rtl:ml-3 text-red-400 group-hover:text-red-600" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm shadow-sm hover:shadow-md"
                >
                  {t('nav.seller_space')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl flex flex-col p-6 animate-slide-left">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-gray-900">{t('nav.menu')}</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {user ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg border border-green-200">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold mb-0.5">{t('nav.greeting')}</p>
                      <p className="font-bold text-gray-900 text-lg">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>

                  {/* Explore Offers Link */}
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <Globe size={22} strokeWidth={1.5} />
                    <span className="font-medium text-lg">{t('nav.explore')}</span>
                  </Link>

                  {/* Dashboard Link */}
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <LayoutDashboard size={22} strokeWidth={1.5} />
                    <span className="font-medium text-lg">{t('nav.dashboard')}</span>
                  </Link>

                  {/* Language Selection */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">{t('nav.language')}</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {languages.map((lng) => (
                        <button
                          key={lng.code}
                          onClick={() => changeLanguage(lng.code)}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${i18n.language === lng.code
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                          {lng.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
                    >
                      <LogOut size={18} />
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors"
                  >
                    <User size={20} />
                    {t('nav.seller_space')}
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold shadow-sm hover:bg-green-100 transition-colors"
                  >
                    <Globe size={20} />
                    {t('nav.explore')}
                  </Link>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <Globe size={16} /> Langue
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {languages.map((lng) => (
                        <button
                          key={lng.code}
                          onClick={() => changeLanguage(lng.code)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${i18n.language === lng.code
                            ? 'border-green-500 bg-green-50 text-green-700 font-bold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          <span>{lng.name}</span>
                          {i18n.language === lng.code && <div className="h-2 w-2 rounded-full bg-green-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav >
  );
};

export default Navbar;
