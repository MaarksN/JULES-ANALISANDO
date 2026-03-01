import React, { useState } from 'react';
import { Icons } from './constants';
import { fetchCNPJData, isValidCNPJLength, CNPJApiResponse } from './cnpjService';

type ValidationResult =
  | { status: 'success'; data: CNPJApiResponse }
  | { status: 'error'; message: string };

const CNPJValidator: React.FC = () => {
  const [cnpj, setCnpj] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await fetchCNPJData(cnpj);
      setResult({ status: 'success', data });
    } catch (error: any) {
      setResult({ status: 'error', message: error.message || 'Não foi possível validar o CNPJ.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <Icons.Check /> Validação de CNPJ (#14)
      </h2>
      <p className="text-sm text-slate-500 mb-6">Valide a existência legal da empresa antes de prospectar.</p>

      <form onSubmit={handleValidate} className="flex gap-2">
        <input
          type="text"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={e => setCnpj(e.target.value)}
          className="flex-1 rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white px-3 py-2 border focus:ring-2 focus:ring-primary-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !isValidCNPJLength(cnpj)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          {result.status === 'success' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
                <Icons.Check /> CNPJ Ativo
              </div>
              <div className="text-sm dark:text-slate-300">
                <p><span className="font-semibold">Razão Social:</span> {result.data.razao_social}</p>
                <p><span className="font-semibold">Atividade:</span> {result.data.cnae_fiscal_principal || 'Não informado'}</p>
                <p><span className="font-semibold">CNAE:</span> {result.data.cnae_fiscal_principal_code || 'Não informado'}</p>
                <p><span className="font-semibold">Situação:</span> {result.data.situacao_cadastral}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
              <Icons.X /> {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CNPJValidator;
