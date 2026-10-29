import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type {
  Graveyard,
  Block,
  Slot,
  DeceasedHistory,
  PatrolLog,
  OfflinePatrolLog,
  IncidentReport,
  BurialBookingRequest,
  UserRole,
  MockDatabase,
  SlotStatus,
  PatrolStatus,
  ActiveView,
  ToastNotification,
  PaymentMethod,
  BurialReceipt,
  SoilCategory,
  UserAccount,
} from '../types';
import { initialMockData } from '../data/mockData';

const STORAGE_KEY = 'gms_database_v2';
const SELECTED_GY_KEY = 'gms_selected_graveyard_id';
const ACTIVE_ROLE_KEY = 'gms_active_user_role';
const OFFLINE_QUEUE_KEY = 'gms_patrol_offline_queue';

interface AppContextType {
  // Data entities
  graveyards: Graveyard[];
  blocks: Block[];
  slots: Slot[];
  deceasedHistory: DeceasedHistory[];
  patrolLogs: PatrolLog[];
  incidentReports: IncidentReport[];
  bookingRequests: BurialBookingRequest[];
  receipts: BurialReceipt[];
  users: UserAccount[];

  // Authentication State
  currentUser: UserAccount | null;
  login: (
    email: string,
    password: string
  ) => { success: boolean; error?: string; user?: UserAccount };
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => { success: boolean; error?: string; user?: UserAccount };
  logout: () => void;
  registerGraveyardWithAdmin: (
    graveyardData: Omit<Graveyard, 'id'>,
    adminData: { name: string; email: string; phone: string; password: string }
  ) => { success: boolean; graveyardId?: string; error?: string };

  // App Selection States
  selectedGraveyardId: string;
  setSelectedGraveyardId: (id: string) => void;
  selectedGraveyard: Graveyard | undefined;

  selectedBlockId: string;
  setSelectedBlockId: (id: string) => void;

  selectedSlotId: string | null;
  setSelectedSlotId: (id: string | null) => void;
  selectedSlot: Slot | undefined;

  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Search State
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Register Graveyard Modal State
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;

  // Burial Booking Modal State
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  bookingTargetSlotId: string | null;
  setBookingTargetSlotId: (slotId: string | null) => void;

  // 2-Tier Security Dossier Unlocks
  unlockedDossierIds: string[];
  unlockDossier: (deceasedId: string, phoneLast4: string, key: string) => boolean;
  lockDossier: (deceasedId: string) => void;

  // Offline Night-Patrol Queue & Network simulation
  offlinePatrolQueue: OfflinePatrolLog[];
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (offline: boolean) => void;
  logPatrolCheckOffline: (
    slotId: string,
    staffName: string,
    status?: PatrolStatus,
    notes?: string
  ) => void;
  syncOfflineQueue: () => void;

  // Police GD Incident Docket Modals
  isReportIncidentOpen: boolean;
  setIsReportIncidentOpen: (open: boolean) => void;
  incidentTargetSlotId: string | null;
  setIncidentTargetSlotId: (slotId: string | null) => void;
  activeDocketIncident: IncidentReport | null;
  setActiveDocketIncident: (inc: IncidentReport | null) => void;
  isDocketModalOpen: boolean;
  setIsDocketModalOpen: (open: boolean) => void;
  createIncidentReportWithDocket: (
    data: Omit<IncidentReport, 'id' | 'timestamp' | 'status' | 'gdRefNumber'>
  ) => IncidentReport;

  // Toast System
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Filtered queries for active graveyard
  currentBlocks: Block[];
  currentSlots: Slot[];
  currentPatrolLogs: PatrolLog[];
  currentIncidentReports: IncidentReport[];
  currentBookingRequests: BurialBookingRequest[];
  currentReceipts: BurialReceipt[];

  // Financial Receipt Modal State
  activeReceipt: BurialReceipt | null;
  setActiveReceipt: (receipt: BurialReceipt | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;

  // Helpers
  getSlotDeceasedHistory: (slotId: string) => DeceasedHistory[];
  getSlotById: (slotId: string) => Slot | undefined;
  getBlockById: (blockId: string) => Block | undefined;
  getSlotPatrolLogs: (slotId: string) => PatrolLog[];

  // Mutations
  addGraveyard: (data: Omit<Graveyard, 'id'>) => string;
  approveGraveyard: (id: string) => void;
  rejectGraveyard: (id: string) => void;
  updateSlotStatus: (slotId: string, status: SlotStatus, highRiskAlert?: boolean) => void;
  addDeceasedBurial: (slotId: string, data: Omit<DeceasedHistory, 'id' | 'slotId'>) => void;
  addPatrolLog: (log: Omit<PatrolLog, 'id' | 'timestamp'>) => void;
  addIncidentReport: (report: Omit<IncidentReport, 'id' | 'timestamp'>) => void;
  createBookingRequest: (
    data: Omit<BurialBookingRequest, 'id' | 'tokenReceiptId' | 'status' | 'submittedAt'>
  ) => { success: boolean; token?: string; error?: string };
  approveBookingRequest: (
    requestId: string,
    slotId: string,
    feeData?: { amount: number; paymentMethod: PaymentMethod; notes?: string }
  ) => BurialReceipt | null;
  rejectBookingRequest: (requestId: string, reason?: string) => void;
  updateBlockSoilSettings: (
    blockId: string,
    soilCategory: SoilCategory,
    cooldownMonths: number
  ) => void;
  generateReceipt: (
    data: Omit<BurialReceipt, 'id' | 'paymentDate' | 'status'>
  ) => BurialReceipt;
  resetToMockData: () => void;
  clearAllDemoBurialsAndReset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize DB from localStorage or seed mock data
  const [db, setDb] = useState<MockDatabase>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.graveyards && parsed.slots && parsed.deceasedHistory) {
          const existingIds = new Set(parsed.graveyards.map((g: Graveyard) => g.id));
          const mergedGraveyards = [
            ...parsed.graveyards,
            ...initialMockData.graveyards.filter((g) => !existingIds.has(g.id)),
          ];
          const existingUserIds = new Set((parsed.users || []).map((u: UserAccount) => u.id));
          const mergedUsers = [
            ...(parsed.users || []),
            ...initialMockData.users.filter((u) => !existingUserIds.has(u.id)),
          ];
          const existingBlockIds = new Set((parsed.blocks || []).map((b: Block) => b.id));
          const mergedBlocks = [
            ...(parsed.blocks || []),
            ...initialMockData.blocks.filter((b) => !existingBlockIds.has(b.id)),
          ];
          const existingSlotIds = new Set((parsed.slots || []).map((s: Slot) => s.id));
          const mergedSlots = [
            ...(parsed.slots || []),
            ...initialMockData.slots.filter((s) => !existingSlotIds.has(s.id)),
          ];
          return {
            ...parsed,
            graveyards: mergedGraveyards,
            blocks: mergedBlocks,
            slots: mergedSlots,
            bookingRequests:
              parsed.bookingRequests && parsed.bookingRequests.length > 0
                ? parsed.bookingRequests
                : initialMockData.bookingRequests,
            receipts:
              parsed.receipts && parsed.receipts.length > 0
                ? parsed.receipts
                : initialMockData.receipts || [],
            users: mergedUsers,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load database from localStorage, initializing seed data', e);
    }
    return initialMockData;
  });

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('gms_current_auth_user_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('gms_current_auth_user_v1', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('gms_current_auth_user_v1');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Selected Graveyard
  const [selectedGraveyardId, setSelectedGraveyardIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_GY_KEY);
      if (saved && db.graveyards.some((g) => g.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return db.graveyards[0]?.id || 'gy-01';
  });

  // Selected Block
  const [selectedBlockId, setSelectedBlockId] = useState<string>(() => {
    const defaultBlock = db.blocks.find((b) => b.graveyardId === selectedGraveyardId);
    return defaultBlock?.id || db.blocks[0]?.id || 'blk-01-a';
  });

  // Selected Slot for Drawer details
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Active User Role
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole | null;
      if (
        saved &&
        ['Super Admin', 'Graveyard Admin', 'Staff/Patrol', 'Public Relative'].includes(saved)
      ) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'Staff/Patrol'; // Default to Staff/Patrol for night patrol check
  });

  // Active View
  const [activeView, setActiveView] = useState<ActiveView>('directory');

  // Search dialog
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Burial Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTargetSlotId, setBookingTargetSlotId] = useState<string | null>(null);

  // 2-Tier Security Unlocked Dossiers
  const [unlockedDossierIds, setUnlockedDossierIds] = useState<string[]>([]);

  // Incident & Police GD Docket States
  const [isReportIncidentOpen, setIsReportIncidentOpen] = useState(false);
  const [incidentTargetSlotId, setIncidentTargetSlotId] = useState<string | null>(null);
  const [activeDocketIncident, setActiveDocketIncident] = useState<IncidentReport | null>(null);
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);

  // Financial Receipt Modal States
  const [activeReceipt, setActiveReceipt] = useState<BurialReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Offline Night Patrol Queue
  const [offlinePatrolQueue, setOfflinePatrolQueue] = useState<OfflinePatrolLog[]>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Network Simulation (toggle between simulated online/offline)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persist DB changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to persist mock database to localStorage', e);
    }
  }, [db]);

  // Persist offline queue
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlinePatrolQueue));
    } catch (e) {
      console.error('Failed to persist offline queue to localStorage', e);
    }
  }, [offlinePatrolQueue]);

  // Handle browser native online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!isSimulatedOffline && offlinePatrolQueue.length > 0) {
        syncOfflineQueue();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [offlinePatrolQueue, isSimulatedOffline]);

  const setSelectedGraveyardId = (id: string) => {
    setSelectedGraveyardIdState(id);
    const firstBlock = db.blocks.find((b) => b.graveyardId === id);
    if (firstBlock) {
      setSelectedBlockId(firstBlock.id);
    }
    setSelectedSlotId(null);
    try {
      localStorage.setItem(SELECTED_GY_KEY, id);
    } catch {
      // ignore
    }
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
    } catch {
      // ignore
    }
  };

  // Active Graveyard object
  const selectedGraveyard = useMemo(
    () => db.graveyards.find((g) => g.id === selectedGraveyardId) || db.graveyards[0],
    [db.graveyards, selectedGraveyardId]
  );

  // Selected Slot object
  const selectedSlot = useMemo(
    () => (selectedSlotId ? db.slots.find((s) => s.id === selectedSlotId) : undefined),
    [db.slots, selectedSlotId]
  );

  // Filtered lists for the active graveyard
  const currentBlocks = useMemo(
    () => db.blocks.filter((b) => b.graveyardId === selectedGraveyardId),
    [db.blocks, selectedGraveyardId]
  );

  const currentSlots = useMemo(
    () => db.slots.filter((s) => s.graveyardId === selectedGraveyardId),
    [db.slots, selectedGraveyardId]
  );

  const currentPatrolLogs = useMemo(
    () => db.patrolLogs.filter((p) => p.graveyardId === selectedGraveyardId),
    [db.patrolLogs, selectedGraveyardId]
  );

  const currentIncidentReports = useMemo(
    () => db.incidentReports.filter((i) => i.graveyardId === selectedGraveyardId),
    [db.incidentReports, selectedGraveyardId]
  );

  const currentBookingRequests = useMemo(
    () => db.bookingRequests.filter((r) => r.graveyardId === selectedGraveyardId),
    [db.bookingRequests, selectedGraveyardId]
  );

  const currentReceipts = useMemo(
    () => (db.receipts || []).filter((r) => r.graveyardId === selectedGraveyardId),
    [db.receipts, selectedGraveyardId]
  );

  // Helper lookups
  const getSlotDeceasedHistory = (slotId: string): DeceasedHistory[] => {
    return db.deceasedHistory
      .filter((d) => d.slotId === slotId)
      .sort((a, b) => new Date(a.burialDate).getTime() - new Date(b.burialDate).getTime());
  };

  const getSlotById = (slotId: string): Slot | undefined => {
    return db.slots.find((s) => s.id === slotId);
  };

  const getBlockById = (blockId: string): Block | undefined => {
    return db.blocks.find((b) => b.id === blockId);
  };

  const getSlotPatrolLogs = (slotId: string): PatrolLog[] => {
    return db.patrolLogs
      .filter((p) => p.slotId === slotId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // 2-Tier Security Dossier Unlock Verification
  const unlockDossier = (deceasedId: string, phoneLast4: string, key: string): boolean => {
    const record = db.deceasedHistory.find((d) => d.id === deceasedId);
    if (!record) return false;

    const cleanPhoneInput = phoneLast4.trim();
    const phoneMatches = record.relativePhoneLast4 === cleanPhoneInput;

    const cleanKeyInput = key.trim().toLowerCase();
    const dateMatches = record.dateOfDeath.toLowerCase() === cleanKeyInput;
    const tokenMatches = record.tokenReceiptId.toLowerCase() === cleanKeyInput;

    if (phoneMatches && (dateMatches || tokenMatches)) {
      setUnlockedDossierIds((prev) => (prev.includes(deceasedId) ? prev : [...prev, deceasedId]));
      showToast({
        title: 'Tier 2 Dossier Unlocked',
        message: 'Security credentials verified. Full registry records & certificates are now visible.',
        type: 'success',
      });
      return true;
    } else {
      showToast({
        title: 'Verification Failed',
        message: 'Relative phone last 4 and Date of Death / Token ID do not match registered records.',
        type: 'error',
      });
      return false;
    }
  };

  const lockDossier = (deceasedId: string) => {
    setUnlockedDossierIds((prev) => prev.filter((id) => id !== deceasedId));
  };

  // Offline Patrol Log Check-in
  const logPatrolCheckOffline = (
    slotId: string,
    staffName: string,
    status: PatrolStatus = 'Secure',
    notes: string = 'Routine night patrol sweep verified. Soil & boundary stakes secure.'
  ) => {
    const timestamp = new Date().toISOString();
    const slot = db.slots.find((s) => s.id === slotId);

    if (isSimulatedOffline || (!navigator.onLine && !isSimulatedOffline)) {
      // Save to offline queue
      const offlineItem: OfflinePatrolLog = {
        tempId: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        slotId,
        graveyardId: selectedGraveyardId,
        staffName,
        timestamp,
        status,
        notes: `[Offline Cached] ${notes}`,
      };

      setOfflinePatrolQueue((prev) => [offlineItem, ...prev]);
      showToast({
        title: 'Patrol Log Queued Offline',
        message: `Check-in for Slot ${slot?.slotNumber || slotId} stored in local cache. Will sync automatically when online.`,
        type: 'warning',
      });
    } else {
      // Save directly online
      const newLog: PatrolLog = {
        id: `log-${Date.now().toString().slice(-6)}`,
        slotId,
        graveyardId: selectedGraveyardId,
        staffName,
        timestamp,
        status,
        notes,
      };

      setDb((prev) => ({
        ...prev,
        patrolLogs: [newLog, ...prev.patrolLogs],
      }));

      showToast({
        title: 'Patrol Check Recorded',
        message: `Slot ${slot?.slotNumber || slotId} marked as ${status} by ${staffName}.`,
        type: 'success',
      });
    }
  };

  const syncOfflineQueue = () => {
    if (offlinePatrolQueue.length === 0) {
      showToast({
        title: 'Queue Empty',
        message: 'All patrol sweeps are already synchronized.',
        type: 'info',
      });
      return;
    }

    const convertedLogs: PatrolLog[] = offlinePatrolQueue.map((item) => ({
      id: `log-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`,
      slotId: item.slotId,
      graveyardId: item.graveyardId,
      staffName: item.staffName,
      timestamp: item.timestamp,
      status: item.status,
      notes: item.notes.replace('[Offline Cached] ', '[Synced] '),
    }));

    setDb((prev) => ({
      ...prev,
      patrolLogs: [...convertedLogs, ...prev.patrolLogs],
    }));

    const count = offlinePatrolQueue.length;
    setOfflinePatrolQueue([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);

    showToast({
      title: 'Offline Queue Synchronized',
      message: `Successfully synchronized ${count} cached patrol check-in(s) to master registry.`,
      type: 'success',
    });
  };

  // Police GD Docket Creation
  const createIncidentReportWithDocket = (
    data: Omit<IncidentReport, 'id' | 'timestamp' | 'status' | 'gdRefNumber'>
  ): IncidentReport => {
    const timestamp = new Date().toISOString();
    const thanaSlug = (data.policeStation || 'DMP').replace(/[^a-zA-Z]/g, '').toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const gdRefNumber = `GD-REF-2026/${thanaSlug}/${randNum}`;

    const newIncident: IncidentReport = {
      ...data,
      id: `inc-${Date.now().toString().slice(-6)}`,
      timestamp,
      status: 'Filed',
      gdRefNumber,
    };

    setDb((prev) => ({
      ...prev,
      incidentReports: [newIncident, ...prev.incidentReports],
    }));

    // Update target slot status if desecration reported
    if (data.slotId) {
      updateSlotStatus(data.slotId, 'Occupied', true);
    }

    // Set active docket and launch modal
    setActiveDocketIncident(newIncident);
    setIsDocketModalOpen(true);

    showToast({
      title: 'Incident Docket Generated',
      message: `Police GD Ref ${gdRefNumber} created. Formal legal docket ready for dispatch.`,
      type: 'success',
    });

    return newIncident;
  };

  // Online Slot Booking / Dafon Request
  const createBookingRequest = (
    data: Omit<BurialBookingRequest, 'id' | 'tokenReceiptId' | 'status' | 'submittedAt'>
  ): { success: boolean; token?: string; error?: string } => {
    const cleanNid = data.nidNumber.trim();
    const duplicateInHistory = db.deceasedHistory.some((d) => d.nidNumber === cleanNid);
    const duplicateInRequests = db.bookingRequests.some(
      (r) => r.nidNumber === cleanNid && r.status !== 'Rejected'
    );

    if (duplicateInHistory || duplicateInRequests) {
      const errMsg = `Duplicate NID Error: National ID ${cleanNid} is already registered in active burial records.`;
      showToast({
        title: 'Registration Rejected',
        message: errMsg,
        type: 'error',
      });
      return { success: false, error: errMsg };
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const token = `TK-${randomDigits}`;
    const newId = `req-${Date.now().toString().slice(-6)}`;

    const newRequest: BurialBookingRequest = {
      ...data,
      id: newId,
      tokenReceiptId: token,
      status: 'Awaiting Admin Physical Approval',
      submittedAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      bookingRequests: [newRequest, ...prev.bookingRequests],
    }));

    showToast({
      title: 'Booking Request Submitted',
      message: `Reservation token ${token} issued. Status: Awaiting Admin Physical Approval.`,
      type: 'success',
    });

    return { success: true, token };
  };

  // Mutating operations
  const addGraveyard = (data: Omit<Graveyard, 'id'>): string => {
    const newId = `gy-${Date.now().toString().slice(-4)}`;
    const newGraveyard: Graveyard = {
      ...data,
      id: newId,
      submissionDate: new Date().toISOString(),
    };

    const defaultBlockA: Block = {
      id: `blk-${newId}-a`,
      graveyardId: newId,
      name: 'Block A (General Sector)',
      rowCount: 4,
      colCount: 4,
      description: 'Initial allocation sector',
    };

    setDb((prev) => ({
      ...prev,
      graveyards: [newGraveyard, ...prev.graveyards],
      blocks: [...prev.blocks, defaultBlockA],
    }));

    return newId;
  };

  const registerGraveyardWithAdmin = (
    graveyardData: Omit<Graveyard, 'id'>,
    adminData: { name: string; email: string; phone: string; password: string }
  ): { success: boolean; graveyardId?: string; error?: string } => {
    const cleanEmail = adminData.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      const errMsg = 'An account with this administrator email already exists.';
      showToast({ title: 'Registration Failed', message: errMsg, type: 'error' });
      return { success: false, error: errMsg };
    }

    const newGraveyardId = `gy-${Date.now().toString().slice(-4)}`;
    const newGraveyard: Graveyard = {
      ...graveyardData,
      id: newGraveyardId,
      status: 'Pending',
      submissionDate: new Date().toISOString(),
      adminContact: {
        name: adminData.name,
        email: cleanEmail,
        phone: adminData.phone,
        designation: 'Cemetery Committee Admin',
      },
    };

    const newAdminUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: adminData.name,
      email: cleanEmail,
      phone: adminData.phone,
      passwordHash: adminData.password,
      role: 'Graveyard Admin',
      status: 'Pending',
      graveyardId: newGraveyardId,
      registeredAt: new Date().toISOString(),
    };

    const defaultBlockA: Block = {
      id: `blk-${newGraveyardId}-a`,
      graveyardId: newGraveyardId,
      name: 'Block A (General Sector)',
      rowCount: 4,
      colCount: 4,
      description: 'Initial allocation sector',
    };

    setDb((prev) => ({
      ...prev,
      graveyards: [newGraveyard, ...prev.graveyards],
      blocks: [...prev.blocks, defaultBlockA],
      users: [...prev.users, newAdminUser],
    }));

    showToast({
      title: 'Registration Submitted',
      message: 'Graveyard registration submitted successfully! Awaiting Super Admin approval.',
      type: 'success',
    });

    return { success: true, graveyardId: newGraveyardId };
  };

  const approveGraveyard = (id: string) => {
    setDb((prev) => ({
      ...prev,
      graveyards: prev.graveyards.map((g) =>
        g.id === id ? { ...g, status: 'Approved' as const } : g
      ),
      users: prev.users.map((u) =>
        u.graveyardId === id ? { ...u, status: 'Approved' as const } : u
      ),
    }));
    showToast({
      title: 'Facility Approved',
      message: 'Graveyard committee onboarding status updated to Approved. Admin access activated.',
      type: 'success',
    });
  };

  const login = (
    email: string,
    password: string
  ): { success: boolean; error?: string; user?: UserAccount } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const errMsg = 'Account not found with this email address.';
      showToast({ title: 'Sign In Failed', message: errMsg, type: 'error' });
      return { success: false, error: errMsg };
    }

    if (user.passwordHash !== password) {
      const errMsg = 'Incorrect password. Please verify your credentials.';
      showToast({ title: 'Sign In Failed', message: errMsg, type: 'error' });
      return { success: false, error: errMsg };
    }

    // Check if Graveyard Admin is pending approval
    if (user.role === 'Graveyard Admin' && user.status === 'Pending') {
      const errMsg =
        'Your graveyard registration is under review by Super Admin. Access will be unlocked once accredited.';
      showToast({ title: 'Registration Under Review', message: errMsg, type: 'warning' });
      return { success: false, error: errMsg, user };
    }

    setCurrentUser(user);
    setActiveRoleState(user.role);

    if (user.graveyardId) {
      setSelectedGraveyardIdState(user.graveyardId);
    }

    // Role-based automatic redirect:
    if (user.role === 'Super Admin') {
      setActiveView('superadmin');
    } else if (user.role === 'Graveyard Admin') {
      setActiveView('admin_portal');
    } else if (user.role === 'Staff/Patrol') {
      setActiveView('tracker');
    } else {
      setActiveView('my_bookings');
    }

    showToast({
      title: 'Welcome Back',
      message: `Signed in as ${user.name} (${user.role}).`,
      type: 'success',
    });

    return { success: true, user };
  };

  const signup = (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): { success: boolean; error?: string; user?: UserAccount } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      const errMsg = 'An account with this email address already exists.';
      showToast({ title: 'Sign Up Failed', message: errMsg, type: 'error' });
      return { success: false, error: errMsg };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      passwordHash: data.password,
      role: 'Public Relative',
      status: 'Approved',
      registeredAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    setCurrentUser(newUser);
    setActiveRoleState('Public Relative');
    setActiveView('my_bookings');

    showToast({
      title: 'Account Registered',
      message: `Welcome, ${newUser.name}! Your public relative account is ready.`,
      type: 'success',
    });

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRoleState('Public Relative');
    setActiveView('directory');
    showToast({
      title: 'Signed Out',
      message: 'You have been successfully signed out.',
      type: 'info',
    });
  };

  const updateSlotStatus = (slotId: string, status: SlotStatus, highRiskAlert?: boolean) => {
    setDb((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            currentStatus: status,
            ...(highRiskAlert !== undefined ? { highRiskAlert } : {}),
          };
        }
        return s;
      }),
    }));
  };

  const addDeceasedBurial = (
    slotId: string,
    data: Omit<DeceasedHistory, 'id' | 'slotId'>
  ) => {
    const newRecordId = `dec-${Date.now().toString().slice(-6)}`;
    const newRecord: DeceasedHistory = {
      ...data,
      id: newRecordId,
      slotId,
    };

    setDb((prev) => {
      const updatedSlots = prev.slots.map((slot) => {
        if (slot.id === slotId) {
          const currentBurials = prev.deceasedHistory.filter((d) => d.slotId === slotId).length;
          return {
            ...slot,
            currentStatus: 'Occupied' as SlotStatus,
            highRiskAlert: true,
            lastBurialDate: data.burialDate,
            totalBurialsCount: currentBurials + 1,
          };
        }
        return slot;
      });

      return {
        ...prev,
        slots: updatedSlots,
        deceasedHistory: [...prev.deceasedHistory, newRecord],
      };
    });
  };

  const addPatrolLog = (log: Omit<PatrolLog, 'id' | 'timestamp'>) => {
    const newLog: PatrolLog = {
      ...log,
      id: `log-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      patrolLogs: [newLog, ...prev.patrolLogs],
    }));
  };

  const addIncidentReport = (report: Omit<IncidentReport, 'id' | 'timestamp'>) => {
    const newReport: IncidentReport = {
      ...report,
      id: `inc-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      incidentReports: [newReport, ...prev.incidentReports],
    }));
  };

  const rejectGraveyard = (id: string) => {
    setDb((prev) => ({
      ...prev,
      graveyards: prev.graveyards.filter((g) => g.id !== id),
    }));
    showToast({
      title: 'Facility Registration Declined',
      message: 'Pending graveyard onboarding request was rejected and archived.',
      type: 'info',
    });
  };

  const approveBookingRequest = (
    requestId: string,
    slotId: string,
    feeData?: { amount: number; paymentMethod: PaymentMethod; notes?: string }
  ): BurialReceipt | null => {
    const req = db.bookingRequests.find((r) => r.id === requestId);
    if (!req) return null;

    const targetSlot = db.slots.find((s) => s.id === slotId);
    if (!targetSlot) return null;

    const currentSlotBurials = db.deceasedHistory.filter((d) => d.slotId === slotId).length;
    const orderLabel = currentSlotBurials === 0 ? '1st' : currentSlotBurials === 1 ? '2nd' : '3rd';
    const newDeceasedId = `dec-${Date.now().toString().slice(-6)}`;
    const newDeceased: DeceasedHistory = {
      id: newDeceasedId,
      slotId,
      deceasedName: req.deceasedName,
      dateOfBirth: req.dateOfBirth,
      dateOfDeath: req.dateOfDeath,
      burialDate: new Date().toISOString(),
      burialOrder: orderLabel,
      causeOfDeath: req.causeOfDeath,
      deathCertificateNo: `DC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      nidNumber: req.nidNumber,
      relativeName: req.relativeName,
      relativePhoneLast4: req.relativePhone.slice(-4),
      tokenReceiptId: req.tokenReceiptId,
      documents: [{ name: 'City Corporation Burial Slip.pdf', url: '#' }],
    };

    const updatedSlots = db.slots.map((s) => {
      if (s.id === slotId) {
        return {
          ...s,
          currentStatus: 'Occupied' as SlotStatus,
          highRiskAlert: true,
          lastBurialDate: new Date().toISOString(),
          totalBurialsCount: currentSlotBurials + 1,
        };
      }
      return s;
    });

    const feeAmount = feeData?.amount ?? 5000;
    const paymentMode = feeData?.paymentMethod ?? 'Cash';
    const newReceiptId = `rcpt-${Date.now().toString().slice(-6)}`;
    const receipt: BurialReceipt = {
      id: newReceiptId,
      tokenReceiptId: req.tokenReceiptId,
      slotId,
      slotNumber: targetSlot.slotNumber,
      graveyardId: req.graveyardId,
      deceasedName: req.deceasedName,
      nidNumber: req.nidNumber,
      relativeName: req.relativeName,
      relativePhone: req.relativePhone,
      amount: feeAmount,
      paymentMethod: paymentMode,
      paymentDate: new Date().toISOString(),
      collectorName: 'Graveyard Admin Desk',
      receiptNote: feeData?.notes || 'Standard dafon fee & 2.5D layer burial registration',
      status: 'Paid',
    };

    setDb((prev) => ({
      ...prev,
      bookingRequests: prev.bookingRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'Approved' as const, slotId } : r
      ),
      deceasedHistory: [...prev.deceasedHistory, newDeceased],
      slots: updatedSlots,
      receipts: [receipt, ...(prev.receipts || [])],
    }));

    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);

    showToast({
      title: 'Burial Approved & Registered',
      message: `${req.deceasedName} assigned to Plot ${targetSlot.slotNumber}. Official receipt generated.`,
      type: 'success',
    });

    return receipt;
  };

  const rejectBookingRequest = (requestId: string, reason?: string) => {
    setDb((prev) => ({
      ...prev,
      bookingRequests: prev.bookingRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'Rejected' as const, notes: reason || r.notes } : r
      ),
    }));
    showToast({
      title: 'Booking Request Rejected',
      message: 'The burial slot booking request was rejected.',
      type: 'info',
    });
  };

  const updateBlockSoilSettings = (
    blockId: string,
    soilCategory: SoilCategory,
    cooldownMonths: number
  ) => {
    setDb((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, soilCategory, defaultCooldownMonths: cooldownMonths } : b
      ),
      slots: prev.slots.map((s) =>
        s.blockId === blockId ? { ...s, soilCategory, cooldownMonths } : s
      ),
    }));
    showToast({
      title: 'Soil & Cooldown Settings Updated',
      message: `Sector updated to ${soilCategory} soil with ${cooldownMonths}-month natural biodegrade cooldown.`,
      type: 'success',
    });
  };

  const generateReceipt = (
    data: Omit<BurialReceipt, 'id' | 'paymentDate' | 'status'>
  ): BurialReceipt => {
    const newReceipt: BurialReceipt = {
      ...data,
      id: `rcpt-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString(),
      status: 'Paid',
    };
    setDb((prev) => ({
      ...prev,
      receipts: [newReceipt, ...(prev.receipts || [])],
    }));
    setActiveReceipt(newReceipt);
    setIsReceiptModalOpen(true);
    showToast({
      title: 'Official Receipt Generated',
      message: `Receipt ${newReceipt.tokenReceiptId} created for ${newReceipt.deceasedName}.`,
      type: 'success',
    });
    return newReceipt;
  };

  const resetToMockData = () => {
    setDb(initialMockData);
    setOfflinePatrolQueue([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    showToast({
      title: 'Database Reset',
      message: 'Demo dataset restored to initial seed configuration.',
      type: 'info',
    });
  };

  const clearAllDemoBurialsAndReset = () => {
    // Keep initial facility templates (graveyards & blocks & users) intact,
    // but reset all slots to Available, 0 burials count, no risk alert,
    // and wipe deceasedHistory, patrolLogs, incidentReports, bookingRequests, and receipts.
    setDb((prev) => {
      const resetSlots: Slot[] = prev.slots.map((s) => ({
        ...s,
        currentStatus: 'Available' as SlotStatus,
        totalBurialsCount: 0,
        lastBurialDate: null,
        soilDepressionAlert: false,
        highRiskAlert: false,
        notes: undefined,
      }));

      const resetGraveyards = prev.graveyards.map((g) => ({
        ...g,
        occupiedSlots: 0,
      }));

      return {
        ...prev,
        graveyards: resetGraveyards,
        slots: resetSlots,
        deceasedHistory: [],
        patrolLogs: [],
        incidentReports: [],
        bookingRequests: [],
        receipts: [],
      };
    });

    setOfflinePatrolQueue([]);
    setUnlockedDossierIds([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);

    showToast({
      title: 'Database Cleared & Ready for Production',
      message: 'All demo burials, patrol checks, and incident dockets wiped. Cemetery facilities and slots reset to clean Available status.',
      type: 'success',
    });
  };

  return (
    <AppContext.Provider
      value={{
        graveyards: db.graveyards,
        blocks: db.blocks,
        slots: db.slots,
        deceasedHistory: db.deceasedHistory,
        patrolLogs: db.patrolLogs,
        incidentReports: db.incidentReports,
        bookingRequests: db.bookingRequests,
        receipts: db.receipts || [],
        selectedGraveyardId,
        setSelectedGraveyardId,
        selectedGraveyard,
        selectedBlockId,
        setSelectedBlockId,
        selectedSlotId,
        setSelectedSlotId,
        selectedSlot,
        activeRole,
        setActiveRole,
        activeView,
        setActiveView,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isBookingModalOpen,
        setIsBookingModalOpen,
        bookingTargetSlotId,
        setBookingTargetSlotId,
        unlockedDossierIds,
        unlockDossier,
        lockDossier,
        offlinePatrolQueue,
        isSimulatedOffline,
        setIsSimulatedOffline,
        logPatrolCheckOffline,
        syncOfflineQueue,
        isReportIncidentOpen,
        setIsReportIncidentOpen,
        incidentTargetSlotId,
        setIncidentTargetSlotId,
        activeDocketIncident,
        setActiveDocketIncident,
        isDocketModalOpen,
        setIsDocketModalOpen,
        createIncidentReportWithDocket,
        activeReceipt,
        setActiveReceipt,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        toasts,
        showToast,
        dismissToast,
        currentBlocks,
        currentSlots,
        currentPatrolLogs,
        currentIncidentReports,
        currentBookingRequests,
        currentReceipts,
        getSlotDeceasedHistory,
        getSlotById,
        getBlockById,
        getSlotPatrolLogs,
        addGraveyard,
        approveGraveyard,
        rejectGraveyard,
        updateSlotStatus,
        addDeceasedBurial,
        addPatrolLog,
        addIncidentReport,
        createBookingRequest,
        approveBookingRequest,
        rejectBookingRequest,
        updateBlockSoilSettings,
        generateReceipt,
        users: db.users || [],
        currentUser,
        login,
        signup,
        logout,
        registerGraveyardWithAdmin,
        resetToMockData,
        clearAllDemoBurialsAndReset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
