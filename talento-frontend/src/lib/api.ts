import axios from "axios";
import {
  Application,
  ApplicationStatus,
  AuthResponse,
  Candidate,
  Client,
  DashboardStats,
  JobOffer,
  PageResponse,
  RankedCandidate,
  SearchResult,
  StatusHistoryEntry,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("talento_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("talento_token");
      localStorage.removeItem("talento_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),
  register: (fullName: string, email: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { fullName, email, password }).then((r) => r.data),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
};

// Clients
export const clientsApi = {
  getAll: (page = 0, size = 20) =>
    api.get<PageResponse<Client>>(`/clients?page=${page}&size=${size}`).then((r) => r.data),
  getById: (id: string) => api.get<Client>(`/clients/${id}`).then((r) => r.data),
  create: (data: Omit<Client, "id" | "createdAt" | "jobOffersCount">) =>
    api.post<Client>("/clients", data).then((r) => r.data),
  update: (id: string, data: Omit<Client, "id" | "createdAt" | "jobOffersCount">) =>
    api.put<Client>(`/clients/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  getJobOffers: (id: string) => api.get<JobOffer[]>(`/clients/${id}/job-offers`).then((r) => r.data),
};

// Job Offers
export const jobOffersApi = {
  getAll: (page = 0, size = 20, status?: "OPEN" | "CLOSED") => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.append("status", status);
    return api.get<PageResponse<JobOffer>>(`/job-offers?${params}`).then((r) => r.data);
  },
  getById: (id: string) => api.get<JobOffer>(`/job-offers/${id}`).then((r) => r.data),
  getPublic: (id: string) => api.get<JobOffer>(`/job-offers/${id}/public`).then((r) => r.data),
  create: (data: Partial<JobOffer>) => api.post<JobOffer>("/job-offers", data).then((r) => r.data),
  update: (id: string, data: Partial<JobOffer>) =>
    api.put<JobOffer>(`/job-offers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/job-offers/${id}`),
  getRankedCandidates: (id: string) =>
    api.get<RankedCandidate[]>(`/job-offers/${id}/candidates-ranked`).then((r) => r.data),
};

// Candidates
export const candidatesApi = {
  getAll: (page = 0, size = 20, q?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (q) params.append("q", q);
    return api.get<PageResponse<Candidate>>(`/candidates?${params}`).then((r) => r.data);
  },
  getById: (id: string) => api.get<Candidate>(`/candidates/${id}`).then((r) => r.data),
  search: (q: string) =>
    api.get<Candidate[]>(`/candidates/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
  create: (data: Partial<Candidate>) => api.post<Candidate>("/candidates", data).then((r) => r.data),
  update: (id: string, data: Partial<Candidate>) =>
    api.put<Candidate>(`/candidates/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/candidates/${id}`),
  getApplications: (id: string) =>
    api.get<Application[]>(`/candidates/${id}/applications`).then((r) => r.data),
};

// Applications
export const applicationsApi = {
  getByJobOffer: (jobOfferId: string) =>
    api.get<Application[]>(`/applications/job-offer/${jobOfferId}`).then((r) => r.data),
  getByCandidate: (candidateId: string) =>
    api.get<Application[]>(`/applications/candidate/${candidateId}`).then((r) => r.data),
  getById: (id: string) => api.get<Application>(`/applications/${id}`).then((r) => r.data),
  getHistory: (id: string) =>
    api.get<StatusHistoryEntry[]>(`/applications/${id}/history`).then((r) => r.data),
  create: (candidateId: string, jobOfferId: string, notes?: string) =>
    api.post<Application>("/applications", { candidateId, jobOfferId, notes }).then((r) => r.data),
  createPublic: (candidateId: string, jobOfferId: string) =>
    api.post<Application>("/applications/public", { candidateId, jobOfferId }).then((r) => r.data),
  updateStatus: (id: string, status: ApplicationStatus, notes?: string) =>
    api.patch<Application>(`/applications/${id}/status`, { status, notes }).then((r) => r.data),
  updateNotes: (id: string, notes: string) =>
    api.patch<Application>(`/applications/${id}/notes`, { notes }).then((r) => r.data),
  delete: (id: string) => api.delete(`/applications/${id}`),
};

// Global search
export const searchApi = {
  search: (q: string) =>
    api.get<SearchResult>(`/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
};

export default api;
