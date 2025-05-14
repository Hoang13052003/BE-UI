export interface ProjectName {
  id: number;
  name: string;
}

export type UserRole = "ADMIN" | "USER";

export interface User {
  id: number;
  email: string;
  fullName: string;
  image: string | null;
  note: string;
  role: string;
  projects: ProjectName[];
  isActive: boolean;
}

export interface UserManager {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
}

export interface UpdateUserPayload {
  email?: string;
  fullName?: string;
  note?: string;
  role?: "ADMIN" | "USER";
  // projects?: ProjectName[];
}

export interface UserIdAndEmailResponse {
  id: number;
  email: string;
}