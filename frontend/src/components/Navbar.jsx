import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState('English');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Hide Navbar on Login, Register, and Official Auth pages
  const hideStartPaths = ['/login', '/register', '/up2'];
  const shouldHide = hideStartPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  // Safe User Retrieval
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Corrupt user data", e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowProfileMenu(false);
    navigate('/login');
  };

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'citizen': return '/user-dashboard';
      case 'worker': return '/worker-dashboard';
      case 'admin': return '/admin-dashboard';
      case 'governance': return '/governance-dashboard';
      default: return '/';
    }
  };

  // Modified helper to check for hash links specifically
  const isActive = (path) => {
    if (path.startsWith('#')) {
      return 'text-gray-700 hover:text-blue-600';
    }
    return location.pathname === path ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <div className="flex flex-col z-50 sticky top-0 font-sans">
      {/* --- GOVERNMENT TRICOLOR STRIP --- */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      {/* --- TOP HEADER (Official Info) --- */}
      <div className="bg-gray-100 border-b border-gray-300 py-2 px-4 text-xs font-bold text-gray-700 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Satyamev Jayate" className="h-5" />
            <span className="uppercase tracking-wide">Government of India</span>
          </div>
          <span className="text-gray-400">|</span>
          <span>Ministry of Urban Affairs</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => setLang(lang === 'English' ? 'हिंदी' : 'English')}>
            <span>🗣️</span> {lang}
          </div>
          <Link to="/up2" className="hover:underline text-blue-800">Department Login</Link>
        </div>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <nav className="bg-white shadow-md border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">

            {/* Logo Area */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-blue-900 rounded flex items-center justify-center text-white text-2xl shadow-lg border-b-4 border-orange-500">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-8 w-8 invert opacity-90" alt="Logo" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-3xl font-serif font-black text-gray-900 leading-none tracking-tight group-hover:text-blue-900 transition mb-0.5">
                  JanSetu<span className="text-orange-600">.AI</span>
                </span>
                <span className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                  Bridging People & Governance
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {user ? (
                <>
                  <Link to="/" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('/')}`}>Home</Link>
                  <Link to="/about" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('/about')}`}>About</Link>
                  <Link to="/services" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('/services')}`}>Services</Link>

                  <div className="ml-6 flex items-center gap-5 pl-6 border-l-2 border-gray-300">
                    <NotificationBell />

                    {/* Profile Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-gray-500 uppercase">Welcome</span>
                          <span className="text-sm font-bold text-blue-900">{user.name}</span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Account</p>
                            <p className="text-sm font-bold text-gray-900">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <Link
                              to={getDashboardRoute()}
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <span className="font-semibold">Dashboard</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="font-semibold">Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('/')}`}>Home</Link>
                  <Link to="/about" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('/about')}`}>About</Link>
                  <Link to="/services" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('/services')}`}>Services</Link>
                  <a href="#how-it-works" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('#how-it-works')}`}>Process</a>
                  <a href="#contact" className={`px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 ${isActive('#contact')}`}>Contact</a>

                  <Link to="/login" className="ml-4 bg-blue-900 border-b-4 border-blue-700 text-white px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wider hover:bg-blue-800 transition shadow">
                    Login / Track
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
