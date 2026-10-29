import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  User,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeHighRiskStatus } from '../../utils/security';
import { Badge } from '../common/Badge';

export const NightPatrolDashboard: React.FC = () => {
  const {
    currentSlots,
    selectedGraveyard,
    getSlotDeceasedHistory,
    getSlotPatrolLogs,
    offlinePatrolQueue,
    isSimulatedOffline,
    setIsSimulatedOffline,
    logPatrolCheckOffline,
    syncOfflineQueue,
    setIsReportIncidentOpen,
    setIncidentTargetSlotId,
  } = useApp();

  const [guardName, setGuardName] = useState('Md. Abdur Rahim (Night Patrol)');

  // Filter all 14-day high-risk slots
  const highRiskSlots = currentSlots.filter((s) => {
    const risk = computeHighRiskStatus(s.lastBurialDate);
    return s.highRiskAlert || risk.isHighRisk;
  });

  return (
    <div className="space-y-6">
      {/* Mobile Staff Patrol Control Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-emerald-500/20 text-accentEmerald border border-emerald-500/40">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accentEmerald" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Mobile Night-Patrol Command
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Live Shift Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedGraveyard?.name} • Security Perimeter Surveillance
              </p>
            </div>
          </div>

          {/* Network & Offline Status Widget */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isSimulatedOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-gold'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title="Toggle simulated offline state to test PWA caching"
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-accentEmerald" />
                  <span>Online Connected</span>
                </>
              )}
            </button>

            {offlinePatrolQueue.length > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accentEmerald hover:bg-emerald-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                title="Sync offline cached patrol checks to cloud registry"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sync Queue ({offlinePatrolQueue.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Guard on duty profile selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Security Guard on Duty:</span>
            <input
              type="text"
              value={guardName}
              onChange={(e) => setGuardName(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-semibold text-xs focus:outline-none focus:border-accentEmerald"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Critical Subsidence Targets:</span>
            <span className="font-bold text-rose-400">{highRiskSlots.length} Fresh Mounds</span>
          </div>
        </div>
      </div>

      {/* Offline Queue Notice Banner */}
      {offlinePatrolQueue.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> {offlinePatrolQueue.length} check-in(s) cached locally in Indexed/LocalStorage. Ready to flush when online connection is restored.
            </span>
          </div>

          <button
            onClick={syncOfflineQueue}
            className="text-xs font-bold text-amber-900 dark:text-amber-100 underline shrink-0 hover:opacity-80"
          >
            Force Sync Now
          </button>
        </div>
      )}

      {/* List of 14-Day High Risk Subsidence Plots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              14-Day High-Risk Subsidence Rounds
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fresh graves requiring daily soil settlement inspection, boundary stabilization, and nocturnal vigilance
            </p>
          </div>

          <Badge variant="rose" size="sm" dot>
            {highRiskSlots.length} High-Risk Targets
          </Badge>
        </div>

        {highRiskSlots.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkCard">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              All Fresh Mounds Stabilized
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              No graves in this facility are currently within the critical 14-day soil settlement window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskSlots.map((slot) => {
              const deceasedList = getSlotDeceasedHistory(slot.id);
              const latestDeceased = deceasedList[deceasedList.length - 1];
              const riskStatus = computeHighRiskStatus(slot.lastBurialDate);
              const slotLogs = getSlotPatrolLogs(slot.id);
              const latestLog = slotLogs[0];

              // Check if currently queued offline for this slot
              const isQueued = offlinePatrolQueue.some((q) => q.slotId === slot.id);

              return (
                <div
                  key={slot.id}
                  className="p-5 rounded-2xl bg-white dark:bg-darkCard border-2 border-rose-200/80 dark:border-rose-900/60 shadow-md space-y-4 relative overflow-hidden"
                >
                  {/* Top Header Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                          Slot {slot.slotNumber}
                        </span>
                        <Badge variant="rose" size="sm" dot>
                          {riskStatus.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Soil Category: <span className="font-semibold text-accentEmerald">{slot.soilCategory}</span> • Row {slot.row}, Col {slot.col}
                      </p>
                    </div>

                    {isQueued && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                        Cached in Queue
                      </span>
                    )}
                  </div>

                  {/* Deceased Information */}
                  {latestDeceased && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-darkMuted/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {latestDeceased.deceasedName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Layer {latestDeceased.burialOrder}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Buried: {new Date(latestDeceased.burialDate).toLocaleDateString()} • Relative: {latestDeceased.relativeName} (+880 ••••-••{latestDeceased.relativePhoneLast4})
                      </p>
                    </div>
                  )}

                  {/* 14-Day Settlement Visual Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        Critical Settlement Timeline:
                      </span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {riskStatus.dayNumber} / 14 Days ({riskStatus.daysRemaining} days remaining)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (riskStatus.dayNumber / 14) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Latest Check-in Status */}
                  <div className="pt-2 border-t border-slate-100 dark:border-darkMuted/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Last Inspected
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {latestLog ? new Date(latestLog.timestamp).toLocaleTimeString() : 'Pending Shift Check'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Status
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {latestLog?.status || 'Awaiting Check'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() =>
                        logPatrolCheckOffline(
                          slot.id,
                          guardName,
                          'Secure',
                          'Fresh soil mound settlement stable. Perimeter security verified.'
                        )
                      }
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Log Check (Secure)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIncidentTargetSlotId(slot.id);
                        setIsReportIncidentOpen(true);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900 hover:bg-rose-100 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Report Tampering</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
