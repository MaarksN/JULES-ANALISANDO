import { memo, useEffect, useState } from "react";
import type { Lead } from "@/types/sales";
import { X, Share2, Building, User, FileText, Phone, Copy, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onCall: (lead: Lead) => void;
}

function LeadModal({ lead, onClose, onCall }: LeadModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Fix: Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (lead) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lead, onClose]);

  const handleCrmSync = async () => {
    setIsSyncing(true);
    const promise = new Promise(resolve => setTimeout(resolve, 2000));

    toast.promise(promise, {
        loading: 'Enviando para HubSpot...',
        success: 'Lead sincronizado com sucesso!',
        error: 'Erro na conexão'
    });

    try {
      await promise;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyEmail = async () => {
    if (lead?.email) {
      try {
        await navigator.clipboard.writeText(lead.email);
        setCopiedEmail(true);
        toast.success("Email copiado!");
        setTimeout(() => setCopiedEmail(false), 2000);
      } catch {
        toast.error("Erro ao copiar email");
      }
    }
  };

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-6 dark:border-slate-800">
              <div>
                  <h2 id="modal-title" className="text-xl font-bold dark:text-white">Dossiê do Lead</h2>
                  <p className="text-sm text-slate-500">ID: {lead.id}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-slate-800"
                aria-label="Fechar detalhes do lead"
                autoFocus
              >
                  <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <div className="mb-2 flex items-center gap-2 text-indigo-600 font-bold uppercase text-xs">
                          <User size={14} /> Sobre
                      </div>
                      <p className="font-bold text-lg dark:text-white">{lead.name}</p>
                      <p className="text-slate-500">{lead.role}</p>
                      {lead.email && (
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-2 text-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 overflow-hidden">
                             <Mail size={14} className="shrink-0" />
                             <span className="truncate" title={lead.email}>{lead.email}</span>
                           </div>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6 shrink-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                             onClick={handleCopyEmail}
                             aria-label="Copiar email"
                             title="Copiar email"
                           >
                             {copiedEmail ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                           </Button>
                        </div>
                      )}
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <div className="mb-2 flex items-center gap-2 text-indigo-600 font-bold uppercase text-xs">
                          <Building size={14} /> Empresa
                      </div>
                      <p className="font-bold text-lg dark:text-white">{lead.company}</p>
                      <p className="text-slate-500">{lead.location}</p>
                  </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <h3 className="mb-2 flex items-center gap-2 font-bold dark:text-white"><FileText size={16} /> Motivo do Match (IA)</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {lead.fit_reason || "A IA identificou este lead como alta prioridade devido à expansão recente da empresa e compatibilidade com seu ICP definido no onboarding."}
                  </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t bg-slate-50 p-6 dark:bg-slate-900 dark:border-slate-800">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={() => onCall(lead)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Phone size={16} /> Ligar com IA
              </Button>
              <Button loading={isSyncing} onClick={handleCrmSync} className="gap-2 bg-[#ff5c35] hover:bg-[#ff4015] text-white">
                  {!isSyncing && <Share2 size={16} />} Enviar para HubSpot
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ⚡ Bolt Optimization: Memoize modal to prevent unnecessary re-renders when parent list updates
export default memo(LeadModal);
