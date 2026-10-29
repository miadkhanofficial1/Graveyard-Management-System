import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeHighRiskStatus } from '../../utils/security';
import { Badge } from '../common/Badge';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

export const SubsurfaceDossierDrawer: React.FC = () => {
  const {
    selectedSlotId,
    setSelectedSlotId,
    getSlotById,
    getSlotDeceasedHistory,
    getBlockById,
    selectedGraveyard,
    activeRole,
    unlockedDossierIds,
    unlockDossier,
    lockDossier,
    setIsBookingModalOpen,
    setBookingTargetSlotId,
    setIsReportIncidentOpen,
    setIncidentTargetSlotId,
  } = useApp();

  const slot = selectedSlotId ? getSlotById(selectedSlotId) : undefined;
  const deceasedList = selectedSlotId ? getSlotDeceasedHistory(selectedSlotId) : [];
  const block = slot ? getBlockById(slot.blockId) : undefined;
  const riskStatus = computeHighRiskStatus(slot?.lastBurialDate || null);

  // Active highlighted layer index (default to the top/latest interment layer)
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  // Unlock Challenge Inputs
  const [phoneLast4Input, setPhoneLast4Input] = useState('');
  const [unlockKeyInput, setUnlockKeyInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Document Preview Modal State
  const [activePreviewDoc, setActivePreviewDoc] = useState<string | null>(null);

  // Mobile Bottom Sheet Detection
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (deceasedList.length > 0) {
      // Latest burial is the last item
      setSelectedLayerIndex(deceasedList.length - 1);
    }
    setPhoneLast4Input('');
    setUnlockKeyInput('');
    setUnlockError(null);
  }, [selectedSlotId, deceasedList.length]);

  if (!slot) return null;

  const currentDeceased = deceasedList[selectedLayerIndex] || deceasedList[0];

  // Role verification
  const isAdminRole = activeRole === 'Super Admin' || activeRole === 'Graveyard Admin';
  const isDossierUnlocked = currentDeceased
    ? isAdminRole || unlockedDossierIds.includes(currentDeceased.id)
    : false;

  // Status Badge
  const statusBadgeVariant =
    slot.currentStatus === 'Available'
      ? 'emerald'
      : slot.currentStatus === 'Occupied'
      ? 'slate'
      : 'gold';

  // Cooldown calculation:
  // Required cooldown in months from slot.cooldownMonths (defaults to 24 or 36)
  const requiredCooldownMonths = slot.cooldownMonths || 24;
  let monthsElapsed = 0;
  let monthsRemaining = requiredCooldownMonths;
  let isCooldownComplete = false;

  if (slot.lastBurialDate) {
    const burialTime = new Date(slot.lastBurialDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.max(0, Math.floor((nowTime - burialTime) / (1000 * 60 * 60 * 24)));
    monthsElapsed = Math.floor(diffDays / 30.4);
    monthsRemaining = Math.max(0, requiredCooldownMonths - monthsElapsed);
    isCooldownComplete = monthsElapsed >= requiredCooldownMonths;
  } else if (slot.currentStatus === 'Available') {
    isCooldownComplete = true;
    monthsRemaining = 0;
  }

  // Handle Unlock Submission
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDeceased) return;

    if (!phoneLast4Input.trim()) {
      setUnlockError('Please enter the relative phone last 4 digits.');
      return;
    }
    if (!unlockKeyInput.trim()) {
      setUnlockError('Please enter Date of Death (YYYY-MM-DD) or Token ID.');
      return;
    }

    const success = unlockDossier(currentDeceased.id, phoneLast4Input, unlockKeyInput);
    if (!success) {
      setUnlockError('Verification failed: Credentials do not match municipal archive records.');
    } else {
      setUnlockError(null);
    }
  };

  const birthYear = currentDeceased
    ? new Date(currentDeceased.dateOfBirth).getFullYear()
    : null;
  const deathYear = currentDeceased
    ? new Date(currentDeceased.dateOfDeath).getFullYear()
    : null;

  // Soil settlement metrics
  const isRecentBurial = slot.highRiskAlert || riskStatus.isHighRisk;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-end md:items-stretch md:justify-end">
        {/* Semi-transparent Dimming Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSlotId(null)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Municipal Dossier Panel: Bottom Sheet on Mobile / Right Drawer on Desktop */}
        <motion.div
          initial={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          className="pointer-events-auto relative w-full md:w-[540px] h-[90vh] md:h-full max-h-[90vh] md:max-h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-700/80 shadow-2xl flex flex-col overflow-hidden z-50 rounded-t-2xl md:rounded-t-none text-slate-100"
        >
          {/* Mobile Bottom Sheet Drag Handle */}
          <div className="pt-2.5 pb-1 flex justify-center md:hidden shrink-0 bg-slate-900">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          {/* Dossier Header: Municipal Record Seal */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xl font-bold tracking-tight text-white">
                    Plot {slot.slotNumber}
                  </span>
                  <Badge variant={statusBadgeVariant} size="sm">
                    {slot.currentStatus.replace('_', ' ')}
                  </Badge>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Depth: {deceasedList.length} / 3 Max Layers
                  </span>
                  {isRecentBurial && (
                    <Badge variant="rose" size="sm" dot>
                      14-Day Subsidence Watch
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{block?.name || 'Main Sector'}</span>
                  <span className="text-slate-600">•</span>
                  <span>{selectedGraveyard?.name}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedSlotId(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all shrink-0"
                title="Close Subsurface Dossier"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geological & Spatial Coordinates Strip */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Soil Matrix
                </span>
                <span className="font-medium text-emerald-400">{slot.soilCategory}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Cooldown Cycle
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {slot.cooldownMonths} Mos Cycle
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  GPS Grid
                </span>
                <span className="font-mono text-slate-300">
                  {slot.coordinates ? `${slot.coordinates.lat.toFixed(4)}, ${slot.coordinates.lng.toFixed(4)}` : `R${slot.row}-C${slot.col}`}
                </span>
              </div>
            </div>
          </div>

          {/* Dossier Scrollable Main Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* 14-DAY RECENT INTERMENT SUBSIDENCE MONITORING */}
            {isRecentBurial && (
              <div className="p-3.5 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-xs text-rose-300">
                      Active Earth Settlement Warning ({riskStatus.daysRemaining} Days Left)
                    </h5>
                    <p className="text-[11px] text-rose-300/80 mt-0.5 leading-relaxed">
                      Recent grave closure requires daily soil compaction and perimeter inspection to prevent sinkage or nocturnal tampering.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-rose-400 text-[10px]">Settlement Sensor: ACTIVE</span>
                  <button
                    onClick={() => {
                      setIncidentTargetSlotId(slot.id);
                      setIsReportIncidentOpen(true);
                    }}
                    className="font-semibold text-rose-300 hover:text-white underline text-[11px]"
                  >
                    Report Incident (Police GD)
                  </button>
                </div>
              </div>
            )}

            {/* BIOCLIMATIC RE-BURIAL COOLDOWN STATUS */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Bioclimatic Cooldown Engine
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isCooldownComplete
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                }`}>
                  {isCooldownComplete ? 'Eligible for Re-Burial' : `${monthsRemaining} Mos Cooldown Left`}
                </span>
              </div>

              {/* Cooldown Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Soil Decomposition Progress:</span>
                  <span className="font-mono text-slate-200">
                    {monthsElapsed} / {requiredCooldownMonths} Months
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCooldownComplete ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((monthsElapsed / requiredCooldownMonths) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isCooldownComplete ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ Soil biological decomposition standard met ({requiredCooldownMonths} mos elapsed). Plot is certified for next sequential stacked interment.
                  </span>
                ) : (
                  <span>
                    Mandatory environmental interval mandated by municipal bylaws ({slot.soilCategory} soil requirement: {requiredCooldownMonths} months) before another casket or shroud layer may be deposited.
                  </span>
                )}
              </p>
            </div>

            {/* VERTICAL SUBSURFACE MULTI-OCCUPANCY CROSS-SECTION */}
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Vertical Subsurface Cross-Section
                </span>
                <span className="text-[11px] text-slate-400">
                  {deceasedList.length} / 3 Recorded Depths
                </span>
              </div>

              {/* Cutaway Stratum Container */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden divide-y divide-slate-800/80">
                {/* 1. Ground Surface Level */}
                <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-mono text-[10px] font-bold">
                      0m
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Ground Surface Level</div>
                      <div className="text-[10px] text-slate-400">
                        {isRecentBurial ? 'Active settlement monitor (14d)' : 'Stable turf & compaction'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Surface Plaque
                  </span>
                </div>

                {/* 2. Subsurface Layers (Ordered from Top/Shallow to Deep) */}
                {deceasedList.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      No subsurface interments recorded in this plot.
                    </p>
                    {slot.currentStatus === 'Available' && (
                      <button
                        onClick={() => {
                          setBookingTargetSlotId(slot.id);
                          setIsBookingModalOpen(true);
                        }}
                        className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Allot Initial Interment (Layer 1)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Render Stratum Slots reversed so Layer 3 (shallowest) is on top, Layer 1 (deepest) at bottom */
                  [...deceasedList].reverse().map((dec) => {
                    const originalIdx = deceasedList.findIndex((d) => d.id === dec.id);
                    const isSelected = originalIdx === selectedLayerIndex;
                    const isLatest = originalIdx === deceasedList.length - 1;
                    const depthMeters =
                      dec.burialOrder === '3rd'
                        ? '3.5 ft - 4.5 ft'
                        : dec.burialOrder === '2nd'
                        ? '5.5 ft - 6.5 ft'
                        : '7.5 ft - 8.5 ft';

                    return (
                      <div
                        key={dec.id}
                        onClick={() => setSelectedLayerIndex(originalIdx)}
                        className={`p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-slate-800/90 border-l-4 border-l-emerald-500'
                            : 'bg-slate-900/40 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center font-mono text-[10px] font-bold border shrink-0 ${
                            isSelected
                              ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            <span>L{originalIdx + 1}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-xs text-white">
                                {dec.deceasedName}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({depthMeters})
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>Interred: {new Date(dec.burialDate).toLocaleDateString()}</span>
                              <span className="text-slate-600">•</span>
                              <span className="font-mono text-[10px]">{dec.tokenReceiptId}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            isLatest
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {isLatest ? 'Active Top Tier' : 'Historic Base'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Subsurface Bedrock Base */}
                <div className="p-2.5 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Geological Foundation (~9.0 ft)</span>
                  <span>Compacted Clay Base</span>
                </div>
              </div>
            </div>

            {/* TIER 1: PUBLIC INTERMENT PROFILE */}
            {currentDeceased && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Tier 1: Public Memorial Data
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Layer {currentDeceased.burialOrder}
                    </span>
                  </div>
                  <Badge variant="blue" size="sm">
                    Public Record
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Name of Deceased
                    </span>
                    <span className="font-semibold text-slate-200">
                      {currentDeceased.deceasedName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Lifespan
                    </span>
                    <span className="font-medium text-slate-300">
                      {birthYear} – {deathYear}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Interment Date
                    </span>
                    <span className="font-medium text-slate-300">
                      {new Date(currentDeceased.burialDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Burial Order
                    </span>
                    <span className="font-mono font-medium text-slate-300">
                      Tier {currentDeceased.burialOrder} of 3 Max
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Municipal Token
                    </span>
                    <span className="font-mono text-emerald-400">
                      {currentDeceased.tokenReceiptId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Sector Placement
                    </span>
                    <span className="font-medium text-slate-300">
                      {block?.name || 'Section'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TIER 2: LOCKED PRIVATE ARCHIVE & VERIFICATION GATE */}
            {currentDeceased && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {isDossierUnlocked ? (
                      <Unlock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Tier 2: Protected Municipal Dossier</span>
                  </span>

                  {isDossierUnlocked ? (
                    <Badge variant="emerald" size="sm" dot>
                      {isAdminRole ? 'Admin Verified' : 'Relative Access Granted'}
                    </Badge>
                  ) : (
                    <Badge variant="gold" size="sm" dot>
                      Encrypted Gate
                    </Badge>
                  )}
                </div>

                {!isDossierUnlocked ? (
                  /* Two-Factor Verification Challenge Box */
                  <div className="p-4 rounded-xl border border-slate-700 bg-slate-950 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">
                          Family & Administrative Protection Gate
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          To protect privacy, death certificates, hospital cause of death, full NID, and relative contacts require 2-step verification.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUnlockSubmit} className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          1) Primary Relative Phone (Last 4 Digits)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="e.g. 4482"
                          value={phoneLast4Input}
                          onChange={(e) => setPhoneLast4Input(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          2) Exact Date of Death (YYYY-MM-DD) OR Token ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2026-10-23 or TKN-2026-RAY-0091"
                          value={unlockKeyInput}
                          onChange={(e) => setUnlockKeyInput(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {unlockError && (
                        <p className="text-[11px] text-rose-400 font-medium">{unlockError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Decrypt Complete Legal Dossier</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Decrypted Full Private Dossier */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl border border-emerald-800/80 bg-slate-950 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Municipal Legal Archive Unlocked
                      </span>

                      {!isAdminRole && (
                        <button
                          onClick={() => lockDossier(currentDeceased.id)}
                          className="text-[10px] text-slate-400 hover:text-white underline"
                        >
                          Relock
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Verified Cause of Death
                        </span>
                        <span className="font-semibold text-slate-200">
                          {currentDeceased.causeOfDeath}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          National ID (NID)
                        </span>
                        <span className="font-mono font-medium text-slate-200">
                          {currentDeceased.nidNumber}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Primary Relative Contact
                        </span>
                        <span className="font-medium text-slate-200">
                          {currentDeceased.relativeName} (Registered Kin)
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Relative Phone
                        </span>
                        <span className="font-mono text-emerald-400">
                          +880 17••-••{currentDeceased.relativePhoneLast4}
                        </span>
                      </div>
                    </div>

                    {/* Attached Legal Documents */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Official Certified Attachments
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => setActivePreviewDoc('death-certificate')}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-left transition-all flex items-center gap-2 group"
                        >
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 block truncate">
                              Death_Certificate.pdf
                            </span>
                            <span className="text-[10px] text-slate-500">DGHS Certified • 420 KB</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setActivePreviewDoc('burial-permit')}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-left transition-all flex items-center gap-2 group"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 block truncate">
                              Burial_Permit_Slip.pdf
                            </span>
                            <span className="text-[10px] text-slate-500">DNCC Municipal Allotment</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Dossier Bottom Action Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setIncidentTargetSlotId(slot.id);
                setIsReportIncidentOpen(true);
              }}
              className="py-2 px-3 rounded-lg border border-slate-700 hover:border-rose-600 hover:bg-rose-950/30 text-slate-300 hover:text-rose-200 text-xs font-medium transition-all"
            >
              Report GD Docket
            </button>

            {slot.currentStatus === 'Available' || isCooldownComplete ? (
              <button
                onClick={() => {
                  setBookingTargetSlotId(slot.id);
                  setIsBookingModalOpen(true);
                }}
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Book Burial Allotment</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                Cooldown Active ({monthsRemaining} Mos)
              </span>
            )}
          </div>
        </motion.div>

        {/* Legal Document Preview Modal */}
        {activePreviewDoc && currentDeceased && (
          <PDFPreviewModal
            isOpen={!!activePreviewDoc}
            onClose={() => setActivePreviewDoc(null)}
            documentName={activePreviewDoc === 'death-certificate' ? 'Official Death Certificate' : 'Burial Allotment Clearance Slip'}
            deceased={currentDeceased}
            slot={slot}
            graveyardName={selectedGraveyard?.name}
          />
        )}
      </div>
    </AnimatePresence>
  );
};
