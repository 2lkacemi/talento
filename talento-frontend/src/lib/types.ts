export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  createdAt: string;
  jobOffersCount: number;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  clientCompanyName: string;
  requiredSkills: string[];
  requiredLanguages: string[];
  requiredExperienceYears: number;
  location: string;
  openPositions: number;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  applicationsCount: number;
  hiredCount: number;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  experienceYears: number;
  skills: string[];
  languages: string[];
  cvUrl?: string;
  createdAt: string;
  applicationsCount: number;
}

export type ApplicationStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERVIEW"
  | "CLIENT_INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export interface StatusHistoryEntry {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  notes: string | null;
  changedAt: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobOfferId: string;
  jobOfferTitle: string;
  clientName: string;
  status: ApplicationStatus;
  score: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface RankedCandidate {
  candidate: Candidate;
  matchScore: number;
  alreadyApplied: boolean;
}

export interface DashboardStats {
  totalCandidates: number;
  totalJobOffers: number;
  openJobOffers: number;
  totalClients: number;
  activeApplications: number;
  hiredThisMonth: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  agencyId: string;
  agencyName: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  inviteUrl?: string;
}

export interface AgencyUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

export interface InvitationPreview {
  email: string;
  agencyName: string;
  role: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SearchResult {
  candidates: Candidate[];
  clients: Client[];
  jobOffers: JobOffer[];
}
