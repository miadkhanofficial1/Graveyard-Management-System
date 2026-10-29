import React from 'react';
import {
  MapPin,
  Phone,
  Calendar,
  Grid,
  Layers,
  AlertTriangle,
  Shield,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const OverviewCards: React.FC = () => {
  const {
    selectedGraveyard,
    currentBlocks,
    currentSlots,
    getSlotDeceasedHistory,
    activeRole,
    resetToMockData,
  } = useApp();

  if (!selectedGraveyard) return null;

  // Find all slots with active high-risk alerts in this graveyard
  const highRiskSlots = currentSlots.filter((s) => s.highRiskAlert);

  // Find all multi-layer slots (>= 2 burials)
  const multiLayerSlots = currentSlots.filter((s) => s.totalBurialsCount > 1);

  return (
    <div className="space-y-6">
      {/* Role Notice Banner */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 dark:from-emerald-950/40 dark:via-darkCard dark:to-amber-950/40 border border-emerald-500/20 dark:border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accentEmerald/20 text-accentEmerald">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Viewing System as: <span className="text-accentEmerald">{activeRole}</span>
              </span>
              <Badge variant="emerald" size="sm">
                Active Perspective
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeRole === 'Super Admin' &&
                'Master view enabled. Global cemetery management, data audits, and role overrides.'}
              {activeRole === 'Graveyard Admin' &&
                'Graveyard administration mode. Manage slots, allocate multi-layer burials, and oversee soil status.'}
              {activeRole === 'Staff/Patrol' &&
                'Field operations mode. Log perimeter rounds, inspect 14-day subsidence mounds, and report incidents.'}
              {activeRole === 'Public Relative' &&
                'Public family portal. Search ancestors by token or NID, locate assigned slots, and view burial documents.'}
            </p>
          </div>
        </div>

        <button
          onClick={resetToMockData}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-300 transition-colors shrink-0 hidden sm:inline-block"
          title="Reset local storage changes back to default seed mock database"
        >
          Reset Demo Data
        </button>
      </div>

      {/* Main Grid: Cemetery Details & High Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graveyard Profile Card */}
        <div className="p-6 rounded-[28px] liquid-glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  Active Facility
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedGraveyard.name}
                </h3>
              </div>
              <Badge variant="emerald" size="sm" dot>
                {selectedGraveyard.status}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mt-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {selectedGraveyard.address}, {selectedGraveyard.district},{' '}
                  {selectedGraveyard.division}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-[11px]">
                  Geo: {selectedGraveyard.coordinates.lat.toFixed(4)}° N,{' '}
                  {selectedGraveyard.coordinates.lng.toFixed(4)}° E
                </span>
              </div>
              {selectedGraveyard.contactNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedGraveyard.contactNumber}</span>
                </div>
              )}
              {selectedGraveyard.establishedYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Established: {selectedGraveyard.establishedYear}</span>
                </div>
              )}
            </div>
          </div>

          {/* Capacity Progress Bar (iOS Frosted Glowing Pill) */}
          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Facility Capacity
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {selectedGraveyard.occupiedSlots} / {selectedGraveyard.totalSlots} Slots (
                {Math.round((selectedGraveyard.occupiedSlots / selectedGraveyard.totalSlots) * 100)}
                %)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{
                  width: `${(selectedGraveyard.occupiedSlots / selectedGraveyard.totalSlots) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 14-Day High Risk Surveillance Banner */}
        <div className="p-6 rounded-[28px] liquid-glass-card border border-rose-500/20 dark:border-rose-500/20 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  14-Day High Risk Subsidence Watch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Slots interred within the last 14 days under heightened structural vigilance
                </p>
              </div>
            </div>
            <Badge variant="rose" size="sm" dot>
              {highRiskSlots.length} Active Alerts
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {highRiskSlots.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic">
                No active 14-day high risk slots in this graveyard.
              </p>
            ) : (
              highRiskSlots.map((slot) => {
                const deceasedList = getSlotDeceasedHistory(slot.id);
                const latestDeceased = deceasedList[deceasedList.length - 1];

                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/20 backdrop-blur-xl hover:border-rose-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-rose-500" />
                        Slot {slot.slotNumber}
                      </span>
                      <Badge variant="rose" size="sm">
                        Soil: {slot.soilCategory}
                      </Badge>
                    </div>

                    {latestDeceased && (
                      <div className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                        <p className="font-semibold">{latestDeceased.deceasedName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Burial: {new Date(latestDeceased.burialDate).toLocaleDateString()} (Layer{' '}
                          {latestDeceased.burialOrder})
                        </p>
                      </div>
                    )}

                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 font-medium line-clamp-1">
                      ⚠️ {slot.notes || 'Monitor daily for settlement & rain depression'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Blocks Visual Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cemetery Sectors & Grid Blocks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spatial allocation layout across registered sector blocks
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-md">
            {currentBlocks.length} Blocks Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentBlocks.map((block) => {
            const blockSlots = currentSlots.filter((s) => s.blockId === block.id);
            const occupied = blockSlots.filter((s) => s.currentStatus === 'Occupied').length;
            const cooldown = blockSlots.filter(
              (s) => s.currentStatus === 'Maturing_Cooldown'
            ).length;
            const available = blockSlots.filter((s) => s.currentStatus === 'Available').length;

            return (
              <div
                key={block.id}
                className="p-5 rounded-[24px] liquid-glass-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {block.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Grid: {block.rowCount} Rows × {block.colCount} Columns
                    </span>
                  </div>
                  <Badge variant="slate" size="sm">
                    {blockSlots.length} Slots
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] line-clamp-2">
                  {block.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/20 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    {occupied} Occupied
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    {cooldown} Cooldown
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
                    {available} Free
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layered Multi-Occupancy Spotlight */}
      <div className="p-6 rounded-[28px] liquid-glass-card shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Occupancy Layered Vaults
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grave plots hosting tiered burials (2nd and 3rd layers stacked chronologically)
              </p>
            </div>
          </div>
          <Badge variant="gold" size="sm">
            {multiLayerSlots.length} Multi-Tier Plots
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {multiLayerSlots.map((slot) => {
            const deceasedList = getSlotDeceasedHistory(slot.id);

            return (
              <div
                key={slot.id}
                className="p-5 rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/20 dark:border-white/10">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-amber-500" />
                    Slot {slot.slotNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="gold" size="sm">
                      {slot.totalBurialsCount} Layers Interred
                    </Badge>
                    <Badge variant="slate" size="sm">
                      Soil: {slot.soilCategory}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {deceasedList.map((dec, idx) => (
                    <div
                      key={dec.id}
                      className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-white/30 dark:border-white/10 text-xs flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
                          L{idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {dec.deceasedName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Buried: {new Date(dec.burialDate).toLocaleDateString()} • Cause: {dec.causeOfDeath}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 px-2 py-0.5 rounded-full shrink-0">
                        {dec.tokenReceiptId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
