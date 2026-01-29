/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Job {
  [x: string]: any;
  _id: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  status: "active" | "paused" | "closed";
  applications: number;
  deadline: string;
  createdAt: string;
}
