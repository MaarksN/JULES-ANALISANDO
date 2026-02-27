import { memo } from "react";
import type { Lead } from "@/types/sales";
import LeadCard from "./LeadCard";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LeadGridProps {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  searchQuery: string;
  onClearSearch: () => void;
  isLoading: boolean;
}

function LeadGrid({ leads, onSelect, onCall, searchQuery, onClearSearch, isLoading }: LeadGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={onSelect} onCall={onCall} />
        ))}
        {leads.length === 0 && !isLoading && (
             <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500" role="status" aria-live="polite">
                <SearchX size={48} className="mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nenhum lead encontrado</h3>
                <p className="text-sm text-slate-400 mb-4">Tente buscar por outro termo ou limpe os filtros.</p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={onClearSearch}
                  >
                    Limpar busca
                  </Button>
                )}
             </div>
        )}
    </div>
  );
}

// ⚡ Bolt Optimization: Memoize the grid to prevent re-renders when parent state (like input value) changes
// but the filtered list (leads prop) remains the same.
export default memo(LeadGrid);
