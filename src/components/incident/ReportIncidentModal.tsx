import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Camera,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportIncidentModal: React.FC = () => {
  const {
    isReportIncidentOpen,
    setIsReportIncidentOpen,
    incidentTargetSlotId,
    setIncidentTargetSlotId,
    currentSlots,
    selectedGraveyard,
    createIncidentReportWithDocket,
    getSlotDeceasedHistory,
  } = useApp();

  const [formData, setFormData] = useState({
    slotId: incidentTargetSlotId || currentSlots[0]?.id || '',
    incidentType: 'Grave Tampering & Earth Subsidence Incident',
    reportedBy: 'Md. Abdur Rahim (Night Patrol Staff)',
    guardOnDuty: 'Md. Abdur Rahim (Night Patrol Staff)',
    policeStation: selectedGraveyard?.id === 'gy-01' ? 'Mohammadpur Police Station, DMP' : 'Banani Police Station, DMP',
    suspectedDate: new Date().toISOString().slice(0, 16),
    description: '',
    evidencePhotos: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
    ],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (incidentTargetSlotId) {
      setFormData((prev) => ({ ...prev, slotId: incidentTargetSlotId }));
    }
  }, [incidentTargetSlotId]);

  if (!isReportIncidentOpen) return null;

  const targetSlot = currentSlots.find((s) => s.id === formData.slotId);
  const deceasedList = formData.slotId ? getSlotDeceasedHistory(formData.slotId) : [];
  const latestDeceased = deceasedList[deceasedList.length - 1];

  const handleClose = () => {
    setIsReportIncidentOpen(false);
    setIncidentTargetSlotId(null);
    setErrors({});
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.description.trim()) {
      errs.description = 'Detailed incident specifics and physical observations required.';
    }
    if (!formData.reportedBy.trim()) {
      errs.reportedBy = 'Reporting officer / staff name is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createIncidentReportWithDocket({
      graveyardId: selectedGraveyard?.id || 'gy-01',
      slotId: formData.slotId,
      deceasedId: latestDeceased?.id,
      reportedBy: formData.reportedBy,
      policeStation: formData.policeStation,
      guardOnDuty: formData.guardOnDuty,
      suspectedDate: formData.suspectedDate,
      description: `[${formData.incidentType}] ${formData.description}`,
      evidencePhotos: formData.evidencePhotos,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkMuted shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-darkMuted/60 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Report Desecration / Tampering (Police GD Docket)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official security incident logging & instant General Diary (GD) generation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Target Plot Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-darkMuted space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Target Cemetery Slot *
              </span>
              <span className="font-mono text-accentEmerald">
                {targetSlot?.slotNumber ? `Slot ${targetSlot.slotNumber}` : 'Select Slot'}
              </span>
            </div>

            <select
              value={formData.slotId}
              onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkBg text-slate-900 dark:text-white font-mono"
            >
              {currentSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  Slot {s.slotNumber} ({s.currentStatus} • {s.highRiskAlert ? '14-Day Watch' : 'Normal'})
                </option>
              ))}
            </select>

            {latestDeceased && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Interred Deceased: <strong>{latestDeceased.deceasedName}</strong> (NID: {latestDeceased.nidNumber})
              </p>
            )}
          </div>

          {/* Incident Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Classification *
            </label>
            <select
              value={formData.incidentType}
              onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Grave Tampering & Earth Subsidence Incident">
                Grave Tampering & Soil Subsidence
              </option>
              <option value="Attempted Grave Desecration & Perimeter Breach">
                Attempted Grave Desecration / Vandalism
              </option>
              <option value="Tombstone & Boundary Marker Defacement">
                Tombstone / Boundary Marker Defacement
              </option>
              <option value="Unauthorized Nocturnal Intrusion">
                Unauthorized Nocturnal Intrusion
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Police Station (Thana) *
              </label>
              <input
                type="text"
                value={formData.policeStation}
                onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Suspected Tampering Time *
              </label>
              <input
                type="datetime-local"
                value={formData.suspectedDate}
                onChange={(e) => setFormData({ ...formData, suspectedDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reporting Guard / Officer on Duty *
            </label>
            <input
              type="text"
              value={formData.reportedBy}
              onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
            />
            {errors.reportedBy && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.reportedBy}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Description & Damage Observations *
            </label>
            <textarea
              rows={3}
              placeholder="Describe physical damage, displaced bricks/soil, footprints, or perimeter stake tampering..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Evidence Photos Attachment Simulator */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              Attached Photographic Evidence (Included in Police GD Docket)
            </label>
            <div className="flex items-center gap-3">
              {formData.evidencePhotos.map((url, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative group shrink-0"
                >
                  <img src={url} alt="Damage evidence" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded font-mono">
                    Photo #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-darkMuted/60">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-darkMuted text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white text-xs font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>File Report & Generate Police GD Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
