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
  requiredExperienceYears: number;
  location: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  applicationsCount: number;
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
}
