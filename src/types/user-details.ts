import { Timestamp } from "firebase/firestore";

export interface UserDetails {
  firstname: string;
  lastname: string;
  studentNum: number;
  email: string;
  uid: string;
  id?: string;
  admin: boolean;
  lastActive?: Date | Timestamp;
  recentActiveDays?: Date[] | Timestamp[];
}