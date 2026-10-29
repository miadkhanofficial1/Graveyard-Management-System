import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  User,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeHighRiskStatus } from '../../utils/security';
import { Badge } from '../common/Badge';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

export const SlotDetailsDrawer: React.FC = () => {
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

  // Selected layer index (defaults to latest burial layer)
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
      setSelectedLayerIndex(deceasedList.length - 1);
    }
    setPhoneLast4Input('');
    setUnlockKeyInput('');
    setUnlockError(null);
  }, [selectedSlotId, deceasedList.length]);

  if (!slot) return null;

  const currentDeceased = deceasedList[selectedLayerIndex] || deceasedList[0];
  const hasMultipleLayers = deceasedList.length > 1;

  // Check if active user has administrative privilege or relative unlocked this dossier
  const isAdminRole = activeRole === 'Super Admin' || activeRole === 'Graveyard Admin';
  const isDossierUnlocked = currentDeceased
    ? isAdminRole || unlockedDossierIds.includes(currentDeceased.id)
    : false;

  // Status Badge formatting
  const statusBadgeVariant =
    slot.currentStatus === 'Available'
      ? 'emerald'
      : slot.currentStatus === 'Occupied'
      ? 'slate'
      : 'gold';

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
      setUnlockError('Verification failed: Credentials do not match registered records.');
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-end md:items-stretch md:justify-end">
        {/* Backdrop for mobile & desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSlotId(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xl pointer-events-auto"
        />

        {/* Bottom Sheet on Mobile / Right Drawer on Desktop */}
        <motion.div
          initial={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="pointer-events-auto relative w-full md:w-[500px] h-[85vh] md:h-full max-h-[85vh] md:max-h-full liquid-glass-island border-t md:border-t-0 md:border-l border-white/30 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden z-50 rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px]"
        >
          {/* iOS Mobile Bottom Sheet Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center md:hidden shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          {/* Header */}
          <div className="p-6 border-b border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                    Slot {slot.slotNumber}
                  </span>
                  <Badge variant={statusBadgeVariant} size="sm" dot>
                    {slot.currentStatus.replace('_', ' ')}
                  </Badge>
                  {slot.highRiskAlert && (
                    <Badge variant="rose" size="sm" dot>
                      14-Day Watch
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {block?.name} • {selectedGraveyard?.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedSlotId(null)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Soil & Cooldown Attributes */}
            <div className="mt-3.5 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted text-slate-600 dark:text-slate-300 font-medium">
                Soil: <span className="font-bold text-accentEmerald">{slot.soilCategory}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted text-slate-600 dark:text-slate-300 font-medium">
                Cooldown Cycle: <span className="font-bold">{slot.cooldownMonths} Mos</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted text-slate-600 dark:text-slate-300 font-medium font-mono">
                Row {slot.row}, Col {slot.col}
              </span>
            </div>
          </div>

          {/* Drawer Body Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 14-Day Alert Notification Warning Box */}
            {(slot.highRiskAlert || riskStatus.isHighRisk) && (
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h5 className="font-bold text-rose-800 dark:text-rose-300 text-xs">
                        {riskStatus.label}
                      </h5>
                      <p className="text-[11px] text-rose-700/90 dark:text-rose-400 mt-0.5 leading-relaxed">
                        Soil settlement vigilance active ({riskStatus.daysRemaining} days remaining in high-risk window). Guard rounds must check for soil depression or nocturnal tampering.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/50 flex items-center justify-between">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                    Perimeter Stakes: MONITORED
                  </span>
                  <button
                    onClick={() => {
                      setIncidentTargetSlotId(slot.id);
                      setIsReportIncidentOpen(true);
                    }}
                    className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white underline flex items-center gap-1"
                  >
                    <span>Report Desecration / Tampering (Police GD)</span>
                  </button>
                </div>
              </div>
            )}

            {/* AVAILABLE SLOT STATE: Online Booking CTA */}
            {slot.currentStatus === 'Available' && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/30 dark:to-darkCard border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-accentEmerald flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Plot is Available for Allocation
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Excavation verified with standard soil stability. Immediate burial allotment is open.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setBookingTargetSlotId(slot.id);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request Burial Slot (Dafon Booking)</span>
                </button>
              </div>
            )}

            {/* MULTI-OCCUPANCY TIMELINE STEPPER */}
            {hasMultipleLayers && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-accentGold flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Multi-Occupancy Stacked Layers ({deceasedList.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Click layer to inspect</span>
                </div>

                {/* Vertical Layer Timeline Stepper */}
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {deceasedList.map((dec, idx) => {
                    const isSelectedLayer = idx === selectedLayerIndex;
                    const isLatest = idx === deceasedList.length - 1;

                    return (
                      <div
                        key={dec.id}
                        onClick={() => setSelectedLayerIndex(idx)}
                        className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelectedLayer
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-accentGold shadow-sm ring-1 ring-accentGold/50'
                            : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkMuted hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Step Marker Node */}
                        <div
                          className={`absolute -left-6 top-3.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                            isSelectedLayer
                              ? 'bg-accentGold border-white dark:border-darkBg text-white'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="flex items-center justify-between">
                          <h6 className="text-xs font-bold text-slate-900 dark:text-white">
                            {dec.deceasedName}
                          </h6>
                          <Badge variant={isLatest ? 'emerald' : 'slate'} size="sm">
                            {isLatest ? 'Current Layer' : 'Archived'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>Buried: {new Date(dec.burialDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="font-mono">{dec.tokenReceiptId}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TIER 1: PUBLIC VIEW (UNRESTRICTED) */}
            {currentDeceased && (
              <div className="p-4 rounded-2xl bg-white dark:bg-darkBg border border-slate-200 dark:border-darkMuted/80 shadow-sm space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-darkMuted/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accentEmerald/10 text-accentEmerald">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentDeceased.deceasedName}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Lifespan: {birthYear} – {deathYear} • Layer: {currentDeceased.burialOrder} Depth
                      </span>
                    </div>
                  </div>
                  <Badge variant="blue" size="sm">
                    Tier 1: Public Info
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Year of Birth
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {birthYear}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Year of Demise
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {deathYear}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Interment Date
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(currentDeceased.burialDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Current Burial State
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {slot.currentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TIER 2: LOCKED PRIVATE DOSSIER & SECURITY GATE */}
            {currentDeceased && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    {isDossierUnlocked ? (
                      <Unlock className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Tier 2: Protected Private Dossier</span>
                  </span>

                  {isDossierUnlocked ? (
                    <Badge variant="emerald" size="sm" dot>
                      {isAdminRole ? 'Admin Bypass' : 'Relative Verified'}
                    </Badge>
                  ) : (
                    <Badge variant="gold" size="sm" dot>
                      Encrypted Gate
                    </Badge>
                  )}
                </div>

                {!isDossierUnlocked ? (
                  /* Security Verification Gate Box */
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-slate-50 dark:from-darkBg dark:to-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-accentGold shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          Restricted Family Record
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Cause of Death, Death Certificate PDFs, NID, and Relative Contacts are restricted under Digital Registry Privacy Standards.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUnlockSubmit} className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          1) Primary Relative Phone (Last 4 Digits) *
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="e.g. 4482"
                          value={phoneLast4Input}
                          onChange={(e) => setPhoneLast4Input(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkCard text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-accentEmerald"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          2) Exact Date of Death (YYYY-MM-DD) OR Token ID *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2026-10-23 or TKN-2026-RAY-0091"
                          value={unlockKeyInput}
                          onChange={(e) => setUnlockKeyInput(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkCard text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-accentEmerald"
                        />
                      </div>

                      {unlockError && (
                        <p className="text-[11px] text-rose-500 font-medium">{unlockError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Full Record Dossier</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Unlocked Full Private Dossier */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-white dark:bg-darkBg border border-emerald-500/40 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-darkMuted">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Authorized Record Decrypted
                      </span>

                      {!isAdminRole && (
                        <button
                          onClick={() => lockDossier(currentDeceased.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                        >
                          Lock Again
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Verified Cause of Death
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {currentDeceased.causeOfDeath}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Full National ID (NID)
                        </span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {currentDeceased.nidNumber}
                        </span>
                      </div>
                    </div>

                    {/* Registry Certificate & Token Bar */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-darkMuted/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Death Certificate Number:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {currentDeceased.deathCertificateNo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Digital Token ID:</span>
                        <span className="font-mono font-bold text-accentEmerald">
                          {currentDeceased.tokenReceiptId}
                        </span>
                      </div>
                    </div>

                    {/* Primary Relative Contact Details */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-darkMuted/60 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Registered Primary Relative
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentDeceased.relativeName}
                        </span>
                        <span className="font-mono text-accentEmerald font-semibold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          +880 1711-••{currentDeceased.relativePhoneLast4}
                        </span>
                      </div>
                    </div>

                    {/* Attached Legal Documents */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                        Official Legal Documents Attached ({currentDeceased.documents.length})
                      </span>
                      <div className="space-y-1.5">
                        {currentDeceased.documents.map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkCard text-xs"
                          >
                            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 truncate">
                              <FileText className="w-4 h-4 text-accentEmerald shrink-0" />
                              {doc.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActivePreviewDoc(doc.name)}
                              className="text-[11px] font-bold text-accentEmerald hover:underline flex items-center gap-1 shrink-0 p-1 cursor-pointer"
                            >
                              <span>View Document</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Memorial Marker Photo */}
                    {currentDeceased.gravestoneImageUrl && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Gravestone Memorial Photo
                        </span>
                        <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-darkMuted relative">
                          <img
                            src={currentDeceased.gravestoneImageUrl}
                            alt="Memorial Marker"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer Quick Action */}
          <div className="p-4 border-t border-slate-100 dark:border-darkMuted/60 bg-slate-50 dark:bg-darkBg/60 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Status: {slot.currentStatus}
            </span>

            {slot.currentStatus === 'Available' ? (
              <button
                onClick={() => {
                  setBookingTargetSlotId(slot.id);
                  setIsBookingModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accentEmerald hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Plot</span>
              </button>
            ) : (
              activeRole !== 'Public Relative' && (
                <button
                  onClick={() => {
                    alert(`Operational log initiated for slot ${slot.slotNumber}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Activity</span>
                </button>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Legal Document & PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={!!activePreviewDoc}
        onClose={() => setActivePreviewDoc(null)}
        documentName={activePreviewDoc || ''}
        deceased={currentDeceased}
        slot={slot}
        graveyardName={selectedGraveyard?.name}
      />
    </AnimatePresence>
  );
};
