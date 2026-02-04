import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, LogOut, LayoutDashboard, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Add hook
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

          <div className="flex items-center gap-4 rtl:flex-row-reverse">
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
        </div>
      </div>
    </nav >
  );
};

export default Navbar;
