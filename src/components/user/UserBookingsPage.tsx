import React from 'react';
import {
  Clock,
  ArrowRight,
  Plus,
  Compass,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const UserBookingsPage: React.FC = () => {
  const {
    currentUser,
    bookingRequests,
    deceasedHistory,
    slots,
    graveyards,
    setIsBookingModalOpen,
    setSelectedGraveyardId,
    setSelectedSlotId,
    setActiveView,
  } = useApp();

  // Find user's booking requests (or show all recent for demo user)
  const myRequests = bookingRequests.filter((r) => {
    if (!currentUser) return true;
    const userPhoneLast4 = currentUser.phone ? currentUser.phone.slice(-4) : '';
    return (
      r.relativePhone.includes(userPhoneLast4) ||
      r.relativeName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
      currentUser.role === 'Public Relative'
    );
  });

  // Find linked ancestral graves in the database matching relative
  const myLinkedAncestors = deceasedHistory.filter((d) => {
    if (!currentUser) return true;
    const userPhoneLast4 = currentUser.phone ? currentUser.phone.slice(-4) : '';
    return (
      d.relativePhoneLast4 === userPhoneLast4 ||
      d.relativeName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
      currentUser.role === 'Public Relative'
    );
  });

  const handleLocatePlot = (slotId: string, graveyardId?: string) => {
    if (graveyardId) {
      setSelectedGraveyardId(graveyardId);
    }
    setSelectedSlotId(slotId);
    setActiveView('tracker');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xl shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentUser?.name || 'Public Relative Portal'}
                </h1>
                <Badge variant="blue" size="sm" dot>
                  Verified Family Relative
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentUser?.email || 'relative.rahim@gmail.com'} • Tel: {currentUser?.phone || '+880 1712-334482'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Book Burial Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Active Burial Booking Requests */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-darkMuted/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Burial Booking Requests (Dafon Applications)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live status tracking for online plot reservations and physical committee verifications
            </p>
          </div>
          <Badge variant="emerald" size="sm">
            {myRequests.length} Applications
          </Badge>
        </div>

        {myRequests.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No active booking requests
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              When you submit a burial booking, your token voucher and status will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {req.tokenReceiptId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {req.deceasedName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Target Plot ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{req.slotId || 'Slot Assignment by Admin'}</span> • Cause: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.causeOfDeath}</span>
                    </p>
                  </div>

                  <Badge
                    variant={req.status === 'Approved' ? 'emerald' : 'gold'}
                    size="sm"
                    dot
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400 font-mono">
                  <span>
                    Submitted: {new Date(req.submittedAt).toLocaleDateString()} at {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <span className="text-slate-600 dark:text-slate-300 font-sans">
                    Applicant: <strong>{req.relativeName}</strong> ({req.relationship})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Linked Ancestral Graves & Memorials */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-darkMuted/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Linked Ancestral Graves & Memorial Plots
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Family members interred across municipal graveyards with instant 2.5D grid location
            </p>
          </div>
          <Badge variant="purple" size="sm">
            {myLinkedAncestors.length} Ancestral Records
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myLinkedAncestors.map((dec) => {
            const plot = slots.find((s) => s.id === dec.slotId);
            const gy = graveyards.find((g) => g.id === plot?.graveyardId);

            return (
              <div
                key={dec.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4 hover:border-indigo-400 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {dec.deceasedName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {dec.dateOfBirth.slice(0, 4)} – {dec.dateOfDeath.slice(0, 4)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Plot {plot?.slotNumber || dec.slotId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {gy?.name || 'Rayerbazar Central Graveyard'}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 font-mono pt-1">
                    <p>Burial Layer: <strong className="text-slate-700 dark:text-slate-300">{dec.burialOrder} Depth Layer</strong></p>
                    <p>Token ID: {dec.tokenReceiptId}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleLocatePlot(dec.slotId, plot?.graveyardId)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5 text-accentGold" />
                  <span>Locate on 2.5D Isometric Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
