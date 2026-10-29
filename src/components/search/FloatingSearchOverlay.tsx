import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Building2, User, MapPin, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const FloatingSearchOverlay: React.FC = () => {
  const {
    graveyards,
    deceasedHistory,
    slots,
    setSelectedGraveyardId,
    setActiveView,
  } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Search graveyards
  const matchedGraveyards = cleanQuery
    ? graveyards.filter(
        (g) =>
          g.name.toLowerCase().includes(cleanQuery) ||
          g.district.toLowerCase().includes(cleanQuery) ||
          g.division.toLowerCase().includes(cleanQuery) ||
          g.address.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search deceased records
  const matchedDeceased = cleanQuery
    ? deceasedHistory.filter(
        (d) =>
          d.deceasedName.toLowerCase().includes(cleanQuery) ||
          d.tokenReceiptId.toLowerCase().includes(cleanQuery) ||
          d.nidNumber.includes(cleanQuery) ||
          d.deathCertificateNo.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasResults = matchedGraveyards.length > 0 || matchedDeceased.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30">
      {/* Floating Search Bar */}
      <div className="relative flex items-center bg-white/95 dark:bg-darkCard/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-darkMuted/80 shadow-xl transition-all focus-within:ring-2 focus-within:ring-accentEmerald/50 focus-within:border-accentEmerald">
        <div className="pl-4 text-slate-400">
          <Search className="w-5 h-5 text-accentEmerald" />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search Graveyard Name, City/District, or Deceased Relative..."
          className="w-full py-3.5 pl-3 pr-10 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categorized Dropdown Results */}
      {isOpen && cleanQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkMuted shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-darkMuted/60 max-h-[460px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {!hasResults ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching graveyards or deceased records found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Category 1: Graveyards Found */}
              {matchedGraveyards.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-accentEmerald">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Graveyards Found ({matchedGraveyards.length})</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedGraveyards.map((gy) => {
                      const occPercent =
                        gy.totalSlots > 0
                          ? Math.round((gy.occupiedSlots / gy.totalSlots) * 100)
                          : 0;

                      return (
                        <div
                          key={gy.id}
                          onClick={() => {
                            setSelectedGraveyardId(gy.id);
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {gy.name}
                              </h5>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {gy.address}, {gy.district}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="emerald" size="sm">
                              {occPercent}% Occupied
                            </Badge>
                            <ArrowUpRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 2: Deceased Records Found */}
              {matchedDeceased.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-accentGold">
                    <User className="w-3.5 h-3.5" />
                    <span>Deceased Burial Records ({matchedDeceased.length})</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedDeceased.map((dec) => {
                      const slot = slots.find((s) => s.id === dec.slotId);

                      return (
                        <div
                          key={dec.id}
                          onClick={() => {
                            if (slot) {
                              setSelectedGraveyardId(slot.graveyardId);
                              setActiveView('tracker');
                            }
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {dec.deceasedName}
                                </h5>
                                <Badge variant="gold" size="sm">
                                  Layer {dec.burialOrder}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Slot: <span className="font-semibold text-accentEmerald">{slot?.slotNumber}</span> • Buried: {new Date(dec.burialDate).toLocaleDateString()} • Token: {dec.tokenReceiptId}
                              </p>
                            </div>
                          </div>
                          <button className="text-xs font-semibold text-accentEmerald hover:underline flex items-center gap-1">
                            <span>Locate</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
