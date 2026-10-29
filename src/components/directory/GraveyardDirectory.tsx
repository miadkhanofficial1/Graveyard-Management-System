import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  ArrowRight,
  Plus,
  Compass,
  Navigation,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GraveyardMap } from '../map/GraveyardMap';
import { Badge } from '../common/Badge';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <div className="space-y-4">
      {/* Directory Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-emerald">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              National Graveyard Spatial Directory
              <Badge variant="emerald" size="sm">
                {graveyards.length} Facilities
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locate registered municipal burial grounds, inspect real-time capacity & multi-layer grids
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-xs px-4 py-2 rounded-full border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold backdrop-blur-xl"
          >
            {isSidebarOpen ? 'Hide List' : 'Show List'}
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-[0_8px_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Graveyard</span>
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left: Graveyard Directory List (iOS VisionOS Glass Panel) */}
        {isSidebarOpen && (
          <div className="lg:col-span-5 flex flex-col liquid-glass-card rounded-[28px] overflow-hidden">
            {/* Filter Controls */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 space-y-3 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter by facility name or location..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-medium"
                />
              </div>

              {/* District & Status Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    District
                  </label>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl liquid-glass-input text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d} className="bg-white dark:bg-slate-900">
                        {d === 'All' ? 'All Districts' : d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Approval Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'All' | 'Approved' | 'Pending')
                    }
                    className="w-full p-2 text-xs rounded-xl liquid-glass-input text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="All" className="bg-white dark:bg-slate-900">All Statuses</option>
                    <option value="Approved" className="bg-white dark:bg-slate-900">Approved Only</option>
                    <option value="Pending" className="bg-white dark:bg-slate-900">Pending Committee</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Results */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 max-h-[580px]">
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
                    <div
                      key={gy.id}
                      onClick={() => setSelectedGraveyardId(gy.id)}
                      className={`group p-4 sm:p-4.5 rounded-[24px] border transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                        isSelected
                          ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-[0_8px_24px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40 backdrop-blur-2xl'
                          : 'border-white/40 dark:border-white/10 hover:border-emerald-500/30 bg-white/40 dark:bg-white/5 backdrop-blur-xl'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            {gy.name}
                          </h4>
                        </div>
                        <Badge variant={isPending ? 'gold' : 'emerald'} size="sm" dot>
                          {gy.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          {gy.address}, {gy.district}
                        </span>
                      </p>

                      {/* Capacity Bar (iOS Pill Frosted Track with Glowing Neon Gradient) */}
                      <div className="mt-3.5 pt-3 border-t border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Occupied Capacity
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {gy.occupiedSlots} / {gy.totalSlots} Slots ({occPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPending
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : occPercent > 85
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                            }`}
                            style={{ width: `${occPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Quick Action */}
                      <div className="mt-3.5 pt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
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
                            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                            title="Open Google Maps Turn-by-Turn Route Navigation"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Directions</span>
                          </a>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnterTracker(gy.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
                        >
                          <span>Explore Visual Map</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right: Interactive Map (iOS VisionOS Rounded Viewport) */}
        <div
          className={`${
            isSidebarOpen ? 'lg:col-span-7' : 'lg:col-span-12'
          } relative z-0 isolate h-[600px] min-h-[500px] max-h-[calc(100vh-140px)] rounded-[28px] overflow-hidden border border-white/40 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl`}
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
