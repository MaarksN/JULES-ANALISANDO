import { create } from "zustand";
import type { Lead } from "@/types/sales";

interface SalesState {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useSalesStore = create<SalesState>((set) => ({
  leads: [],
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
  // Optimistic Update Helper
  updateLeadStatus: (id: string, status: any) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
    })),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
