import React, { useState, useRef, useEffect } from 'react';
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
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
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
    <header className="sticky top-0 z-40 w-full pt-3 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto liquid-glass-island rounded-full px-4 sm:px-6 py-2.5 shadow-2xl pointer-events-auto transition-all duration-300">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* SECTION 1 - LEFT: Brand Identity */}
          <div
            className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
            onClick={() => setActiveView('directory')}
            title="Go to Graveyard Directory"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-transform duration-300 group-hover:scale-105">
              <Layers className="w-4 h-4" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                Graveyard<span className="text-emerald-500">Track</span>
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                VisionOS
              </span>
            </div>
          </div>

          {/* SECTION 2 - CENTER: Navigation & Facility Selector */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-semibold backdrop-blur-xl">
              <button
                onClick={() => setActiveView('directory')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  activeView === 'directory'
                    ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-accentEmerald" />
                <span>Directory</span>
              </button>

              <button
                onClick={() => setActiveView('tracker')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  activeView === 'tracker'
                    ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-accentGold" />
                <span>Visual Tracker</span>
              </button>
            </div>

            {/* Active Facility Selector Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 transition-all cursor-pointer backdrop-blur-xl">
                <Building2 className="w-3.5 h-3.5 text-accentEmerald shrink-0" />
                <select
                  value={selectedGraveyardId}
                  onChange={(e) => setSelectedGraveyardId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-3 appearance-none max-w-[140px] truncate"
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
                <ChevronDown className="w-3 h-3 text-slate-400 -ml-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* SECTION 3 - RIGHT: Search, Theme Toggle, & Conditional Auth Elements */}
          <div className="flex items-center gap-2">
            {/* Global Search Trigger (Glass Pill) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-all text-xs font-medium backdrop-blur-xl"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline text-xs">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white/60 dark:bg-black/30 border border-white/30 dark:border-white/10 rounded-full text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Single Sun/Moon iOS Theme Toggle */}
            <ThemeToggle floating={false} />

            {/* CONDITIONAL AUTH: GUEST vs AUTHENTICATED */}
            {currentUser ? (
              /* AUTHENTICATED USER: Single avatar badge with role & dropdown menu */
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 transition-all backdrop-blur-xl cursor-pointer"
                  aria-label="User account menu"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ${
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

                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[90px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {currentUser.role === 'Graveyard Admin' ? 'Admin' : currentUser.role}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Summary Card */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-darkMuted/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {currentUser.name}
                        </span>
                        <Badge
                          variant={currentUser.status === 'Approved' ? 'emerald' : 'gold'}
                          size="sm"
                        >
                          {currentUser.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                      {assignedGraveyard && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3" />
                          <span>{assignedGraveyard.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Navigation / Role Dashboard Links */}
                    <div className="p-1 space-y-1">
                      {currentUser.role === 'Super Admin' && (
                        <button
                          onClick={() => {
                            setActiveView('superadmin');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Super Admin Dashboard</span>
                        </button>
                      )}

                      {currentUser.role === 'Graveyard Admin' && (
                        <button
                          onClick={() => {
                            setActiveView('admin_portal');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Cemetery Admin Portal</span>
                        </button>
                      )}

                      {currentUser.role === 'Staff/Patrol' && (
                        <button
                          onClick={() => {
                            setActiveView('tracker');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Night Patrol & High-Risk Watch</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveView('my_bookings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <BookmarkCheck className="w-4 h-4 text-sky-500" />
                        <span>My Bookings & Records</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('admin_portal');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>System Settings</span>
                      </button>
                    </div>

                    {/* Sign Out CTA */}
                    <div className="pt-2 mt-1 border-t border-slate-100 dark:border-darkMuted/60 px-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST / UNAUTHENTICATED: Show only "+ Register Graveyard", "Sign In", "Sign Up" */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveView('register_graveyard')}
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold transition-all backdrop-blur-xl"
                  title="Register new cemetery facility"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Graveyard</span>
                </button>

                <button
                  onClick={() => setActiveView('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-500 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/15 border border-white/40 dark:border-white/10 transition-all backdrop-blur-xl"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => setActiveView('signup')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
