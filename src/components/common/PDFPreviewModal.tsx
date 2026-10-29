import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Download,
  FileCheck2,
  Building2,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import type { DeceasedHistory, Slot } from '../../types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  deceased?: DeceasedHistory;
  slot?: Slot;
  graveyardName?: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  documentName,
  deceased,
  slot,
  graveyardName = 'Rayerbazar Central Graveyard & Memorial',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate simple text download blob without page reload
    const content = `MUNICIPAL BURIAL & LEGAL CLEARANCE CERTIFICATE
Document: ${documentName}
Graveyard: ${graveyardName}
Slot Number: ${slot?.slotNumber || 'B-202'}
Deceased: ${deceased?.deceasedName || 'N/A'}
NID: ${deceased?.nidNumber || 'Verified Digital NID'}
Date of Death: ${deceased?.dateOfDeath || 'N/A'}
Interment Layer: Layer ${deceased?.burialOrder || 1}
Token ID: ${deceased?.tokenReceiptId || 'TKN-2026-REG'}
Status: Verified Legal Archive Extract
Generated: ${new Date().toISOString()}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = documentName.endsWith('.pdf') ? documentName.replace('.pdf', '.txt') : `${documentName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-accentEmerald border border-emerald-500/20 shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {documentName}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Verified Legal Document Record
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Document</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
            {/* Paper Sheet Preview */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-900 dark:text-slate-100 space-y-5 font-serif text-xs">
              {/* Official Seal & Letterhead */}
              <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Government of the People&apos;s Republic of Bangladesh</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-sans tracking-tight text-slate-900 dark:text-white uppercase">
                  {graveyardName}
                </h2>
                <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                  Official Municipal Cemetery Authority & Burial Clearance Certificate
                </p>
                <div className="flex items-center justify-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
                  <span>Reg: GMS/CERT/2026</span>
                  <span>•</span>
                  <span>Ref: {deceased?.tokenReceiptId || 'TK-99201'}</span>
                  <span>•</span>
                  <span>Issued: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Document Type Badge */}
              <div className="flex items-center justify-between font-sans">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {documentName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Authentication: Cryptographically Verified
                </span>
              </div>

              {/* Particulars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-500" /> Interred Deceased
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {deceased?.deceasedName || 'Record on File'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NID: {deceased?.nidNumber || 'Verified Digital NID'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-emerald-500" /> Spatial Plot Assignment
                  </span>
                  <p className="font-bold text-sm text-emerald-600 dark:text-accentEmerald font-mono">
                    Slot {slot?.slotNumber || 'B-202'} (Layer {deceased?.burialOrder || 1})
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Row {slot?.row || 2}, Column {slot?.col || 3} • {slot?.soilCategory || 'Clay-Loam'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-500" /> Interment Record
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Burial Date: <span className="font-semibold">{deceased?.burialDate ? new Date(deceased.burialDate).toLocaleDateString() : 'Recorded'}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Cause: {deceased?.causeOfDeath || 'Natural Maturation'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-500" /> Primary Nominee
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {deceased?.relativeName || 'Authorized Relative'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Contact: +880 1711-••{deceased?.relativePhoneLast4 || '4482'}
                  </p>
                </div>
              </div>

              {/* Legal Text Certification */}
              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p>
                  This document serves as permanent proof of lawful interment in according with the Dhaka City Corporation (Burial & Cemetery Regulatory Act) and Islamic Waqf Cemetery rules. The physical grave is tracked in the 2.5D spatial register under layer {deceased?.burialOrder || 1}.
                </p>
              </div>

              {/* Watermark Verification & QR Code */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 font-sans">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Verification Hash
                    </span>
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                      SHA256: 8f92a10b...3d7e8201
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tamper-Proof Ledger Signed</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Cemetery Registrar
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Municipal Memorial Records
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
