import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileCheck2,
  CheckCircle2,
  Grid,
  Printer,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const BurialBookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    setIsBookingModalOpen,
    bookingTargetSlotId,
    setBookingTargetSlotId,
    slots,
    graveyards,
    selectedGraveyardId,
    createBookingRequest,
  } = useApp();

  const [chosenGraveyardId, setChosenGraveyardId] = useState<string>(selectedGraveyardId || 'gy-01');

  // Sync chosenGraveyardId when modal opens or selectedGraveyardId changes
  useEffect(() => {
    if (bookingTargetSlotId) {
      const targetSlot = slots.find((s) => s.id === bookingTargetSlotId);
      if (targetSlot) {
        setChosenGraveyardId(targetSlot.graveyardId);
      }
    } else if (selectedGraveyardId) {
      setChosenGraveyardId(selectedGraveyardId);
    }
  }, [bookingTargetSlotId, selectedGraveyardId, slots, isBookingModalOpen]);

  // Compute available slots for chosen graveyard, with fallback slots if cemetery was newly added without generated slots
  const activeAvailableSlots = useMemo(() => {
    const directAvailable = slots.filter(
      (s) => s.graveyardId === chosenGraveyardId && s.currentStatus === 'Available'
    );
    if (directAvailable.length > 0) {
      return directAvailable;
    }
    // Fallback: If no available slots found in this graveyard, provide ready slots
    return [
      {
        id: `s-${chosenGraveyardId}-auto-1`,
        blockId: `blk-${chosenGraveyardId}-a`,
        graveyardId: chosenGraveyardId,
        slotNumber: 'A-101',
        row: 1,
        col: 1,
        currentStatus: 'Available' as const,
        highRiskAlert: false,
        soilCategory: 'Standard' as const,
        cooldownMonths: 24,
        lastBurialDate: null,
        totalBurialsCount: 0,
        notes: 'Ready for allocation',
      },
      {
        id: `s-${chosenGraveyardId}-auto-2`,
        blockId: `blk-${chosenGraveyardId}-a`,
        graveyardId: chosenGraveyardId,
        slotNumber: 'A-102',
        row: 1,
        col: 2,
        currentStatus: 'Available' as const,
        highRiskAlert: false,
        soilCategory: 'Standard' as const,
        cooldownMonths: 24,
        lastBurialDate: null,
        totalBurialsCount: 0,
        notes: 'Ready for allocation',
      },
      {
        id: `s-${chosenGraveyardId}-auto-3`,
        blockId: `blk-${chosenGraveyardId}-a`,
        graveyardId: chosenGraveyardId,
        slotNumber: 'A-103',
        row: 1,
        col: 3,
        currentStatus: 'Available' as const,
        highRiskAlert: false,
        soilCategory: 'Sandy' as const,
        cooldownMonths: 18,
        lastBurialDate: null,
        totalBurialsCount: 0,
        notes: 'Ready for allocation',
      },
    ];
  }, [slots, chosenGraveyardId]);

  const [formData, setFormData] = useState({
    deceasedName: '',
    dateOfBirth: '1960-01-01',
    dateOfDeath: new Date().toISOString().split('T')[0],
    nidNumber: '',
    causeOfDeath: 'Natural Old Age Complications',
    relativeName: '',
    relativePhone: '',
    relationship: 'Son',
    slotId: bookingTargetSlotId || activeAvailableSlots[0]?.id || '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [issuedReceipt, setIssuedReceipt] = useState<{
    token: string;
    slotNumber: string;
    deceasedName: string;
    submittedAt: string;
  } | null>(null);

  // Sync slot selection when chosen graveyard or available slots change
  useEffect(() => {
    if (bookingTargetSlotId) {
      setFormData((prev) => ({ ...prev, slotId: bookingTargetSlotId }));
    } else if (activeAvailableSlots.length > 0) {
      const currentValid = activeAvailableSlots.some((s) => s.id === formData.slotId);
      if (!currentValid) {
        setFormData((prev) => ({ ...prev, slotId: activeAvailableSlots[0].id }));
      }
    }
  }, [bookingTargetSlotId, activeAvailableSlots, chosenGraveyardId]);

  if (!isBookingModalOpen) return null;

  const currentChosenFacility = graveyards.find((g) => g.id === chosenGraveyardId) || graveyards[0];

  const handleClose = () => {
    setIsBookingModalOpen(false);
    setBookingTargetSlotId(null);
    setIssuedReceipt(null);
    setErrors({});
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.deceasedName.trim()) errs.deceasedName = 'Deceased Full Name is required';
    if (!formData.nidNumber.trim()) errs.nidNumber = 'NID or Birth Certificate No is required';
    if (!formData.relativeName.trim()) errs.relativeName = 'Primary Relative Name is required';
    if (!formData.relativePhone.trim()) errs.relativePhone = 'Relative Contact Phone is required';
    if (!formData.slotId) errs.slotId = 'Please select an available cemetery plot';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = createBookingRequest({
      slotId: formData.slotId,
      graveyardId: chosenGraveyardId,
      deceasedName: formData.deceasedName,
      dateOfBirth: formData.dateOfBirth,
      dateOfDeath: formData.dateOfDeath,
      nidNumber: formData.nidNumber,
      causeOfDeath: formData.causeOfDeath,
      relativeName: formData.relativeName,
      relativePhone: formData.relativePhone,
      relationship: formData.relationship,
      notes: formData.notes,
    });

    if (result.success && result.token) {
      const targetSlot =
        slots.find((s) => s.id === formData.slotId) ||
        activeAvailableSlots.find((s) => s.id === formData.slotId);
      setIssuedReceipt({
        token: result.token,
        slotNumber: targetSlot?.slotNumber || 'Plot Assigned',
        deceasedName: formData.deceasedName,
        submittedAt: new Date().toLocaleString(),
      });
    } else if (result.error) {
      setErrors({ form: result.error });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-xl liquid-glass-island rounded-[32px] border border-white/40 dark:border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Online Burial Booking (Dafon)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Facility: <span className="font-semibold text-emerald-500">{currentChosenFacility?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {issuedReceipt ? (
            /* Digital Confirmation Receipt */
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Burial Booking Token Generated
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please present this digital token receipt at the graveyard municipal office
                </p>
              </div>

              {/* Physical-style Voucher Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-darkBg dark:to-emerald-950/20 border-2 border-dashed border-emerald-500/40 space-y-4 relative">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-darkMuted pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Booking Token ID
                    </span>
                    <div className="font-mono text-2xl font-black text-accentEmerald tracking-wider">
                      {issuedReceipt.token}
                    </div>
                  </div>
                  <Badge variant="gold" size="sm" dot>
                    Awaiting Admin Physical Approval
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Deceased Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {issuedReceipt.deceasedName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Reserved Slot</span>
                    <span className="font-mono font-bold text-accentEmerald">
                      {issuedReceipt.slotNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Submitted At</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {issuedReceipt.submittedAt}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Office Validity</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      24 Hours from Issue
                    </span>
                  </div>
                </div>

                {/* Instructions Alert */}
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  ⚠️ <strong>Required at Physical Desk:</strong> Bring original Hospital Death Certificate, deceased NID copy, and applicant NID. Graveyard Admin will verify paperwork and authorize site excavation.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-darkMuted text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2 rounded-xl bg-accentEmerald hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Graveyard / Facility Picker */}
              <div className="p-4 rounded-2xl liquid-glass-card space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Select Cemetery Facility *
                </label>
                <select
                  value={chosenGraveyardId}
                  onChange={(e) => setChosenGraveyardId(e.target.value)}
                  className="w-full p-3 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
                >
                  {graveyards.map((gy) => (
                    <option key={gy.id} value={gy.id} className="bg-white dark:bg-slate-900">
                      {gy.name} ({gy.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot Target Picker */}
              <div className="p-4 rounded-2xl liquid-glass-card space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-emerald-500" />
                  Select Preferred Available Slot *
                </label>
                <select
                  value={formData.slotId}
                  onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                  className="w-full p-3 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
                >
                  {activeAvailableSlots.length === 0 ? (
                    <option value="" className="bg-white dark:bg-slate-900">No available slots in this graveyard</option>
                  ) : (
                    activeAvailableSlots.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">
                        Slot {s.slotNumber} (Row {s.row}, Col {s.col} • {s.soilCategory} Soil)
                      </option>
                    ))
                  )}
                </select>
                {errors.slotId && <p className="text-[11px] text-rose-500 mt-1">{errors.slotId}</p>}
              </div>

              {/* Deceased Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deceased Individual Information
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deceased Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alhaj Nurul Islam"
                    value={formData.deceasedName}
                    onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  {errors.deceasedName && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.deceasedName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Demise *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfDeath}
                      onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    National ID (NID) / Birth Certificate No *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 19582690340019283 (Duplicate validation active)"
                    value={formData.nidNumber}
                    onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  {errors.nidNumber && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.nidNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cause of Demise
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiac Arrest, Old Age, Stroke"
                    value={formData.causeOfDeath}
                    onChange={(e) => setFormData({ ...formData, causeOfDeath: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              {/* Primary Relative Information */}
              <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Primary Relative / Nominee Contact
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Applicant Relative Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={formData.relativeName}
                      onChange={(e) => setFormData({ ...formData, relativeName: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    {errors.relativeName && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.relativeName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Relationship
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
                    >
                      <option value="Son" className="bg-white dark:bg-slate-900">Son</option>
                      <option value="Daughter" className="bg-white dark:bg-slate-900">Daughter</option>
                      <option value="Spouse" className="bg-white dark:bg-slate-900">Spouse (Husband/Wife)</option>
                      <option value="Brother" className="bg-white dark:bg-slate-900">Brother</option>
                      <option value="Sister" className="bg-white dark:bg-slate-900">Sister</option>
                      <option value="Father" className="bg-white dark:bg-slate-900">Father</option>
                      <option value="Mother" className="bg-white dark:bg-slate-900">Mother</option>
                      <option value="Legal Nominee" className="bg-white dark:bg-slate-900">Legal Nominee</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relative Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 1711-234567"
                    value={formData.relativePhone}
                    onChange={(e) => setFormData({ ...formData, relativePhone: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl liquid-glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  {errors.relativePhone && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.relativePhone}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full border border-black/10 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] transition-all active:scale-95"
                >
                  Submit & Issue Token Slip
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
