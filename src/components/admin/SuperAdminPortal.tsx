import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Compass,
  Search,
  Filter,
  Check,
  X,
  Mail,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { computeHighRiskStatus } from '../../utils/security';

export const SuperAdminPortal: React.FC = () => {
  const {
    graveyards,
    slots,
    deceasedHistory,
    approveGraveyard,
    rejectGraveyard,
    setSelectedGraveyardId,
    setActiveView,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('All');

  // Compute Global Stats
  const totalGraveyards = graveyards.length;
  const approvedGraveyards = graveyards.filter((g) => g.status === 'Approved').length;
  const pendingGraveyards = graveyards.filter((g) => g.status === 'Pending');

  const totalSlotsCapacity = graveyards.reduce((acc, g) => acc + g.totalSlots, 0);
  const totalOccupiedSlots = graveyards.reduce((acc, g) => acc + g.occupiedSlots, 0);
  const totalBurialsRecorded = deceasedHistory.length;

  const totalHighRiskSlots = slots.filter((s) => {
    const risk = computeHighRiskStatus(s.lastBurialDate);
    return s.highRiskAlert || risk.isHighRisk;
  }).length;

  const filteredGraveyards = graveyards.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      g.district.toLowerCase().includes(searchFilter.toLowerCase()) ||
      g.address.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesDivision = divisionFilter === 'All' || g.division === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  const divisions = ['All', ...Array.from(new Set(graveyards.map((g) => g.division)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Portal Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white border border-purple-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>National Municipal Graveyard Directorate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Super Admin <span className="text-purple-400">Governance Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Centralized oversight, registration vetting, municipal compliance, and national spatial burial network administration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('directory')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Public Directory Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Statistical Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Facilities
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalGraveyards}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({approvedGraveyards} Approved, {pendingGraveyards.length} Pending)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="purple" size="sm">
              {pendingGraveyards.length > 0 ? `${pendingGraveyards.length} Action Needed` : 'All Approved'}
            </Badge>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Slots Capacity
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalSlotsCapacity.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({Math.round((totalOccupiedSlots / (totalSlotsCapacity || 1)) * 100)}% Occupancy)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-accentEmerald h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((totalOccupiedSlots / (totalSlotsCapacity || 1)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Registered Burials
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalBurialsRecorded}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Individual Ledger Records
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="blue" size="sm">
              Cryptographically Tokenized
            </Badge>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              14-Day High-Risk Watch
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {totalHighRiskSlots}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Fresh Subsidence Mounds
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="rose" size="sm" dot>
              Night Patrol Mandated
            </Badge>
          </div>
        </div>
      </div>

      {/* SECTION 1: Pending Graveyard Onboarding Requests */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-darkMuted/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Pending Graveyard Registration Requests
              </h2>
              <Badge variant={pendingGraveyards.length > 0 ? 'rose' : 'emerald'} size="sm">
                {pendingGraveyards.length} Pending
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review municipal graveyard accreditation petitions, committee contacts, and land documentation.
            </p>
          </div>
        </div>

        {pendingGraveyards.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Pending Graveyard Petitions
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All submitted cemetery onboarding requests have been vetted and accredited. Newly submitted petitions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingGraveyards.map((gy) => (
              <div
                key={gy.id}
                className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {gy.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {gy.address}, {gy.district}, {gy.division}
                      </p>
                    </div>
                    <Badge variant="gold" size="sm" dot>
                      Pending Review
                    </Badge>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Total Slots</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {gy.totalSlots}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Land Area</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {gy.landAreaAcre || 4.5} Acres
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Established</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {gy.establishedYear || 2021}
                      </span>
                    </div>
                  </div>

                  {/* Committee Contact Info */}
                  {gy.adminContact && (
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Committee Representative
                      </span>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {gy.adminContact.name} ({gy.adminContact.designation || 'Convener'})
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] pt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" /> {gy.adminContact.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {gy.adminContact.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Submitted: {new Date(gy.submissionDate || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectGraveyard(gy.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-white dark:bg-darkCard hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>

                    <button
                      onClick={() => approveGraveyard(gy.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: National Graveyard Registry & Facilities List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-darkMuted/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              National Graveyard Facility Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage capacity allocations, inspect spatial tracker grids, and monitor facility status.
            </p>
          </div>

          {/* Search & Division Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search facility name, district..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d} Division
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Facilities Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-darkMuted">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-darkMuted">
              <tr>
                <th className="p-3.5">Facility Name & Address</th>
                <th className="p-3.5">Region</th>
                <th className="p-3.5">Capacity & Fill</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGraveyards.map((gy) => {
                const fillPercent = Math.round((gy.occupiedSlots / (gy.totalSlots || 1)) * 100);
                return (
                  <tr
                    key={gy.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{gy.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {gy.address}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {gy.district}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{gy.division}</span>
                    </td>
                    <td className="p-3.5 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {gy.occupiedSlots} / {gy.totalSlots}
                        </span>
                        <span className="text-slate-400">{fillPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fillPercent > 80
                              ? 'bg-rose-500'
                              : fillPercent > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, fillPercent)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge
                        variant={gy.status === 'Approved' ? 'emerald' : 'gold'}
                        size="sm"
                        dot
                      >
                        {gy.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGraveyardId(gy.id);
                          setActiveView('tracker');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all active:scale-95"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Launch 2.5D</span>
                      </button>

                      {gy.status === 'Pending' && (
                        <button
                          onClick={() => approveGraveyard(gy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
