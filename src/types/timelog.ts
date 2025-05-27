import { UserSummary } from "./project";

export interface ProjectContextTimeLog {
  id: number;
  performer: UserSummary;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
}