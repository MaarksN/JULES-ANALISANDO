export interface Lead {
  id: string;
  company: string;
  role: string;
  name: string;
  email?: string;
  linkedin?: string;
  score: number;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  fit_reason?: string;
  last_contact?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
}
