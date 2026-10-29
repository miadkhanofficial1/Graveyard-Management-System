import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  ArrowRight,
  Plus,
  Compass,
  Navigation,
  Map,
  List,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GraveyardMap } from '../map/GraveyardMap';
import { Badge } from '../common/Badge';

const springTransition = {
  type: 'spring' as const,
  stiffness: 430,
  damping: 25,
  mass: 0.7,
};

export const GraveyardDirectory: React.FC = () => {
  const {
    graveyards,
    selectedGraveyardId,
    setSelectedGraveyardId,
    setActiveView,
    setIsRegisterModalOpen,
    blocks,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending'>('All');
  const [mobileTab, setMobileTab] = useState<'list' | 'map' | 'stacked'>('list');

  // Extract unique districts
  const districts = useMemo(() => {
    const list = Array.from(new Set(graveyards.map((g) => g.district)));
    return ['All', ...list];
  }, [graveyards]);

  // Filtered Graveyards
  const filteredGraveyards = useMemo(() => {
    return graveyards.filter((gy) => {
      const matchSearch =
        gy.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        gy.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
        gy.district.toLowerCase().includes(searchFilter.toLowerCase());

      const matchDistrict = districtFilter === 'All' || gy.district === districtFilter;
      const matchStatus = statusFilter === 'All' || gy.status === statusFilter;

      return matchSearch && matchDistrict && matchStatus;
    });
  }, [graveyards, searchFilter, districtFilter, statusFilter]);

  const handleEnterTracker = (id: string) => {
    setSelectedGraveyardId(id);
    setActiveView('tracker');
  };

  const handleSelectOnMobile = (id: string) => {
    setSelectedGraveyardId(id);
    // If mobile list view, give option to switch to map
    if (mobileTab === 'list' && window.innerWidth < 768) {
      setMobileTab('map');
    }
  };

  return (
    <div className="space-y-3">
      {/* Sleek Ultra-Compact Header Pill */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-full backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              Cemetery Spatial Directory
            </h2>
            <Badge variant="emerald" size="sm">
              {graveyards.length} Active
            </Badge>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Register Facility</span>
            <span className="sm:hidden">+ Register</span>
          </motion.button>
        </div>
      </div>

      {/* MOBILE SEGMENTED VIEW SWITCHER (< 768px) */}
      <div className="flex md:hidden items-center p-1 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-xs font-semibold shadow-sm">
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all ${
            mobileTab === 'list'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>List ({filteredGraveyards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all ${
            mobileTab === 'map'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Map View</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('stacked')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all ${
            mobileTab === 'stacked'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Stacked</span>
        </button>
      </div>

      {/* Main Responsive Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:h-[calc(100vh-140px)] min-h-[480px]">
        {/* Left: Graveyard Directory List */}
        <div
          className={`${
            mobileTab === 'map' ? 'hidden md:flex' : 'flex'
          } ${
            mobileTab === 'stacked' ? 'max-h-[380px] md:max-h-full' : ''
          } md:col-span-5 h-full flex-col backdrop-blur-2xl bg-white/60 dark:bg-slate-900/50 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] rounded-3xl overflow-hidden`}
        >
          {/* Filter Controls */}
          <div className="p-3 border-b border-black/5 dark:border-white/10 space-y-2.5 bg-white/30 dark:bg-white/5 backdrop-blur-xl shrink-0">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter facilities by name or location..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl liquid-glass-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all font-medium"
              />
            </div>

            {/* District & Status Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg liquid-glass-input text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  {districts.map((d) => (
                    <option key={d} value={d} className="bg-white dark:bg-slate-900">
                      {d === 'All' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'All' | 'Approved' | 'Pending')
                  }
                  className="w-full px-2 py-1 text-xs rounded-lg liquid-glass-input text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="All" className="bg-white dark:bg-slate-900">All Statuses</option>
                  <option value="Approved" className="bg-white dark:bg-slate-900">Approved Only</option>
                  <option value="Pending" className="bg-white dark:bg-slate-900">Pending Committee</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Results */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredGraveyards.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No graveyards match your filter criteria.
              </div>
            ) : (
              filteredGraveyards.map((gy) => {
                const isSelected = gy.id === selectedGraveyardId;
                const isPending = gy.status === 'Pending';
                const occPercent =
                  gy.totalSlots > 0
                    ? Math.round((gy.occupiedSlots / gy.totalSlots) * 100)
                    : 0;
                const gyBlocks = blocks.filter((b) => b.graveyardId === gy.id);

                return (
                  <motion.div
                    key={gy.id}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springTransition}
                    onClick={() => handleSelectOnMobile(gy.id)}
                    className={`group p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-[0_4px_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40 backdrop-blur-2xl'
                        : 'border-white/30 dark:border-white/10 hover:border-emerald-500/30 bg-white/40 dark:bg-white/5 backdrop-blur-xl'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {gy.name}
                      </h4>
                      <Badge variant={isPending ? 'gold' : 'emerald'} size="sm" dot>
                        {gy.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {gy.address}, {gy.district}
                      </span>
                    </p>

                    {/* Capacity Bar */}
                    <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Capacity
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {gy.occupiedSlots} / {gy.totalSlots} Slots ({occPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPending
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : occPercent > 85
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                          }`}
                          style={{ width: `${occPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Quick Action */}
                    <div className="mt-2.5 pt-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {gyBlocks.length || 1} Blocks
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${gy.coordinates.lat},${gy.coordinates.lng}&destination_place_id=${encodeURIComponent(
                            gy.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                          title="Open Google Maps Route Navigation"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Directions</span>
                        </a>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={springTransition}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnterTracker(gy.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <span>Explore Visual Map</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Interactive Map (Tablet 55% / Desktop 58% Split / Mobile stacked or tab) */}
        <div
          className={`${
            mobileTab === 'list' ? 'hidden md:block' : 'block'
          } ${
            mobileTab === 'stacked' ? 'h-[380px] md:h-full' : 'h-[440px] md:h-full'
          } md:col-span-7 relative z-0 isolate min-h-[380px] md:min-h-[500px] rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl`}
        >
          <GraveyardMap
            graveyards={filteredGraveyards}
            selectedGraveyardId={selectedGraveyardId}
            onSelectGraveyard={(id) => setSelectedGraveyardId(id)}
            onEnterTracker={handleEnterTracker}
          />
        </div>
      </div>
    </div>
  );
};
