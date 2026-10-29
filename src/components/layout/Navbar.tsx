import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Building2,
  ChevronDown,
  Layers,
  Map,
  Compass,
  Plus,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  LogOut,
  BookmarkCheck,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const {
    graveyards,
    selectedGraveyardId,
    setSelectedGraveyardId,
    setIsSearchOpen,
    activeView,
    setActiveView,
    currentUser,
    logout,
    showToast,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown and mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on view change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeView]);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    showToast({
      title: 'Signed Out',
      message: 'You have been successfully signed out.',
      type: 'info',
    });
    setActiveView('directory');
  };

  // User initials
  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const assignedGraveyard = currentUser?.graveyardId
    ? graveyards.find((g) => g.id === currentUser.graveyardId)
    : null;

  return (
    <header className="sticky top-0 z-40 w-full pt-2.5 sm:pt-3 px-3 sm:px-6 pointer-events-none">
      <div
        ref={mobileMenuRef}
        className="max-w-6xl mx-auto liquid-glass-island rounded-full px-3.5 sm:px-5 py-2 shadow-2xl pointer-events-auto transition-all duration-300 relative"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* SECTION 1 - LEFT: Brand Identity */}
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
            onClick={() => setActiveView('directory')}
            title="Go to Graveyard Directory"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-transform duration-300 group-hover:scale-105 shrink-0">
              <Layers className="w-4 h-4" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white dark:border-slate-900" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Graveyard<span className="text-emerald-500">Track</span>
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                VisionOS
              </span>
            </div>
          </div>

          {/* SECTION 2 - CENTER: Navigation & Facility Selector (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* View Switcher Capsule (Uniform h-9) */}
            <div className="flex items-center h-9 p-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-medium backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setActiveView('directory')}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-full transition-all duration-200 ${
                  activeView === 'directory'
                    ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-accentEmerald shrink-0" />
                <span>Directory</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('tracker')}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-full transition-all duration-200 ${
                  activeView === 'tracker'
                    ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-accentGold shrink-0" />
                <span>3D Grid</span>
              </button>
            </div>

            {/* Active Facility Selector Dropdown (Uniform h-9) */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 transition-all cursor-pointer backdrop-blur-xl">
                <Building2 className="w-3.5 h-3.5 text-accentEmerald shrink-0" />
                <select
                  value={selectedGraveyardId}
                  onChange={(e) => setSelectedGraveyardId(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-3 appearance-none max-w-[130px] truncate"
                  aria-label="Select active graveyard"
                >
                  {graveyards.map((gy) => (
                    <option
                      key={gy.id}
                      value={gy.id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-1"
                    >
                      {gy.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 -ml-2 pointer-events-none shrink-0" />
              </div>
            </div>
          </div>

          {/* SECTION 3 - RIGHT: Search, Theme Toggle, & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Global Search Trigger (Uniform h-9) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center sm:justify-start gap-1.5 h-9 w-9 sm:w-auto sm:px-3 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-all text-xs font-medium backdrop-blur-xl"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden lg:inline text-xs font-medium">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white/60 dark:bg-black/30 border border-white/30 dark:border-white/10 rounded-full text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Single Sun/Moon iOS Theme Toggle (Uniform h-9) */}
            <ThemeToggle floating={false} />

            {/* DESKTOP/TABLET AUTH CONTROLS */}
            <div className="hidden md:flex items-center gap-1.5">
              {currentUser ? (
                /* AUTHENTICATED USER: Uniform h-9 pill with avatar */
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 h-9 px-2 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 transition-all backdrop-blur-xl cursor-pointer"
                    aria-label="User account menu"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm shrink-0 ${
                        currentUser.role === 'Super Admin'
                          ? 'bg-purple-600'
                          : currentUser.role === 'Graveyard Admin'
                          ? 'bg-emerald-600'
                          : currentUser.role === 'Staff/Patrol'
                          ? 'bg-amber-600'
                          : 'bg-sky-600'
                      }`}
                    >
                      {initials}
                    </div>

                    <span className="text-xs font-medium text-slate-900 dark:text-white max-w-[80px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>

                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </span>
                          <Badge variant="emerald" size="sm">
                            {currentUser.role.split('/')[0]}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                        {assignedGraveyard && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{assignedGraveyard.name}</span>
                          </p>
                        )}
                      </div>

                      <div className="p-1 space-y-0.5">
                        {currentUser.role === 'Super Admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveView('superadmin');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Super Admin Dashboard</span>
                          </button>
                        )}

                        {currentUser.role === 'Graveyard Admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveView('admin_portal');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin Portal</span>
                          </button>
                        )}

                        {currentUser.role === 'Staff/Patrol' && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveView('tracker');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Night Patrol</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveView('my_bookings');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-sky-500" />
                          <span>My Bookings</span>
                        </button>
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-white/10 px-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* GUEST / UNAUTHENTICATED: Uniform h-9 pills */
                <>
                  <button
                    type="button"
                    onClick={() => setActiveView('register_graveyard')}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium transition-all backdrop-blur-xl"
                    title="Register new cemetery facility"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Register</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('login')}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-500 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 transition-all backdrop-blur-xl"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('signup')}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>

            {/* MOBILE HAMBURGER BUTTON (< 768px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-slate-700 dark:text-white" />
              ) : (
                <Menu className="w-4 h-4 text-slate-700 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER (< 768px) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 24, stiffness: 350 }}
              className="md:hidden absolute top-full left-0 right-0 mt-2 p-3.5 rounded-3xl backdrop-blur-3xl bg-white/95 dark:bg-slate-900/95 border border-white/40 dark:border-white/10 shadow-2xl space-y-3 z-50 pointer-events-auto"
            >
              {/* Navigation Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('directory')}
                  className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all ${
                    activeView === 'directory'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Directory</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('tracker')}
                  className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all ${
                    activeView === 'tracker'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>3D Grid</span>
                </button>
              </div>

              {/* Active Facility Selector */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Building2 className="w-4 h-4 text-accentEmerald shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Active Cemetery
                  </span>
                  <select
                    value={selectedGraveyardId}
                    onChange={(e) => setSelectedGraveyardId(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {graveyards.map((gy) => (
                      <option
                        key={gy.id}
                        value={gy.id}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        {gy.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Register Facility Button */}
              <button
                type="button"
                onClick={() => setActiveView('register_graveyard')}
                className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register Graveyard</span>
              </button>

              {/* Mobile Auth Section */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </span>
                      <Badge variant="emerald" size="sm">
                        {currentUser.role}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveView('my_bookings')}
                        className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-sky-500" />
                        <span>Bookings</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveView('login')}
                      className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('signup')}
                      className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
