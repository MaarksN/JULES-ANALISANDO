import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { Lead } from "@/types/sales";
import LeadGrid from "./LeadGrid";
import LeadModal from "./LeadModal";
import { Search, Filter, RefreshCw, X } from "lucide-react";
import { useSalesStore } from "@/store/useSalesStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

function SkeletonCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex gap-2">
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function LeadList() {
  const { leads, setLeads, isLoading, setIsLoading } = useSalesStore();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // ⚡ Palette: Store last focused element to restore focus when modal closes
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // ⚡ Bolt Optimization: Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⚡ Palette: Prevent search shortcut if modal is open (selectedLead is set)
      if (selectedLead) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLead]);

  // ⚡ Bolt Optimization: Debounce search to prevent excessive filtering and re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sales/leads?take=1000");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
    } catch (e) {
      console.error(e);
      // Silently fail or show toast. Using mock data if empty for demo purposes if backend is empty
      if (leads.length === 0) {
        // Optional: fallback to mock data
      }
      toast.error(
        "Erro ao carregar leads. Verifique se o backend está rodando.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCall = useCallback((lead: Lead) => {
    toast.success(`Iniciando chamada com ${lead.name}...`);
    // Placeholder navigation logic for now, as we don't have the full router setup in this component test
    console.log(`Navigating to call: /dashboard/call/new?leadId=${lead.id}`);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLead(null);
    // ⚡ Palette: Restore focus to the trigger button
    setTimeout(() => {
      lastFocusedElement.current?.focus();
    }, 0);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    inputRef.current?.focus();
  }, []);

  // ⚡ Bolt Optimization: Pre-compute lowercase values to avoid repeated toLowerCase() calls during filtering
  // This reduces the complexity inside the filter loop from O(N * M) (string operations) to O(N) (comparisons)
  const searchableLeads = useMemo(() => {
    return leads.map((lead) => ({
      ...lead,
      nameLower: lead.name.toLowerCase(),
      companyLower: lead.company.toLowerCase(),
    }));
  }, [leads]);

  // ⚡ Bolt Optimization: Memoize filtering to avoid recalculation on every render
  const filteredLeads = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(lowerSearch) ||
        l.company.toLowerCase().includes(lowerSearch),
    );
  }, [searchableLeads, debouncedSearch]);

  return (
    <div className="animate-in fade-in duration-500 p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Meus Leads</h1>
          <p className="text-slate-500">
            Gerencie suas oportunidades de prospecção.
          </p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                    type="search"
                    aria-label="Buscar leads"
                    placeholder="Buscar por nome ou empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 rounded-lg border bg-white pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white w-64 [&::-webkit-search-cancel-button]:hidden"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-indigo-500"
                        aria-label="Limpar busca"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={fetchLeads}
                disabled={isLoading}
                aria-label="Atualizar lista de leads"
                title="Atualizar lista"
            >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </Button>
            <Button
                variant="outline"
                size="icon"
                aria-label="Filtrar leads"
                title="Filtrar"
            >
                <Filter size={18} />
            </Button>
        </div>
      </div>

      {isLoading && leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p>Carregando leads...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={setSelectedLead}
              onCall={handleCall}
            />
          ))}
          {filteredLeads.length === 0 && !isLoading && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
              <SearchX size={48} className="mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Nenhum lead encontrado
              </h3>
              <p className="text-sm text-slate-400">
                Tente buscar por outro termo ou limpe os filtros.
              </p>
            </div>
          )}
        </div>
      )}

      <LeadModal
        lead={selectedLead}
        onClose={handleCloseModal}
        onCall={handleCall}
      />
    </div>
  );
}
