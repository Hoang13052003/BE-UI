import { Project } from "./project";

export interface ProjectName {
  id: number;
  name: string;
}

export type UserRole = "ADMIN" | "MANAGER" | "USER";

export interface User {
  id: number;
  email: string;
  fullName: string;
  image: string | null;
  note: string;
  role: string;
  projects: Project[];
  isActive: boolean;
}

export interface UserRegister {
  email: string;
  fullName: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  note: string;
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
  role?: "ADMIN" | "MANAGER" | "USER";
}

export interface UserIdAndEmailResponse {
  id: number;
  email: string;
}
