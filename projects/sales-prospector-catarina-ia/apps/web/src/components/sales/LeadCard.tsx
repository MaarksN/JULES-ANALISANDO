import { memo } from "react";
import type { Lead } from "@/types/sales";
import { Button } from "@/components/ui/Button";
import { Building2, MapPin, Linkedin, Mail, Phone } from "lucide-react";
interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onCall?: (lead: Lead) => void;
}

function LeadCard({ lead, onClick, onCall }: LeadCardProps) {
  // ⚡ Bolt Optimization: Replaced framer-motion with CSS animations to reduce JS execution overhead
  // when mounting large lists (1000+ items). This improves initial render and filtering performance.
  return (
    <div
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 hover:-translate-y-[2px] hover:shadow-xl animate-fade-in-up"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {lead.company.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{lead.name}</h3>
            <p className="text-sm text-slate-500">{lead.role}</p>
          </div>
        </div>
        <div className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
            lead.score > 80 ? "bg-green-100 text-green-700" : lead.score > 50 ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
        }`}>
            Score: {lead.score}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
            <Building2 size={14} /> {lead.company}
        </div>
        <div className="flex items-center gap-2">
            <MapPin size={14} /> {lead.location || "Localização não inf."}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex gap-2">
            {lead.linkedin && (
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20">
                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${lead.name} (abre em nova aba)`}>
                  <Linkedin size={18} />
                </a>
              </Button>
            )}
            {lead.email && (
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                <a href={`mailto:${lead.email}`} aria-label={`Enviar email para ${lead.name}`}>
                  <Mail size={18} />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); if (onCall) onCall(lead); }}
              className="h-9 w-9 rounded-full text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
              aria-label={`Ligar para ${lead.name}`}
              title="Ligar com IA"
            >
                <Phone size={18} />
            </Button>
        </div>
        <Button size="sm" variant="outline" onClick={() => onClick(lead)} aria-label={`Ver detalhes de ${lead.name}`}>
            Ver Detalhes
        </Button>
      </div>
    </div>
  );
}

// ⚡ Bolt Optimization: Custom comparison function to prevent re-renders when
// object reference changes but data remains the same (e.g. after refetch)
export default memo(LeadCard, (prev, next) => {
  // Always check function props first to prevent stale closures
  if (prev.onClick !== next.onClick || prev.onCall !== next.onCall) return false;

  // If IDs don't match, it's a different lead
  if (prev.lead.id !== next.lead.id) return false;

  // Use updatedAt if available for precise cache invalidation
  if (prev.lead.updatedAt && next.lead.updatedAt) {
    return prev.lead.updatedAt === next.lead.updatedAt;
  }

  // Fallback: Compare visible fields to avoid re-rendering on reference change
  return (
    prev.lead.name === next.lead.name &&
    prev.lead.score === next.lead.score &&
    prev.lead.company === next.lead.company &&
    prev.lead.role === next.lead.role &&
    prev.lead.location === next.lead.location &&
    prev.lead.email === next.lead.email &&
    prev.lead.linkedin === next.lead.linkedin
  );
});
