export interface User {
  id: string;
  email: string;
  userType: "CANDIDATE" | "COMPANY" | "ADMIN";
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  headquarters: string | null;
  foundedYear: number | null;
  isVerified: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  company: Company;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  experienceLevel: "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
  workMode: "ONSITE" | "REMOTE" | "HYBRID";
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  isSalaryVisible: boolean;
  applicationDeadline: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
  viewsCount: number;
  applicationsCount: number;
  shortlistCount: number | null;
  skills: Skill[];
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
}

export interface CandidateProfile {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  headline: string | null;
  summary: string | null;
  experienceYears: number;
  currentTitle: string | null;
  currentCompany: string | null;
  location: string | null;
  preferredWorkMode: string | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  salaryCurrency: string;
  isOpenToWork: boolean;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  skills: Skill[];
  createdAt: string;
}

export interface Resume {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  job: Job;
  candidateProfile?: CandidateProfile | null;
  resume?: Resume | null;
  status: "PENDING" | "REVIEWING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "REJECTED" | "HIRED" | "WITHDRAWN";
  similarityScore: number | null;
  coverLetter: string | null;
  companyNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}
