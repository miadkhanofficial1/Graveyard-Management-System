import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { GraveyardDirectory } from './components/directory/GraveyardDirectory';
import { QuickStats } from './components/dashboard/QuickStats';
import { OverviewCards } from './components/dashboard/OverviewCards';
import { GridControls } from './components/grid/GridControls';
import { IsometricGrid } from './components/grid/IsometricGrid';
import { SlotDetailsDrawer } from './components/grid/SlotDetailsDrawer';
import { NightPatrolDashboard } from './components/patrol/NightPatrolDashboard';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { GraveyardAdminPortal } from './components/admin/GraveyardAdminPortal';
import { AuthPage } from './components/auth/AuthPage';
import { RegisterGraveyardPage } from './components/auth/RegisterGraveyardPage';
import { UserBookingsPage } from './components/user/UserBookingsPage';
import { Badge } from './components/common/Badge';
import {
  Compass,
  ShieldAlert,
  Clock,
  Camera,
  ArrowLeft,
  MapPin,
  Box,
  FileText,
  PlusCircle,
} from 'lucide-react';

const TrackerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'overview' | 'patrol' | 'incidents'>('grid');
  const [isIsometric, setIsIsometric] = useState(true);
  const [zoom, setZoom] = useState(1.0);

  const {
    currentPatrolLogs,
    currentIncidentReports,
    selectedGraveyard,
    setActiveView,
    setIsReportIncidentOpen,
    setActiveDocketIncident,
    setIsDocketModalOpen,
  } = useApp();

  const handleZoomIn = () => setZoom((prev) => Math.min(1.45, prev + 0.15));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.65, prev - 0.15));
  const handleResetView = () => {
    setZoom(1.0);
    setIsIsometric(true);
  };

  return (
    <div className="space-y-6">
      {/* Return to Directory Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('directory')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-accentEmerald dark:text-slate-400 dark:hover:text-accentEmerald transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to National Graveyard Directory Map</span>
        </button>

        <Badge variant={selectedGraveyard?.status === 'Approved' ? 'emerald' : 'gold'} size="sm" dot>
          {selectedGraveyard?.status} Facility
        </Badge>
      </div>

      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-darkMuted/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {selectedGraveyard?.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {selectedGraveyard?.address}, {selectedGraveyard?.district} • Real-time spatial tracking & 14-day subsidence surveillance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-darkCard border border-slate-200 dark:border-darkMuted text-xs font-semibold self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'grid'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-accentEmerald" />
            2.5D Spatial Grid
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Facility Health
          </button>

          <button
            onClick={() => setActiveTab('patrol')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'patrol'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Patrol Logs ({currentPatrolLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'incidents'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Incidents ({currentIncidentReports.length})
          </button>
        </div>
      </div>

      {/* Live Metric Counters */}
      <QuickStats />

      {/* TAB 1: 2.5D ISOMETRIC ANIMATED SPATIAL GRID */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          <GridControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            isIsometric={isIsometric}
            onToggleIsometric={() => setIsIsometric(!isIsometric)}
          />

          <IsometricGrid isIsometric={isIsometric} zoom={zoom} />
        </div>
      )}

      {/* TAB 2: FACILITY OVERVIEW & SECTORS */}
      {activeTab === 'overview' && <OverviewCards />}

      {/* TAB 3: NIGHT PATROL COMMAND & BIOMETRIC CHECKPOINTS */}
      {activeTab === 'patrol' && <NightPatrolDashboard />}

      {/* TAB 4: INCIDENT REPORTS & POLICE GD DOCKETS */}
      {activeTab === 'incidents' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-darkMuted/60">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Official Incident Reports & Police GD Filings
                </h3>
                <Badge variant="rose" size="sm">
                  {currentIncidentReports.length} Active Records
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Desecration, grave tampering, and severe soil subsidence dockets with legal chain-of-custody
              </p>
            </div>

            <button
              onClick={() => setIsReportIncidentOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 active:scale-95 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File Incident Report (Police GD)</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {currentIncidentReports.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No incident reports on file
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  All plots and boundaries within this graveyard are currently secure.
                </p>
              </div>
            ) : (
              currentIncidentReports.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60">
                          {inc.gdRefNumber || 'GD-MEMO-PENDING'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Target Plot: {inc.slotId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Jurisdiction: <span className="font-semibold text-slate-700 dark:text-slate-300">{inc.policeStation || 'Local Thana'}</span> • Reported by: <span className="font-semibold text-slate-700 dark:text-slate-300">{inc.reportedBy}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge variant={inc.status === 'Filed' ? 'blue' : 'gold'} size="sm" dot>
                        {inc.status}
                      </Badge>

                      <button
                        onClick={() => {
                          setActiveDocketIncident(inc);
                          setIsDocketModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Police GD Docket</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-3">
                      <span>Filed: {new Date(inc.timestamp).toLocaleString()}</span>
                      {inc.suspectedDate && (
                        <span>• Tampered: {new Date(inc.suspectedDate).toLocaleString()}</span>
                      )}
                    </div>

                    {inc.evidencePhotos.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" /> {inc.evidencePhotos.length} Photo Evidence:
                        </span>
                        {inc.evidencePhotos.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accentEmerald underline font-mono text-[11px]"
                          >
                            Exb #{i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Responsive Slot Details Drawer */}
      <SlotDetailsDrawer />
    </div>
  );
};

const DirectoryLandingView: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Immediate Directory & Map Viewport */}
      <GraveyardDirectory />
    </div>
  );
};

export function App() {
  const { activeView, setActiveView, currentUser, showToast } = useApp();

  // Protected Route Guards
  useEffect(() => {
    if (activeView === 'superadmin') {
      if (!currentUser) {
        showToast({
          title: 'Sign In Required',
          message: 'Please sign in with a Super Admin account to access system governance.',
          type: 'warning',
        });
        setActiveView('login');
      } else if (currentUser.role !== 'Super Admin') {
        showToast({
          title: 'Access Restricted',
          message: 'Super Admin privileges required to view this portal.',
          type: 'error',
        });
        setActiveView('directory');
      }
    }

    if (activeView === 'admin_portal') {
      if (!currentUser) {
        showToast({
          title: 'Sign In Required',
          message: 'Please sign in with your Graveyard Administrator account.',
          type: 'warning',
        });
        setActiveView('login');
      } else if (currentUser.status === 'Pending') {
        showToast({
          title: 'Registration Pending Review',
          message: 'Your graveyard registration is under review by Super Admin. Access will be unlocked once accredited.',
          type: 'warning',
        });
        setActiveView('login');
      } else if (
        currentUser.role !== 'Graveyard Admin' &&
        currentUser.role !== 'Super Admin'
      ) {
        showToast({
          title: 'Access Restricted',
          message: 'Graveyard Administrator privileges required.',
          type: 'error',
        });
        setActiveView('directory');
      }
    }

    if (activeView === 'my_bookings') {
      if (!currentUser) {
        showToast({
          title: 'Sign In Required',
          message: 'Please sign in to view and manage your family burial bookings.',
          type: 'info',
        });
        setActiveView('login');
      }
    }
  }, [activeView, currentUser, setActiveView, showToast]);

  return (
    <Layout>
      {activeView === 'directory' && <DirectoryLandingView />}
      {activeView === 'tracker' && <TrackerView />}
      {activeView === 'superadmin' && currentUser?.role === 'Super Admin' && (
        <SuperAdminPortal />
      )}
      {activeView === 'admin_portal' &&
        currentUser?.status === 'Approved' &&
        (currentUser.role === 'Graveyard Admin' ||
          currentUser.role === 'Super Admin') && <GraveyardAdminPortal />}
      {activeView === 'login' && <AuthPage initialMode="signin" />}
      {activeView === 'signup' && <AuthPage initialMode="signup" />}
      {activeView === 'register_graveyard' && <RegisterGraveyardPage />}
      {activeView === 'my_bookings' && currentUser && <UserBookingsPage />}
    </Layout>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  );
}
