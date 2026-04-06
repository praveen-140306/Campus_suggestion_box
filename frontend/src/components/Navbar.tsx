
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = (isMobile = false) => (
    <>
      {user && user.role !== 'admin' && (
        <>
          <Link
            to="/home"
            onClick={() => isMobile && setIsMenuOpen(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              location.pathname === '/home'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            } ${isMobile ? 'w-full active:scale-95' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Submit Suggestion
          </Link>
          <Link
            to="/my-suggestions"
            onClick={() => isMobile && setIsMenuOpen(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              location.pathname === '/my-suggestions'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            } ${isMobile ? 'w-full active:scale-95' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Suggestions
          </Link>
        </>
      )}

      {user && user.role === 'admin' && (
        <Link
          to="/admin"
          onClick={() => isMobile && setIsMenuOpen(false)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            location.pathname === '/admin'
              ? 'bg-white/15 text-white shadow-inner'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          } ${isMobile ? 'w-full active:scale-95' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin Portal
        </Link>
      )}

      {user && (
        <Link
          to="/profile"
          onClick={() => isMobile && setIsMenuOpen(false)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            location.pathname === '/profile'
              ? 'bg-white/15 text-white shadow-inner'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          } ${isMobile ? 'w-full active:scale-95' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
      )}

      {isMobile ? (
        <div className="w-full h-px bg-white/10 my-2"></div>
      ) : (
        <div className="w-px h-6 bg-white/20 mx-2"></div>
      )}

      <button
        onClick={() => {
          localStorage.removeItem('userInfo');
          window.location.href = '/welcome';
        }}
        className={`px-4 py-2 rounded-lg text-sm font-semibold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-all duration-200 flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link to={user?.role === 'admin' ? "/admin" : "/home"} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none">
              Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">Box</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Suggestion Portal</span>
          </div>
        </Link>

        {/* Desktop Menu - Strictly Hidden on Mobile */}
        <div className="hidden lg:flex items-center gap-1">
          {navigationLinks()}
        </div>

        {/* Mobile View - Simplified Top Bar (Logo and Logout only) */}
        <div className="flex lg:hidden items-center group">
          <button
            onClick={() => {
              localStorage.removeItem('userInfo');
              window.location.href = '/welcome';
            }}
            className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all duration-200"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

