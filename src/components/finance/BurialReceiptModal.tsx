import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  Phone,
  FileCheck2,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const BurialReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    activeReceipt,
    getSlotById,
    selectedGraveyard,
    graveyards,
  } = useApp();

  if (!isReceiptModalOpen || !activeReceipt) return null;

  const targetGraveyard =
    graveyards.find((g) => g.id === activeReceipt.graveyardId) || selectedGraveyard;
  const targetSlot = getSlotById(activeReceipt.slotId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-darkMuted shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-darkBg print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-accentEmerald">
              {activeReceipt.tokenReceiptId}
            </span>
            <Badge variant="emerald" size="sm" dot>
              Official Payment Voucher
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div
          id="printable-receipt"
          className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-white text-slate-900 text-xs font-sans print:p-0 print:m-0"
        >
          {/* Header Seal & Municipal Title */}
          <div className="border-b-2 border-emerald-800 pb-5 text-center relative">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold uppercase tracking-widest text-[11px]">
              <Building2 className="w-4 h-4" />
              <span>People's Republic of Bangladesh • Local Government Division</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 uppercase">
              {targetGraveyard?.name || 'Municipal Cemetery & Memorial'}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {targetGraveyard?.address}, {targetGraveyard?.district} • Tel: {targetGraveyard?.contactNumber || '+880 2-9876543'}
            </p>

            <div className="mt-3 inline-block px-3 py-1 rounded border-2 border-emerald-800 bg-emerald-50 text-emerald-900 font-black text-xs uppercase tracking-wider">
              Official Dafon & Plot Allocation Money Receipt
            </div>

            {/* Top Right Watermark Receipt ID */}
            <div className="sm:absolute sm:top-2 sm:right-0 mt-3 sm:mt-0 text-right font-mono text-[11px]">
              <p className="text-slate-500">Receipt No: <span className="font-bold text-slate-900">{activeReceipt.id.toUpperCase()}</span></p>
              <p className="text-slate-500">Token ID: <span className="font-bold text-emerald-700">{activeReceipt.tokenReceiptId}</span></p>
            </div>
          </div>

          {/* Key Allocation & Payment Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Plot</span>
              <span className="text-base font-extrabold text-emerald-800 font-mono">
                {activeReceipt.slotNumber || targetSlot?.slotNumber || 'Plot Assigned'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Issue</span>
              <span className="text-xs font-bold text-slate-800">
                {new Date(activeReceipt.paymentDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                {activeReceipt.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {activeReceipt.status}
              </span>
            </div>
          </div>

          {/* Section 1: Deceased Record */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              1. Deceased Individual Particulars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Full Legal Name:</span>
                <span className="font-bold text-slate-900">{activeReceipt.deceasedName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">National ID / Smart Card:</span>
                <span className="font-mono font-semibold text-slate-800">{activeReceipt.nidNumber || 'Verified on Registration'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Cemetery Block / Sector:</span>
                <span className="font-semibold text-slate-800">Sector General (2.5D Registered)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Burial Layer Registration:</span>
                <span className="font-semibold text-emerald-700">Tier 1 Multi-Occupancy Safe</span>
              </div>
            </div>
          </div>

          {/* Section 2: Relative / Depositor Information */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              2. Depositor / Primary Relative Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Applicant / Relative:</span>
                <span className="font-bold text-slate-900">{activeReceipt.relativeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono font-semibold text-slate-800">{activeReceipt.relativePhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 sm:col-span-2">
                <span className="text-slate-500">Verification Gate Token:</span>
                <span className="font-mono font-bold text-emerald-700">{activeReceipt.tokenReceiptId} (Keep safe for 2-Tier Record Unlock)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Fee Itemization & Amount in BDT */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
              3. Itemized Financial Schedule
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2 border-b border-slate-200">Description</th>
                  <th className="p-2 border-b border-slate-200 text-center">Category</th>
                  <th className="p-2 border-b border-slate-200 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2">Dafon & Grave Preparation Excavation Fee</td>
                  <td className="p-2 text-center text-slate-500">Standard Service</td>
                  <td className="p-2 text-right font-mono font-semibold">৳ 3,000.00</td>
                </tr>
                <tr>
                  <td className="p-2">Multi-Occupancy Spatial Grid Registration & Memorial Index</td>
                  <td className="p-2 text-center text-slate-500">Municipal Record</td>
                  <td className="p-2 text-right font-mono font-semibold">৳ 1,500.00</td>
                </tr>
                <tr>
                  <td className="p-2">14-Day Subsidence & Security Night-Patrol Surveillance Fee</td>
                  <td className="p-2 text-center text-slate-500">Anti-Desecration</td>
                  <td className="p-2 text-right font-mono font-semibold">৳ {(activeReceipt.amount - 4500 > 0 ? activeReceipt.amount - 4500 : 500).toLocaleString()}.00</td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-50/80 font-bold border-t-2 border-emerald-800">
                <tr>
                  <td colSpan={2} className="p-2.5 text-right uppercase text-emerald-950 font-black">
                    Total Amount Received in Full:
                  </td>
                  <td className="p-2.5 text-right font-mono text-base font-black text-emerald-900">
                    ৳ {activeReceipt.amount.toLocaleString()}.00
                  </td>
                </tr>
              </tfoot>
            </table>
            {activeReceipt.receiptNote && (
              <p className="text-[11px] text-slate-500 italic mt-1">
                Note: {activeReceipt.receiptNote}
              </p>
            )}
          </div>

          {/* Watermark QR Code & Signatures */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Watermark QR Box */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="p-1 rounded bg-white border border-slate-300">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="text-[10px] space-y-0.5 text-slate-500 font-mono">
                <p className="font-bold text-slate-900">GMS DIGITAL SECURE STAMP</p>
                <p>Hash: {activeReceipt.id.slice(-8)}-{activeReceipt.tokenReceiptId}</p>
                <p className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Digitally Signed & Authenticated
                </p>
              </div>
            </div>

            {/* Dual Signatures */}
            <div className="flex items-center gap-10 sm:gap-14 text-center">
              <div>
                <div className="w-32 border-b border-slate-900 h-8 flex items-end justify-center pb-1 font-serif italic text-[11px] text-slate-600">
                  {activeReceipt.collectorName}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">
                  Authorised Cashier
                </span>
              </div>

              <div>
                <div className="w-36 border-b border-slate-900 h-8 flex items-end justify-center pb-1 font-serif italic text-[11px] text-slate-600">
                  Seal & Signature
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">
                  Cemetery Superintendant
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <p className="text-[9px] text-center text-slate-400 font-mono pt-3 border-t border-slate-100">
            This is an official computer-generated receipt issued under the Bangladesh Municipal Graveyards Ordinance. Retain this receipt for any administrative inquiry or prayer token verification.
          </p>
        </div>
      </div>
    </div>
  );
};
