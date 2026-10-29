import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, UserCheck, Eye, ShieldAlert, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'Super Admin',
    label: 'Super Admin',
    description: 'System-wide governance, audit logs, and approval privileges',
    icon: <ShieldAlert className="w-4 h-4 text-purple-500" />,
    badgeColor: 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
  },
  {
    role: 'Graveyard Admin',
    label: 'Graveyard Admin',
    description: 'Slot management, burials registration, cooldown & layers',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    badgeColor: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    role: 'Staff/Patrol',
    label: 'Staff / Patrol',
    description: 'Ground security sweeps, incident reporting, soil risk tags',
    icon: <UserCheck className="w-4 h-4 text-amber-500" />,
    badgeColor: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    role: 'Public Relative',
    label: 'Public Relative',
    description: 'Deceased search, slot location, floral/prayer token verification',
    icon: <Eye className="w-4 h-4 text-sky-500" />,
    badgeColor: 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
  },
];

export const RoleSwitcher: React.FC = () => {
  const { activeRole, setActiveRole, setActiveView } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRoleConfig = ROLES.find((r) => r.role === activeRole) || ROLES[0];

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'Super Admin') {
      setActiveView('superadmin');
    } else if (role === 'Graveyard Admin') {
      setActiveView('admin_portal');
    } else if (role === 'Staff/Patrol') {
      setActiveView('tracker');
    } else if (role === 'Public Relative') {
      setActiveView('directory');
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${currentRoleConfig.badgeColor} hover:brightness-105 active:scale-95`}
        title="Switch user perspective role"
      >
        <span className="flex items-center gap-1.5">
          {currentRoleConfig.icon}
          <span className="font-semibold">{currentRoleConfig.label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-darkMuted/60 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Persona & Permissions
            </span>
          </div>

          <div className="space-y-1 px-1">
            {ROLES.map((item) => {
              const isSelected = item.role === activeRole;
              return (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="mt-0.5 p-1 rounded-md bg-white dark:bg-darkBg border border-slate-200 dark:border-slate-700">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accentEmerald" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
