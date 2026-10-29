import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  Printer,
  X,
  Compass,
  Check,
  Settings,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import type { PaymentMethod, SoilCategory } from '../../types';
import { computeHighRiskStatus } from '../../utils/security';

export const GraveyardAdminPortal: React.FC = () => {
  const {
    selectedGraveyard,
    currentSlots,
    currentBlocks,
    currentBookingRequests,
    currentReceipts,
    currentPatrolLogs,
    approveBookingRequest,
    rejectBookingRequest,
    updateBlockSoilSettings,
    setActiveReceipt,
    setIsReceiptModalOpen,
    setActiveView,
    resetToMockData,
    clearAllDemoBurialsAndReset,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'analytics' | 'soil' | 'finance' | 'settings'>('requests');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Approval Form State per request (keyed by request.id)
  const [selectedSlotForReq, setSelectedSlotForReq] = useState<Record<string, string>>({});
  const [feeAmountForReq, setFeeAmountForReq] = useState<Record<string, number>>({});
  const [paymentMethodForReq, setPaymentMethodForReq] = useState<Record<string, PaymentMethod>>({});
  const [feeNotesForReq, setFeeNotesForReq] = useState<Record<string, string>>({});

  // Soil settings edit states per block (keyed by block.id)
  const [soilCategoryMap, setSoilCategoryMap] = useState<Record<string, SoilCategory>>({});
  const [cooldownMonthsMap, setCooldownMonthsMap] = useState<Record<string, number>>({});

  const pendingRequests = currentBookingRequests.filter(
    (r) => r.status === 'Awaiting Admin Physical Approval'
  );

  // Available slots for assignment
  const availableSlots = currentSlots.filter((s) => s.currentStatus === 'Available');

  // High Risk Slots in this graveyard
  const highRiskSlots = currentSlots.filter((s) => {
    const risk = computeHighRiskStatus(s.lastBurialDate);
    return s.highRiskAlert || risk.isHighRisk;
  });

  // Calculate 24h Patrol Compliance Meter
  const now = new Date('2026-10-30T02:30:00Z').getTime(); // System reference time
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const inspectedInLast24h = highRiskSlots.filter((s) => {
    return currentPatrolLogs.some(
      (log) => log.slotId === s.id && new Date(log.timestamp).getTime() >= oneDayAgo
    );
  }).length;

  const patrolCompliancePercent =
    highRiskSlots.length === 0
      ? 100
      : Math.round((inspectedInLast24h / highRiskSlots.length) * 100);

  // Slot turnover breakdown
  const availableCount = currentSlots.filter((s) => s.currentStatus === 'Available').length;
  const occupiedCount = currentSlots.filter((s) => s.currentStatus === 'Occupied').length;
  const cooldownCount = currentSlots.filter((s) => s.currentStatus === 'Maturing_Cooldown').length;
  const highRiskCount = highRiskSlots.length;
  const totalSlots = currentSlots.length || 1;

  // Monthly trends mock data
  const monthlyTrends = [
    { month: 'Jan', burials: 8, height: 28 },
    { month: 'Feb', burials: 12, height: 42 },
    { month: 'Mar', burials: 15, height: 52 },
    { month: 'Apr', burials: 11, height: 38 },
    { month: 'May', burials: 19, height: 65 },
    { month: 'Jun', burials: 14, height: 48 },
    { month: 'Jul', burials: 22, height: 76 },
    { month: 'Aug', burials: 28, height: 96 },
    { month: 'Sep', burials: 24, height: 82 },
    { month: 'Oct', burials: 29, height: 100 },
  ];

  // Financial statistics
  const totalRevenue = currentReceipts.reduce((acc, r) => acc + (r.amount || 0), 0);
  const avgFee = currentReceipts.length ? Math.round(totalRevenue / currentReceipts.length) : 0;

  const handleApprove = (reqId: string) => {
    const defaultSlot =
      selectedSlotForReq[reqId] ||
      currentBookingRequests.find((r) => r.id === reqId)?.slotId ||
      availableSlots[0]?.id;

    if (!defaultSlot) {
      alert('Please assign an available slot for this burial.');
      return;
    }

    const fee = feeAmountForReq[reqId] ?? 5000;
    const method = paymentMethodForReq[reqId] ?? 'Cash';
    const notes = feeNotesForReq[reqId] ?? 'Standard dafon & 2.5D layer burial registration';

    approveBookingRequest(reqId, defaultSlot, {
      amount: fee,
      paymentMethod: method,
      notes,
    });
  };

  const handleSaveSoil = (blockId: string) => {
    const currentBlock = currentBlocks.find((b) => b.id === blockId);
    const soil = soilCategoryMap[blockId] || currentBlock?.soilCategory || 'Moist';
    const cooldown = cooldownMonthsMap[blockId] || currentBlock?.defaultCooldownMonths || 24;

    updateBlockSoilSettings(blockId, soil, cooldown);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-accentEmerald" />
              <span>Cemetery Operations Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {selectedGraveyard?.name} <span className="text-accentEmerald">Admin Console</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Manage incoming dafon reservations, capacity turnover, soil cooldown telemetry, and municipal receipt disbursement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('tracker')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>2.5D Visual Grid</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Burial Approvals ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Capacity & Trends Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('soil')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'soil'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Soil & Cooldown Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'finance'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Financial Receipts ({currentReceipts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Database</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INCOMING BURIAL REQUESTS (DAFON APPROVALS) */}
      {activeTab === 'requests' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-darkMuted/60">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Incoming Dafon Slot Booking Requests
                </h2>
                <Badge variant={pendingRequests.length > 0 ? 'rose' : 'emerald'} size="sm">
                  {pendingRequests.length} Pending
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Verify National ID, collect dafon fees, allocate burial plot, and generate official stamped receipt.
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                All Dafon Requests Cleared
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                There are no pending burial booking requests awaiting physical approval for this cemetery.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => {
                const assignedSlotId = selectedSlotForReq[req.id] || req.slotId || availableSlots[0]?.id;
                const assignedSlot = currentSlots.find((s) => s.id === assignedSlotId);
                const currentFee = feeAmountForReq[req.id] ?? 5000;
                const currentMethod = paymentMethodForReq[req.id] ?? 'Cash';

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {req.tokenReceiptId}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {req.deceasedName}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Cause of Demise: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.causeOfDeath}</span> • Demise Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.dateOfDeath}</span>
                        </p>
                      </div>

                      <Badge variant="gold" size="sm" dot>
                        Awaiting Physical Verification
                      </Badge>
                    </div>

                    {/* Applicant & Deceased details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Deceased NID</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {req.nidNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant / Relative</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {req.relativeName} ({req.relationship})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {req.relativePhone}
                        </span>
                      </div>
                    </div>

                    {/* Fee & Slot Assignment Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Assign Burial Slot:
                        </label>
                        <select
                          value={assignedSlotId}
                          onChange={(e) =>
                            setSelectedSlotForReq((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          {availableSlots.map((s) => (
                            <option key={s.id} value={s.id}>
                              Plot {s.slotNumber} (Row {s.row}, Col {s.col})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Dafon & Registration Fee (BDT):
                        </label>
                        <input
                          type="number"
                          value={currentFee}
                          onChange={(e) =>
                            setFeeAmountForReq((prev) => ({ ...prev, [req.id]: Number(e.target.value) }))
                          }
                          className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Payment Mode:
                        </label>
                        <select
                          value={currentMethod}
                          onChange={(e) =>
                            setPaymentMethodForReq((prev) => ({
                              ...prev,
                              [req.id]: e.target.value as PaymentMethod,
                            }))
                          }
                          className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="Cash">Cash at Admin Desk</option>
                          <option value="bKash">bKash Merchant Pay</option>
                          <option value="Nagad">Nagad Online</option>
                          <option value="Bank Transfer">Bank Transfer Challan</option>
                          <option value="Online Card">Debit/Credit Card</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Voucher Remarks / Receipt Note:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Standard dafon fee & 2.5D layer burial registration"
                          value={feeNotesForReq[req.id] || ''}
                          onChange={(e) =>
                            setFeeNotesForReq((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target Plot: <strong className="text-slate-700 dark:text-slate-300">{assignedSlot?.slotNumber || 'Plot Assigned'}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => rejectBookingRequest(req.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-darkCard hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-all active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline Request</span>
                        </button>

                        <button
                          onClick={() => handleApprove(req.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Generate Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAPACITY & TRENDS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                24h Patrol Compliance
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {patrolCompliancePercent}%
                </span>
                <Badge
                  variant={patrolCompliancePercent >= 80 ? 'emerald' : 'gold'}
                  size="sm"
                  dot
                >
                  {patrolCompliancePercent >= 80 ? 'Compliant' : 'Audit Required'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {inspectedInLast24h} of {highRiskSlots.length} high-risk fresh graves checked in last 24h
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-accentEmerald h-full rounded-full transition-all"
                  style={{ width: `${patrolCompliancePercent}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Critical Watch
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {highRiskSlots.length}
                </span>
                <Badge variant="rose" size="sm" dot>
                  14-Day Alert
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fresh mounds undergoing soil compaction & nocturnal subsidence surveillance
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Sector Capacity
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {occupiedCount} / {currentSlots.length}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {Math.round((occupiedCount / totalSlots) * 100)}% Filled
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {availableCount} available plots remaining across {currentBlocks.length} operational blocks
              </p>
            </div>
          </div>

          {/* Monthly Trends Chart */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-darkMuted/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Burial Influx Trends (2026)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Statistical volume of registered interments and seasonal peak variations
                </p>
              </div>
              <Badge variant="emerald" size="sm">
                Peak: Oct 2026 (34 Burials)
              </Badge>
            </div>

            {/* SVG Visual Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-48 flex items-end gap-2 sm:gap-4 px-2">
                {monthlyTrends.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 -mb-1">
                      {item.burials}
                    </div>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 hover:from-emerald-500 hover:to-teal-300 transition-all cursor-pointer relative"
                      style={{ height: `${item.height}%` }}
                    >
                      <span className="sr-only">{item.burials} burials</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slot Turnover & Cooldown Distribution */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-darkMuted/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Slot Turnover & Cooldown Segment Distribution
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total Plots: {currentSlots.length}
              </span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(availableCount / totalSlots) * 100}%` }}
                title={`Available: ${availableCount}`}
              />
              <div
                className="bg-slate-600 transition-all"
                style={{ width: `${(occupiedCount / totalSlots) * 100}%` }}
                title={`Occupied: ${occupiedCount}`}
              />
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${(cooldownCount / totalSlots) * 100}%` }}
                title={`Cooldown: ${cooldownCount}`}
              />
              <div
                className="bg-rose-500 transition-all animate-pulse"
                style={{ width: `${(highRiskCount / totalSlots) * 100}%` }}
                title={`High-Risk: ${highRiskCount}`}
              />
            </div>

            {/* Legend pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Available: {availableCount}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Ready for allocation</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  Occupied: {occupiedCount}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Interment active</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Maturing: {cooldownCount}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Decomposition cycle</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  High Risk: {highRiskCount}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">14-day watch</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOIL & COOLDOWN SETTINGS */}
      {activeTab === 'soil' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-darkMuted/60">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Sector Soil Composition & Biodegradation Cooldown Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calibrate multi-occupancy maturation schedules based on ground moisture retention, earth aeration, and water tables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentBlocks.map((block) => {
              const currentSoil = soilCategoryMap[block.id] || block.soilCategory || 'Moist';
              const currentCooldown = cooldownMonthsMap[block.id] || block.defaultCooldownMonths || 24;

              return (
                <div
                  key={block.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {block.name}
                      </h3>
                      <Badge variant="emerald" size="sm">
                        {block.rowCount * block.colCount} Plots
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {block.description || 'Standard cemetery block allocation'}
                    </p>

                    {/* Soil Category Selector */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Soil Composition Type:
                      </label>
                      <select
                        value={currentSoil}
                        onChange={(e) =>
                          setSoilCategoryMap((prev) => ({
                            ...prev,
                            [block.id]: e.target.value as SoilCategory,
                          }))
                        }
                        className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Standard">Standard Loam (Balanced aeration)</option>
                        <option value="Moist">Clay-Loam / Moist (High water retention)</option>
                        <option value="Sandy">Sandy Soil (Rapid drainage & aeration)</option>
                      </select>
                    </div>

                    {/* Cooldown Months Slider/Select */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Cooldown Period:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                          {currentCooldown} Months
                        </span>
                      </div>
                      <select
                        value={currentCooldown}
                        onChange={(e) =>
                          setCooldownMonthsMap((prev) => ({
                            ...prev,
                            [block.id]: Number(e.target.value),
                          }))
                        }
                        className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value={18}>18 Months (Rapid turnover / Sandy)</option>
                        <option value={24}>24 Months (Standard municipal default)</option>
                        <option value={36}>36 Months (Recommended for Clay / Flood-prone)</option>
                        <option value={48}>48 Months (Extended ecological preservation)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveSoil(block.id)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    Save Sector Parameters
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL LEDGER & RECEIPTS */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* Revenue Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Dafon Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-400 font-mono">
                ৳ {totalRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Collected across all registered vouchers</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Receipts Issued
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currentReceipts.length}
              </div>
              <p className="text-[11px] text-slate-500">Official digitally stamped vouchers</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Registration Fee
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                ৳ {avgFee.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Per interred plot allocation</p>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-darkMuted/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Financial Disbursement & Official Receipt Records
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit ledger of all dafon payments with reprint and verification capability
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-darkMuted">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-darkMuted">
                  <tr>
                    <th className="p-3">Receipt / Token</th>
                    <th className="p-3">Deceased & Relative</th>
                    <th className="p-3">Plot Assigned</th>
                    <th className="p-3">Amount (BDT)</th>
                    <th className="p-3">Payment Mode</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentReceipts.map((rcpt) => (
                    <tr
                      key={rcpt.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-mono">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                          {rcpt.tokenReceiptId}
                        </span>
                        <span className="text-[10px] text-slate-400">{rcpt.id}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {rcpt.deceasedName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Depositor: {rcpt.relativeName}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {rcpt.slotNumber}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        ৳ {rcpt.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge variant="emerald" size="sm">
                          {rcpt.paymentMethod}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {new Date(rcpt.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setActiveReceipt(rcpt);
                            setIsReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Reprint</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS & DATABASE RESET CONTROLLER */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[28px] liquid-glass-card shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/20 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Database Administration & Reset Controller
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage local storage state, clear test burials for production readiness, or restore initial demo seed data.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Option A: Production Clean Slate */}
              <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Demo Burials & Reset Database</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Wipes all mock burials, deceased history, patrol check-ins, police GD dockets, and money receipts. Keeps cemetery facility structures and grid blocks intact with all slots set to <strong>Available</strong> (0% occupied) ready for live production entry.
                  </p>
                </div>

                {showConfirmReset ? (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Are you sure? This will wipe all test records.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          clearAllDemoBurialsAndReset();
                          setShowConfirmReset(false);
                        }}
                        className="flex-1 py-2 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Yes, Clear Database
                      </button>
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="py-2 px-3 rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold text-xs border border-white/20 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-[0_4px_16px_rgba(244,63,94,0.3)] transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Demo Burials & Reset Database</span>
                  </button>
                )}
              </div>

              {/* Option B: Restore Mock Demo Dataset */}
              <div className="p-5 rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore Full Demo Dataset</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Restores initial multi-tier sample burials, high-risk 14-day subsidence plots, mock nighttime patrol logs, and sample receipts for comprehensive system testing and live presentations.
                  </p>
                </div>

                <button
                  onClick={resetToMockData}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/40 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Restore Demo Seed Configuration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
