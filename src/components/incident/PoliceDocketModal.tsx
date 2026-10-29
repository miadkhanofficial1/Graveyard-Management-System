import React from 'react';
import {
  X,
  Printer,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const PoliceDocketModal: React.FC = () => {
  const {
    isDocketModalOpen,
    setIsDocketModalOpen,
    activeDocketIncident,
    selectedGraveyard,
    getSlotById,
    getSlotDeceasedHistory,
    getSlotPatrolLogs,
    showToast,
  } = useApp();

  if (!isDocketModalOpen || !activeDocketIncident) return null;

  const targetSlot = getSlotById(activeDocketIncident.slotId);
  const deceasedList = activeDocketIncident.slotId
    ? getSlotDeceasedHistory(activeDocketIncident.slotId)
    : [];
  const latestDeceased = deceasedList[deceasedList.length - 1];
  const priorLogs = activeDocketIncident.slotId
    ? getSlotPatrolLogs(activeDocketIncident.slotId).slice(0, 3)
    : [];

  const handlePrint = () => {
    window.print();
  };

  const handleDispatch = () => {
    showToast({
      title: 'Dispatched to Police Thana',
      message: `GD Docket ${activeDocketIncident.gdRefNumber} dispatched via encrypted dispatch to OC, ${activeDocketIncident.policeStation}.`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 print:p-0 print:m-0 print:bg-white print:fixed print:inset-0">
      <div
        id="printable-docket-container"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-darkMuted shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-[275mm] print:h-auto print:border-none print:shadow-none print:rounded-none print:overflow-hidden print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-darkMuted bg-slate-100 dark:bg-darkBg print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-accentEmerald">
              {activeDocketIncident.gdRefNumber || 'GD-REF-2026/DMP/0912'}
            </span>
            <Badge variant="rose" size="sm" dot>
              Official Legal Document
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-darkCard text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={handleDispatch}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch to OC</span>
            </button>

            <button
              onClick={() => setIsDocketModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div
          id="printable-docket"
          className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 font-serif leading-snug text-xs sm:text-xs space-y-3 sm:space-y-4 print:p-0 print:m-0 print:space-y-2 print:overflow-visible"
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-2 text-center space-y-0.5 print:pb-1">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600">
              Government of the People&apos;s Republic of Bangladesh
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900 print:text-sm">
              {selectedGraveyard?.name}
            </h1>
            <p className="text-[11px] text-slate-600 font-sans">
              Municipal Waqf Estate & Public Cemetery Management Board • {selectedGraveyard?.address}
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-0.5 flex items-center justify-center gap-3">
              <span>Gov Reg: GMS/WQF/DH-7719</span>
              <span>•</span>
              <span>Ref: {activeDocketIncident.gdRefNumber}</span>
              <span>•</span>
              <span>Date: {new Date(activeDocketIncident.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Recipient Notice */}
          <div className="space-y-0.5 font-sans text-[11px] leading-tight">
            <p><strong>To:</strong> The Officer-in-Charge (OC) | <strong>Police Station:</strong> {activeDocketIncident.policeStation}</p>
            <p><strong>Subject:</strong> <u>First Information & General Diary (GD) Concerning Alleged Grave Tampering / Ground Subsidence / Desecration Incident at Cemetery Plot {targetSlot?.slotNumber}</u></p>
          </div>

          <div className="text-[11px] font-serif leading-snug">
            <p>
              Sir/Madam, with due respect, this formal notice is lodged by the authorized Security & Patrol Division of {selectedGraveyard?.name}. On or about {new Date(activeDocketIncident.suspectedDate || activeDocketIncident.timestamp).toLocaleString()}, physical anomalies and unauthorized disturbances were detected at the designated burial plot specified hereunder.
            </p>
          </div>

          {/* Section 1 & Section 2 Compact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
            {/* Section 1: Deceased Particulars */}
            <div className="border border-slate-300 rounded-lg py-1.5 px-2.5 font-sans text-[11px] bg-slate-50 print:bg-white print:py-1.5 print:px-2 space-y-1">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-0.5">
                Section 1: Particulars of the Interred Deceased
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                <div>
                  <span className="text-slate-500 block text-[9px]">Deceased Name:</span>
                  <span className="font-bold text-slate-900 truncate block">{latestDeceased?.deceasedName || 'Record on File'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">NID / Reg No:</span>
                  <span className="font-mono font-semibold">{latestDeceased?.nidNumber || 'Verified Digital NID'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Interment Date & Layer:</span>
                  <span>{latestDeceased?.burialDate ? new Date(latestDeceased.burialDate).toLocaleDateString() : 'N/A'} (L{latestDeceased?.burialOrder || 1})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Spatial Slot:</span>
                  <span className="font-mono font-bold text-emerald-700">Slot {targetSlot?.slotNumber} (R{targetSlot?.row}, C{targetSlot?.col})</span>
                </div>
              </div>
            </div>

            {/* Section 2: Relative Particulars */}
            <div className="border border-slate-300 rounded-lg py-1.5 px-2.5 font-sans text-[11px] bg-slate-50 print:bg-white print:py-1.5 print:px-2 space-y-1">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-0.5">
                Section 2: Primary Nominee Information
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                <div>
                  <span className="text-slate-500 block text-[9px]">Nominee Name:</span>
                  <span className="font-bold truncate block">{latestDeceased?.relativeName || 'Primary Applicant on Record'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Contact Phone:</span>
                  <span className="font-mono font-semibold">+880 1711-••{latestDeceased?.relativePhoneLast4 || '4482'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Token Receipt ID:</span>
                  <span className="font-mono text-emerald-800 font-bold">{latestDeceased?.tokenReceiptId || 'TKN-2026-REG'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Status:</span>
                  <span className="font-semibold text-emerald-700">Notified via SMS Alert</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Incident Details & Chain of Custody */}
          <div className="border border-slate-300 rounded-lg py-1.5 px-2.5 font-sans text-[11px] bg-slate-50 print:bg-white print:py-1.5 print:px-2 space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-0.5">
              Section 3: Incident Narrative & Chain of Custody Log
            </h4>
            <div className="space-y-1.5">
              <p className="text-slate-800 leading-snug text-[10.5px]">
                <strong>Incident Description:</strong> {activeDocketIncident.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 text-[9px]">Guard on Shift: </span>
                  <span className="font-semibold">{activeDocketIncident.reportedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px]">Tampering Timestamp: </span>
                  <span className="font-mono">{new Date(activeDocketIncident.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Chain of Custody Prior Sweeps (Compact inline badges) */}
              <div className="pt-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                  Prior Security Checkpoints on this Slot:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {priorLogs.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">No previous anomalies logged during earlier rounds.</span>
                  ) : (
                    priorLogs.map((p) => (
                      <div key={p.id} className="text-[10px] flex items-center gap-1.5 text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                        <span>{new Date(p.timestamp).toLocaleTimeString()} ({p.staffName}):</span>
                        <span className="font-bold text-emerald-700">{p.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Photos Attached preview (Compact Thumbnails) */}
              {activeDocketIncident.evidencePhotos.length > 0 && (
                <div className="pt-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                    Attached Photographic Damage Exhibits:
                  </span>
                  <div className="flex items-center gap-2">
                    {activeDocketIncident.evidencePhotos.map((url, i) => (
                      <div key={i} className="h-14 w-20 rounded border border-slate-400 overflow-hidden relative shrink-0">
                        <img src={url} alt="Evidence" className="h-14 w-20 object-cover rounded" />
                        <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[8px] px-1 font-mono">#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Signature Sign-off (Locked to Page 1) */}
          <div className="pt-3 grid grid-cols-2 gap-8 text-center font-sans text-xs print-page-locked">
            <div className="space-y-0.5 border-t border-slate-400 pt-1.5">
              <div className="font-bold text-slate-800 text-[11px]">Md. Abdur Rahim</div>
              <div className="text-[9.5px] text-slate-500">Chief Field Security Inspector</div>
              <div className="text-[8.5px] font-mono text-slate-400">Biometric Verification: MATCHED</div>
            </div>

            <div className="space-y-0.5 border-t border-slate-400 pt-1.5">
              <div className="font-bold text-slate-800 text-[11px]">Alhaj Mawlana M. A. Karim</div>
              <div className="text-[9.5px] text-slate-500">General Secretary, Cemetery Waqf Trust</div>
              <div className="text-[8.5px] font-mono text-slate-400">Official Seal & Signature</div>
            </div>
          </div>

          <div className="text-[9px] text-center font-mono text-slate-400 pt-2 border-t border-slate-200 print-page-locked">
            *** Generated via GraveyardTrack™ Cryptographic Audit Subsystem • Valid for Official Police General Diary (GD) Filing ***
          </div>
        </div>
      </div>
    </div>
  );
};
