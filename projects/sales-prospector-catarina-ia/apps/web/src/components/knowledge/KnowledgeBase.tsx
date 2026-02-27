import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const KnowledgeBase = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/knowledge/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      toast.success('Documento indexado com sucesso!');
      setTitle('');
      setContent('');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao indexar documento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-4">Base de Conhecimento (RAG)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="kb-title" className="block text-sm font-medium mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="kb-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Ex: Política de Preços 2024"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="kb-content" className="block text-sm font-medium mb-1">
            Conteúdo <span className="text-red-500">*</span>
          </label>
          <textarea
            id="kb-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded-md h-32 outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Cole o texto aqui..."
            disabled={loading}
            required
          />
          <div className="text-xs text-slate-400 text-right mt-1">
            {content.length} {content.length === 1 ? 'caractere' : 'caracteres'}
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Indexando...
            </>
          ) : (
            'Adicionar à Memória'
          )}
        </Button>
      </form>
    </div>
  );
};
