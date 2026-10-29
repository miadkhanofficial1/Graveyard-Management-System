import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Box,
  LayoutGrid,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GridControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  isIsometric: boolean;
  onToggleIsometric: () => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  isIsometric,
  onToggleIsometric,
}) => {
  const { currentBlocks, selectedBlockId, setSelectedBlockId, currentSlots } = useApp();

  return (
    <div className="space-y-4">
      {/* Top Bar: Block Tabs & Viewport Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm">
        {/* Block Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {currentBlocks.map((block) => {
            const isSelected = block.id === selectedBlockId;
            const blockSlots = currentSlots.filter((s) => s.blockId === block.id);
            const occupied = blockSlots.filter((s) => s.currentStatus === 'Occupied').length;
            const total = blockSlots.length || block.rowCount * block.colCount;

            return (
              <button
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md scale-100'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{block.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isSelected
                      ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900 font-extrabold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {occupied}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Viewport Control Cluster */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Isometric / Flat 2D Toggle */}
          <button
            onClick={onToggleIsometric}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isIsometric
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle between 2.5D Isometric 3D angle and 2D Orthographic Flat Grid"
          >
            {isIsometric ? <Box className="w-3.5 h-3.5 text-accentEmerald" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isIsometric ? '2.5D Isometric' : '2D Flat'}</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-800/80 p-0.5">
            <button
              onClick={onZoomOut}
              disabled={zoom <= 0.65}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-500 font-semibold select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              disabled={zoom >= 1.45}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset View */}
          <button
            onClick={onResetView}
            className="p-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-accentEmerald transition-colors"
            title="Reset Grid Angle & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2 rounded-xl bg-slate-50/70 dark:bg-darkCard/50 border border-slate-200/60 dark:border-darkMuted/50 text-[11px] text-slate-600 dark:text-slate-300">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
          Spatial Grid Legend:
        </span>

        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 shadow-sm" />
            <span>Available Plot</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-slate-600 dark:bg-slate-700 shadow-sm" />
            <span>Occupied</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-amber-500 shadow-sm" />
            <span>Maturing / Cooldown</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              14-Day High-Risk Watch
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-sky-500 text-white font-mono">
              L2+
            </span>
            <span>Multi-Layer History</span>
          </div>
        </div>
      </div>
    </div>
  );
};
