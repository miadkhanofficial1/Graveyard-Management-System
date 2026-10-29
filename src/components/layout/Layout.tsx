import React from 'react';
import { Navbar } from './Navbar';
import { SearchModal } from '../common/SearchModal';
import { RegisterGraveyardModal } from '../onboarding/RegisterGraveyardModal';
import { BurialBookingModal } from '../booking/BurialBookingModal';
import { ReportIncidentModal } from '../incident/ReportIncidentModal';
import { PoliceDocketModal } from '../incident/PoliceDocketModal';
import { BurialReceiptModal } from '../finance/BurialReceiptModal';
import { ToastContainer } from '../common/Toast';
import { useApp } from '../../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-lightBg dark:bg-darkBg text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Global Search Modal */}
      <SearchModal />

      {/* Committee Onboarding Modal */}
      <RegisterGraveyardModal />

      {/* Burial Slot Booking (Dafon Request) Modal */}
      <BurialBookingModal />

      {/* Report Incident & Tampering Modal */}
      <ReportIncidentModal />

      {/* Official Police General Diary (GD) Docket Modal */}
      <PoliceDocketModal />

      {/* Official Dafon & Burial Money Receipt Modal */}
      <BurialReceiptModal />

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-darkMuted/60 py-6 bg-white/50 dark:bg-darkBg/50 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              GraveyardTrack™ System
            </span>
            <span>•</span>
            <span>Spatial Multi-Occupancy Tracker & Registry</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-accentEmerald">
              <ShieldCheck className="w-3.5 h-3.5" />
              Local Storage Encrypted Persistence Active
            </span>
            <span>•</span>
            <span>Dual Theme (Deep Slate #0F172A / Neutral Clean #F8FAFC)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
