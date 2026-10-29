import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import type { Slot } from '../../types';

interface IsometricGridProps {
  isIsometric: boolean;
  zoom: number;
}

export const IsometricGrid: React.FC<IsometricGridProps> = ({ isIsometric, zoom }) => {
  const {
    currentSlots,
    selectedBlockId,
    getBlockById,
    selectedSlotId,
    setSelectedSlotId,
    getSlotDeceasedHistory,
  } = useApp();

  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  const block = getBlockById(selectedBlockId);
  const blockSlots = currentSlots.filter((s) => s.blockId === selectedBlockId);

  // Group slots by row
  const rows = block ? block.rowCount : 4;
  const cols = block ? block.colCount : 5;

  // Create grid matrix
  const matrix: (Slot | undefined)[][] = [];
  for (let r = 1; r <= rows; r++) {
    const rowSlots: (Slot | undefined)[] = [];
    for (let c = 1; c <= cols; c++) {
      const slot = blockSlots.find((s) => s.row === r && s.col === c);
      rowSlots.push(slot);
    }
    matrix.push(rowSlots);
  }

  return (
    <div className="relative w-full min-h-[540px] flex items-center justify-center p-6 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-100/90 via-slate-50/70 to-slate-200/90 dark:from-darkBg dark:via-darkCard/50 dark:to-darkBg border border-slate-200 dark:border-darkMuted/80 shadow-inner select-none">
      {/* Background Decorative Ground Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#10B981 1px, transparent 1px), radial-gradient(#10B981 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Grid Container with Isometric 3D Transform */}
      <div
        className="transition-all duration-700 ease-out flex items-center justify-center"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          className="transition-transform duration-700 ease-out"
          style={{
            transform: isIsometric
              ? `scale(${zoom}) rotateX(55deg) rotateZ(-45deg)`
              : `scale(${zoom}) rotateX(0deg) rotateZ(0deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="grid gap-3.5 sm:gap-4 p-8 rounded-3xl bg-slate-200/50 dark:bg-slate-900/40 border border-slate-300/40 dark:border-slate-800/80 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {matrix.map((rowSlots, rIdx) =>
              rowSlots.map((slot, cIdx) => {
                if (!slot) {
                  // Empty space placeholder
                  return (
                    <div
                      key={`empty-${rIdx}-${cIdx}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 opacity-20"
                    />
                  );
                }

                const isSelected = slot.id === selectedSlotId;
                const isHovered = slot.id === hoveredSlotId;
                const deceasedList = getSlotDeceasedHistory(slot.id);
                const latestDeceased = deceasedList[deceasedList.length - 1];
                const hasMultiLayer = slot.totalBurialsCount > 1;

                // Color Themes based on Slot State
                let slabBg = 'bg-emerald-500 dark:bg-emerald-600 text-white';
                let slabBorder = 'border-emerald-600 dark:border-emerald-500';
                let slabShadow = 'shadow-emerald-500/20';

                if (slot.currentStatus === 'Occupied') {
                  slabBg =
                    'bg-slate-700 dark:bg-slate-800 text-slate-100 hover:bg-slate-600 dark:hover:bg-slate-700';
                  slabBorder = 'border-slate-600 dark:border-slate-700';
                  slabShadow = 'shadow-slate-900/40';
                } else if (slot.currentStatus === 'Maturing_Cooldown') {
                  slabBg =
                    'bg-amber-500 dark:bg-amber-600 text-amber-950 dark:text-amber-100 hover:bg-amber-400';
                  slabBorder = 'border-amber-600 dark:border-amber-500';
                  slabShadow = 'shadow-amber-500/30';
                }

                return (
                  <div
                    key={slot.id}
                    className="relative"
                    onMouseEnter={() => setHoveredSlotId(slot.id)}
                    onMouseLeave={() => setHoveredSlotId(null)}
                  >
                    {/* 2.5D Isometric Slab Card */}
                    <motion.div
                      onClick={() => setSelectedSlotId(slot.id)}
                      whileHover={{
                        translateZ: 22,
                        scale: 1.05,
                      }}
                      animate={{
                        translateZ: isSelected ? 26 : 0,
                        scale: isSelected ? 1.08 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl cursor-pointer transition-colors flex flex-col items-center justify-center p-2 border-2 ${slabBg} ${slabBorder} ${slabShadow} ${
                        isSelected
                          ? 'ring-4 ring-accentGold ring-offset-2 ring-offset-slate-100 dark:ring-offset-darkBg shadow-2xl'
                          : 'shadow-lg'
                      }`}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* 14-Day High Risk Pulsing Red Beacon */}
                      {slot.highRiskAlert && (
                        <div className="absolute -top-1.5 -left-1.5 z-20 flex items-center justify-center">
                          <span className="absolute w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75" />
                          <span className="relative w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white dark:border-darkBg flex items-center justify-center text-[8px] font-black text-white">
                            !
                          </span>
                        </div>
                      )}

                      {/* Multi-Layer Stack Badge (Z-Elevated 3D Badge) */}
                      {hasMultiLayer && (
                        <div
                          className="absolute -top-2 -right-2 z-20 px-1.5 py-0.5 rounded-full bg-sky-500 dark:bg-sky-600 text-white font-extrabold text-[9px] shadow-md border border-white dark:border-darkBg font-mono"
                          style={{ transform: 'translateZ(12px)' }}
                          title={`Multi-Occupancy Layered Grave: ${slot.totalBurialsCount} Interments`}
                        >
                          L{slot.totalBurialsCount}
                        </div>
                      )}

                      {/* Slot Code (e.g., A-101) */}
                      <span className="font-extrabold text-xs sm:text-sm tracking-tight font-mono">
                        {slot.slotNumber}
                      </span>

                      {/* Soil Type Tag */}
                      <span className="text-[9px] opacity-75 capitalize font-medium">
                        {slot.soilCategory}
                      </span>

                      {/* 3D Depth Underlay Slabs */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-black/25 pointer-events-none -z-10"
                        style={{
                          transform: 'translateZ(-8px)',
                        }}
                      />
                    </motion.div>

                    {/* Hover Floating Tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -bottom-20 -translate-x-1/2 z-40 w-44 p-2.5 rounded-xl bg-slate-900/95 text-white text-xs shadow-2xl border border-slate-700 pointer-events-none backdrop-blur-md"
                          style={{
                            transform: isIsometric
                              ? 'rotateZ(45deg) rotateX(-55deg) translate(-50%, -120%)'
                              : 'translate(-50%, -110%)',
                          }}
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1">
                            <span className="font-bold text-accentEmerald">
                              Slot {slot.slotNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {slot.currentStatus.replace('_', ' ')}
                            </span>
                          </div>

                          {latestDeceased ? (
                            <div>
                              <p className="font-semibold text-slate-200 line-clamp-1">
                                {latestDeceased.deceasedName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Layer: {latestDeceased.burialOrder} • Buried:{' '}
                                {new Date(latestDeceased.burialDate).toLocaleDateString()}
                              </p>
                              {hasMultiLayer && (
                                <p className="text-[10px] text-sky-400 font-semibold mt-1">
                                  Stacked Plot: {slot.totalBurialsCount} Burials
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-emerald-400 font-medium">
                              Vacant plot ready for interment
                            </p>
                          )}

                          {slot.highRiskAlert && (
                            <p className="text-[9px] text-rose-400 font-bold mt-1 animate-pulse">
                              ⚠️ 14-Day Soil Settlement Surveillance
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
