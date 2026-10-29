import React, { useEffect, useRef, useState } from 'react';
import { Search, X, User, MapPin, Calendar, FileText, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    deceasedHistory,
    slots,
    blocks,
    selectedGraveyardId,
    setSelectedGraveyardId,
  } = useApp();

  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedResultIndex(0);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const queryClean = searchQuery.trim().toLowerCase();

  // Search through all deceased records
  const results = deceasedHistory.filter((item) => {
    if (!queryClean) return true;
    const slot = slots.find((s) => s.id === item.slotId);
    return (
      item.deceasedName.toLowerCase().includes(queryClean) ||
      item.tokenReceiptId.toLowerCase().includes(queryClean) ||
      item.nidNumber.includes(queryClean) ||
      item.deathCertificateNo.toLowerCase().includes(queryClean) ||
      item.relativeName.toLowerCase().includes(queryClean) ||
      (slot && slot.slotNumber.toLowerCase().includes(queryClean))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-2xl liquid-glass-island rounded-[32px] border border-white/40 dark:border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Input */}
        <div className="flex items-center px-5 py-4 border-b border-black/5 dark:border-white/10 gap-3 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by Deceased Name, Token ID (e.g. TKN-...), NID, Certificate, or Slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-300 font-mono font-bold"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-darkMuted/40">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No matching records found
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Try searching with partial name, Token ID (e.g. TKN-2026), or Slot number (e.g. A-101)
              </p>
            </div>
          ) : (
            results.map((record, idx) => {
              const slot = slots.find((s) => s.id === record.slotId);
              const block = slot ? blocks.find((b) => b.id === slot.blockId) : undefined;
              const isCurrentGraveyard = slot?.graveyardId === selectedGraveyardId;

              return (
                <div
                  key={record.id}
                  className={`pt-2 first:pt-0 p-3 rounded-xl transition-all cursor-pointer ${
                    idx === selectedResultIndex
                      ? 'bg-slate-50 dark:bg-slate-800/60 ring-1 ring-accentEmerald/40'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                  }`}
                  onClick={() => {
                    if (slot && !isCurrentGraveyard) {
                      setSelectedGraveyardId(slot.graveyardId);
                    }
                    setIsSearchOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {record.deceasedName}
                          </h4>
                          <Badge variant="gold" size="sm">
                            Layer: {record.burialOrder}
                          </Badge>
                          {slot?.highRiskAlert && (
                            <Badge variant="rose" size="sm" dot>
                              14-Day Fresh Mound
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-accentEmerald">
                            <MapPin className="w-3.5 h-3.5" />
                            Slot: {slot?.slotNumber || 'N/A'} ({block?.name || 'Sector'})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Buried: {new Date(record.burialDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {record.tokenReceiptId}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-3">
                          <span>NID: {record.nidNumber}</span>
                          <span>•</span>
                          <span>Relative: {record.relativeName} (***{record.relativePhoneLast4})</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-accentEmerald hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                      title="View Slot in Tracker"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-darkMuted/60 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{results.length} records indexed</span>
          <span className="font-mono text-[11px]">Tip: Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
