import React from 'react';
import {
  Layers,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickStats: React.FC = () => {
  const { currentSlots, currentIncidentReports } = useApp();

  const totalCurrentSlots = currentSlots.length;
  const occupiedSlotsCount = currentSlots.filter((s) => s.currentStatus === 'Occupied').length;
  const availableSlotsCount = currentSlots.filter((s) => s.currentStatus === 'Available').length;
  const cooldownSlotsCount = currentSlots.filter(
    (s) => s.currentStatus === 'Maturing_Cooldown'
  ).length;

  const highRiskSlotsCount = currentSlots.filter((s) => s.highRiskAlert).length;
  const multiLayerSlotsCount = currentSlots.filter((s) => s.totalBurialsCount > 1).length;

  const occupancyRate =
    totalCurrentSlots > 0 ? Math.round((occupiedSlotsCount / totalCurrentSlots) * 100) : 0;

  const stats = [
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      subtext: `${occupiedSlotsCount} of ${totalCurrentSlots} active grid slots`,
      icon: <TrendingUp className="w-5 h-5 text-accentEmerald" />,
      accent: 'border-l-4 border-accentEmerald',
    },
    {
      label: 'Available Slots',
      value: availableSlotsCount,
      subtext: 'Immediate interment ready',
      icon: <CheckCircle2 className="w-5 h-5 text-sky-500" />,
      accent: 'border-l-4 border-sky-500',
    },
    {
      label: '14-Day High Risk',
      value: highRiskSlotsCount,
      subtext: 'Fresh soil shift alert active',
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      accent: 'border-l-4 border-rose-500 bg-rose-50/20 dark:bg-rose-950/10',
    },
    {
      label: 'Multi-Layer Vaults',
      value: multiLayerSlotsCount,
      subtext: '2nd & 3rd depth burials',
      icon: <Layers className="w-5 h-5 text-accentGold" />,
      accent: 'border-l-4 border-accentGold',
    },
    {
      label: 'Maturing / Cooldown',
      value: cooldownSlotsCount,
      subtext: 'Natural resting cycle',
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      accent: 'border-l-4 border-indigo-500',
    },
    {
      label: 'Incidents & Flags',
      value: currentIncidentReports.length,
      subtext: 'Under patrol review',
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      accent: 'border-l-4 border-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="group p-4 rounded-[24px] liquid-glass-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out cursor-default relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center backdrop-blur-md shadow-xs transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {item.value}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
            {item.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};
