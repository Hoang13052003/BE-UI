export interface Project {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  image: string | null;
  note: string;
  role: string;
  projects: Project[];
  deleted?: boolean;
}
