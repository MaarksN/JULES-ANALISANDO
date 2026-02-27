import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { UserProfile } from '../types';
import { isValidOAB } from '../utils/helpers';
import AnimatedButton from './AnimatedButton';
import { useAuth } from '../contexts/AuthContext';
import { wipeClientData } from '../services/compliance';
import AuditLogViewer from './AuditLogViewer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentProfile, onSave }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'memory' | 'variables' | 'ai' | 'integrations' | 'security'>('profile');
  const [formData, setFormData] = useState<UserProfile>(currentProfile);
  const [oabError, setOabError] = useState<string | null>(null);

  // Local state for integrations
  const [dataJudKey, setDataJudKey] = useState('');
  const [certPath, setCertPath] = useState('');

  // Local state for variable management
  const [globalVars, setGlobalVars] = useState<Record<string, string>>(currentProfile.globalVariables || {});
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  // Security State
  const [wiping, setWiping] = useState(false);
  const [wipeLog, setWipeLog] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setFormData(currentProfile);
        setGlobalVars(currentProfile.globalVariables || {});
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleAddVar = () => {
      if (newVarKey && newVarValue) {
          const key = newVarKey.toUpperCase().replace(/\s+/g, '_');
          const updated = { ...globalVars, [key]: newVarValue };
          setGlobalVars(updated);
          setFormData({ ...formData, globalVariables: updated });
          setNewVarKey('');
          setNewVarValue('');
      }
  };

  const handleRemoveVar = (key: string) => {
      const updated = { ...globalVars };
      delete updated[key];
      setGlobalVars(updated);
      setFormData({ ...formData, globalVariables: updated });
  };

  const validateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.oab && !isValidOAB(formData.oab)) {
        setOabError("Formato inválido. Use 123456/UF (ex: 123456/SP)");
        setActiveTab('profile');
        return;
    }
    setOabError(null);
    onSave({ ...formData, globalVariables: globalVars });
    onClose();
  };

  const handlePanicButton = async () => {
      if (!user) return;
      if (!window.confirm("ATENÇÃO: Isso excluirá PERMANENTEMENTE todos os seus dados, casos e templates do servidor. Esta ação não pode ser desfeita. Tem certeza absoluta?")) {
          return;
      }

      setWiping(true);
      try {
          const cert = await wipeClientData(user.uid, 'ALL');
          setWipeLog(cert);
      } catch (e: any) {
          alert("Falha no procedimento: " + e.message);
      } finally {
          setWiping(false);
      }
  };

  const tabs = ['profile', 'preferences', 'memory', 'variables', 'ai', 'integrations', 'security', 'audit'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md h-[650px] flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center">
            <Icons.Settings className="w-5 h-5 mr-2 text-emerald-600" /> Configurações
          </h3>
          <button onClick={onClose}><Icons.X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
           {tabs.map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 px-2 text-sm font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                  {tab === 'integrations' ? 'Integrações' : tab === 'variables' ? 'Variáveis' : tab === 'profile' ? 'Perfil' : tab === 'preferences' ? 'Prefs' : tab === 'ai' ? 'IA' : tab === 'security' ? 'Segurança' : tab === 'audit' ? 'Auditoria' : 'Memória'}
               </button>
           ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          {activeTab === 'profile' && (
             <form className="space-y-4" onSubmit={validateAndSave}>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                 <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" required />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número da OAB</label>
                 <input
                    type="text"
                    value={formData.oab}
                    onChange={(e) => { setFormData({ ...formData, oab: e.target.value }); setOabError(null); }}
                    placeholder="123456/SP"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 outline-none ${oabError ? 'border-red-500 ring-red-200 focus:ring-red-500' : 'dark:border-slate-700 focus:ring-emerald-500'}`}
                 />
                 {oabError && <p className="text-red-500 text-xs mt-1 flex items-center"><Icons.AlertCircle className="w-3 h-3 mr-1"/> {oabError}</p>}
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Escritório</label>
                 <input type="text" value={formData.firmName || ''} onChange={(e) => setFormData({ ...formData, firmName: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
               </div>
             </form>
          )}

          {activeTab === 'preferences' && (
              <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fonte Padrão dos Documentos</label>
                      <div className="grid grid-cols-2 gap-3">
                          {['Times New Roman', 'Arial', 'Garamond', 'Courier New'].map((font) => (
                              <button
                                key={font}
                                onClick={() => setFormData(prev => ({...prev, preferences: {...prev.preferences!, fontFamily: font as any}}))}
                                className={`p-3 border rounded-lg text-xs transition-all flex items-center justify-center ${formData.preferences?.fontFamily === font ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                style={{ fontFamily: font }}
                              >
                                  {font}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tamanho da Fonte: {formData.preferences?.fontSize}pt</label>
                      <input type="range" min="10" max="14" step="0.5" value={formData.preferences?.fontSize || 12} onChange={(e) => setFormData(prev => ({...prev, preferences: {...prev.preferences!, fontSize: parseFloat(e.target.value)}}))} className="w-full accent-emerald-500" />
                  </div>
              </div>
          )}

          {activeTab === 'memory' && (
             <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-sm text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                    <h4 className="font-bold flex items-center mb-1"><Icons.BrainCircuit className="w-4 h-4 mr-2"/> Contexto Global</h4>
                    Defina o "tom de voz" do escritório e regras que a IA deve sempre seguir em todos os chats.
                </div>
                <textarea className="w-full h-48 border rounded-lg p-3 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Ex: Sempre use linguagem formal e culta. Nosso escritório fica em SP, use o foro da capital. Nunca aceite acordos abaixo de R$ 5.000,00." value={formData.officeContext || ''} onChange={(e) => setFormData({ ...formData, officeContext: e.target.value })} />
             </div>
          )}

          {activeTab === 'variables' && (
             <div className="space-y-4">
                 <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                     Defina variáveis padrão que a IA pode autocompletar em seus documentos (Ex: <code>{`{{CIDADE}}`}</code>, <code>{`{{JUIZ}}`}</code>).
                 </div>

                 <div className="flex space-x-2">
                     <input
                        type="text"
                        placeholder="Nome (Ex: CIDADE)"
                        value={newVarKey}
                        onChange={e => setNewVarKey(e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white uppercase"
                     />
                     <input
                        type="text"
                        placeholder="Valor (Ex: São Paulo)"
                        value={newVarValue}
                        onChange={e => setNewVarValue(e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                     />
                     <button onClick={handleAddVar} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"><Icons.Plus className="w-4 h-4"/></button>
                 </div>

                 <div className="space-y-2 max-h-48 overflow-y-auto">
                     {Object.entries(globalVars).length === 0 && <p className="text-center text-xs text-slate-400 py-4">Nenhuma variável definida.</p>}
                     {Object.entries(globalVars).map(([key, val]) => (
                         <div key={key} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                             <div>
                                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-1 rounded mr-2">{key}</span>
                                 <span className="text-xs text-slate-600 dark:text-slate-400">{val}</span>
                             </div>
                             <button onClick={() => handleRemoveVar(key)} className="text-slate-400 hover:text-red-500"><Icons.Trash2 className="w-3 h-3"/></button>
                         </div>
                     ))}
                 </div>
             </div>
          )}

          {activeTab === 'ai' && (
              <div className="space-y-6">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center"><Icons.Cpu className="w-4 h-4 mr-2"/> Modelo de Inteligência</h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400">Escolha o cérebro por trás das respostas.</p>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                          <button
                             onClick={() => setFormData(prev => ({...prev, preferences: {...prev.preferences!, aiModel: 'flash'}}))}
                             className={`p-3 rounded-lg border text-left transition-all ${formData.preferences?.aiModel !== 'pro' ? 'border-indigo-500 bg-white shadow-md ring-1 ring-indigo-500 dark:bg-indigo-900/40' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                          >
                              <div className="font-bold text-sm mb-1 flex items-center justify-between">Gemini Flash <Icons.Zap className="w-3 h-3 text-yellow-500"/></div>
                              <div className="text-[10px] leading-tight opacity-80">Rápido e eficiente. Ideal para dúvidas simples e rascunhos.</div>
                          </button>

                          <button
                             onClick={() => setFormData(prev => ({...prev, preferences: {...prev.preferences!, aiModel: 'pro'}}))}
                             className={`p-3 rounded-lg border text-left transition-all ${formData.preferences?.aiModel === 'pro' ? 'border-purple-500 bg-white shadow-md ring-1 ring-purple-500 dark:bg-purple-900/40' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                          >
                              <div className="font-bold text-sm mb-1 flex items-center justify-between">Gemini Pro <Icons.Star className="w-3 h-3 text-purple-500"/></div>
                              <div className="text-[10px] leading-tight opacity-80">Raciocínio complexo. Ideal para teses e contratos.</div>
                          </button>
                      </div>
                  </div>

                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                              <Icons.Thermometer className="w-4 h-4 mr-2"/> Criatividade (Temperatura)
                          </label>
                          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              {formData.preferences?.temperature ?? 0.4}
                          </span>
                      </div>
                      <input
                         type="range"
                         min="0"
                         max="1"
                         step="0.1"
                         value={formData.preferences?.temperature ?? 0.4}
                         onChange={(e) => setFormData(prev => ({...prev, preferences: {...prev.preferences!, temperature: parseFloat(e.target.value)}}))}
                         className="w-full accent-emerald-500"
                      />
                  </div>
              </div>
          )}

          {activeTab === 'integrations' && (
              <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center"><Icons.Link className="w-4 h-4 mr-2"/> Tribunais & Governo</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Configure as chaves de acesso para automação.</p>

                      <div className="mt-4 space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key DataJud (CNJ)</label>
                              <input
                                type="password"
                                value={dataJudKey}
                                onChange={(e) => setDataJudKey(e.target.value)}
                                className="w-full p-2 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-700 outline-none"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                      <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center"><Icons.Feather className="w-4 h-4 mr-2"/> Clonagem de Estilo (Upload)</h4>
                      <p className="text-xs text-purple-700 dark:text-purple-400">Faça upload de uma petição modelo para a IA aprender seu estilo.</p>

                      <div className="mt-4">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, { method: 'POST', body: formData });
                                        if (res.ok) {
                                            const data = await res.json();
                                            setFormData(prev => ({ ...prev, preferences: { ...prev.preferences!, styleSample: data.text } }));
                                            alert("Estilo clonado com sucesso!");
                                        }
                                    } catch (err) {
                                        alert("Erro no upload.");
                                    }
                                }
                            }}
                            className="text-xs"
                          />
                          {formData.preferences?.styleSample && <p className="text-[10px] text-green-600 mt-2">✓ Modelo carregado.</p>}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'security' && (
              <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icons.AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h4 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Zona de Perigo (Item 51)</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-6">
                          O "Botão de Pânico" realiza a exclusão definitiva e imediata de todos os dados armazenados em nuvem (Sessões, Dossiês, Templates). Use apenas em emergências ou conformidade com LGPD/Direito ao Esquecimento.
                      </p>

                      {!wipeLog ? (
                          <button
                            onClick={handlePanicButton}
                            disabled={wiping}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-red-500/30 transition-all ${wiping ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-[1.02]'}`}
                          >
                              {wiping ? "PROCESSANDO WIPE..." : "APAGAR TUDO AGORA (DATA WIPE)"}
                          </button>
                      ) : (
                          <div className="mt-4 text-left bg-slate-950 p-4 rounded-lg border border-slate-800">
                              <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap">
                                  {wipeLog}
                              </pre>
                              <p className="text-xs text-slate-400 mt-2 text-center">Tire um print desta tela como comprovante.</p>
                          </div>
                      )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <h5 className="text-sm font-bold flex items-center mb-2"><Icons.Shield className="w-4 h-4 mr-2"/> Status da Criptografia</h5>
                      <p className="text-xs text-slate-500">
                          Seus dados estão protegidos por criptografia de ponta a ponta (AES-256) usando chaves derivadas de sua senha local (Zero-Knowledge). Nem os desenvolvedores podem ler seus casos.
                      </p>
                  </div>
              </div>
          )}

          {activeTab === 'audit' && (
              <AuditLogViewer userId={user?.uid} />
          )}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900 rounded-b-xl">
            <AnimatedButton onClick={validateAndSave} variant="primary" label="Salvar Alterações" className="px-6 py-2" />
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;
