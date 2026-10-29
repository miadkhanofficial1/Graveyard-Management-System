export type GraveyardStatus = 'Approved' | 'Pending';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CommitteeAdminContact {
  name: string;
  phone: string;
  email: string;
  designation?: string;
}

export interface Graveyard {
  id: string;
  name: string;
  division: string;
  district: string;
  address: string;
  coordinates: Coordinates;
  totalSlots: number;
  occupiedSlots: number;
  status: GraveyardStatus;
  contactNumber?: string;
  establishedYear?: number;
  landAreaAcre?: number;
  adminContact?: CommitteeAdminContact;
  registrationDocUrl?: string;
  submissionDate?: string;
}

export interface Block {
  id: string;
  graveyardId: string;
  name: string; // e.g. "Block A", "Block B"
  rowCount: number;
  colCount: number;
  description?: string;
  soilCategory?: SoilCategory;
  defaultCooldownMonths?: number;
}

export type SlotStatus = 'Available' | 'Occupied' | 'Maturing_Cooldown';
export type SoilCategory = 'Standard' | 'Moist' | 'Sandy';

export interface Slot {
  id: string;
  blockId: string;
  graveyardId: string;
  slotNumber: string; // e.g., "A-101"
  row: number;
  col: number;
  currentStatus: SlotStatus;
  highRiskAlert: boolean; // First 14 days active
  soilCategory: SoilCategory;
  cooldownMonths: number; // e.g., 24
  lastBurialDate: string | null; // ISO 8601 date string
  totalBurialsCount: number; // Number badge (1, 2, 3...)
  notes?: string;
}

export interface DocumentAttachment {
  name: string;
  url: string;
  type?: string;
}

export interface DeceasedHistory {
  id: string;
  slotId: string;
  deceasedName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  burialDate: string;
  burialOrder: '1st' | '2nd' | '3rd' | string;
  causeOfDeath: string;
  deathCertificateNo: string;
  nidNumber: string;
  relativeName: string;
  relativePhoneLast4: string;
  tokenReceiptId: string;
  documents: DocumentAttachment[];
  gravestoneImageUrl?: string;
}

export type PatrolStatus = 'Secure' | 'Suspicious';

export interface PatrolLog {
  id: string;
  slotId: string;
  graveyardId: string;
  staffName: string;
  timestamp: string;
  status: PatrolStatus;
  notes: string;
}

export interface OfflinePatrolLog {
  tempId: string;
  slotId: string;
  graveyardId: string;
  staffName: string;
  timestamp: string;
  status: PatrolStatus;
  notes: string;
}

export type IncidentStatus = 'Filed' | 'Under Review' | 'Resolved';

export interface IncidentReport {
  id: string;
  graveyardId: string;
  slotId: string;
  deceasedId?: string;
  reportedBy: string;
  timestamp: string;
  evidencePhotos: string[];
  description: string;
  policeStation: string;
  status: IncidentStatus;
  guardOnDuty?: string;
  suspectedDate?: string;
  gdRefNumber?: string;
}

export type BookingStatus =
  | 'Awaiting Admin Physical Approval'
  | 'Approved'
  | 'Rejected';

export interface BurialBookingRequest {
  id: string;
  tokenReceiptId: string; // e.g. "TK-98214"
  slotId: string;
  graveyardId: string;
  deceasedName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  nidNumber: string;
  causeOfDeath: string;
  relativeName: string;
  relativePhone: string;
  relationship: string;
  status: BookingStatus;
  submittedAt: string;
  notes?: string;
}

export type PaymentMethod =
  | 'Cash'
  | 'bKash'
  | 'Nagad'
  | 'Bank Transfer'
  | 'Online Card';

export interface BurialReceipt {
  id: string;
  tokenReceiptId: string;
  slotId: string;
  slotNumber: string;
  graveyardId: string;
  deceasedName: string;
  nidNumber: string;
  relativeName: string;
  relativePhone: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  collectorName: string;
  receiptNote?: string;
  status: 'Paid' | 'Refunded';
}

export type UserRole =
  | 'Super Admin'
  | 'Graveyard Admin'
  | 'Staff/Patrol'
  | 'Public Relative';

export type UserStatus = 'Approved' | 'Pending';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  graveyardId?: string;
  registeredAt: string;
}

export type ThemeMode = 'dark' | 'light';

export type ActiveView =
  | 'directory'
  | 'tracker'
  | 'superadmin'
  | 'admin_portal'
  | 'login'
  | 'signup'
  | 'register_graveyard'
  | 'my_bookings';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface MockDatabase {
  graveyards: Graveyard[];
  blocks: Block[];
  slots: Slot[];
  deceasedHistory: DeceasedHistory[];
  patrolLogs: PatrolLog[];
  incidentReports: IncidentReport[];
  bookingRequests: BurialBookingRequest[];
  receipts: BurialReceipt[];
  users: UserAccount[];
}
