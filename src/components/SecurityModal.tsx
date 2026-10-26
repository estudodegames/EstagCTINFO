import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Key,
  History,
  Eye,
  EyeOff,
  Save,
  UserCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { authService, SecurityPolicies, AccessLogEntry } from '../services/authService.ts';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'key' | 'identificacao' | 'logs'>('key');
  const [policies, setPolicies] = useState<SecurityPolicies | null>(null);
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getPolicies();
      setPolicies(data);
      setNewKey(data.accessKey);
      setLogs(authService.getAccessLogs());
    } catch {
      onToast('error', 'Falha ao carregar políticas de segurança.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Salvar nova chave de acesso da equipe
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newKey.trim();
    if (!clean || clean.length < 6) {
      onToast('error', 'A chave de acesso deve possuir pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const updated = await authService.savePolicies({ accessKey: clean });
      setPolicies(updated);
      onToast('success', 'Chave de Acesso da Orientação atualizada com sucesso em todos os computadores!');
    } catch {
      onToast('error', 'Erro ao atualizar chave de acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar logs
  const handleClearLogs = () => {
    authService.clearAccessLogs();
    setLogs([]);
    onToast('info', 'Histórico de acessos limpo com sucesso.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Políticas de Segurança e Controle de Acesso
              </h2>
              <p className="text-xs text-slate-400">
                Gerenciamento de credenciais e auditoria de acesso à Orientação de Estágio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('key')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'key'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Chave de Acesso</span>
          </button>

          <button
            onClick={() => setActiveTab('identificacao')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'identificacao'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Identificação Autorizada</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Registro de Acessos ({logs.length})</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {/* ABA 1: CHAVE DE ACESSO */}
          {activeTab === 'key' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Chave de Acesso da Orientação
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A chave é necessária para desbloquear o sistema em qualquer computador ou dispositivo.
                  Ao atualizar a chave aqui, a alteração é sincronizada automaticamente em tempo real no banco de dados.
                </p>
              </div>

              <form onSubmit={handleSaveKey} className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Chave de Acesso Atual / Nova Chave:
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Defina a chave de acesso..."
                      required
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    A chave deve possuir no mínimo 6 caracteres.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || newKey === policies?.accessKey}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Nova Chave de Acesso</span>
                </button>
              </form>
            </div>
          )}

          {/* ABA 2: IDENTIFICAÇÃO AUTORIZADA */}
          {activeTab === 'identificacao' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Identificação do Orientador Exigida
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para segurança adicional, além da Chave de Acesso, o sistema exige obrigatoriamente a identificação com a sigla autorizada do orientador responsável.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Sigla Obrigatória Autorizada:</span>
                  <span className="text-sm font-bold font-mono px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg tracking-wider">
                    ACVR
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Orientação Responsável:</span>
                  <span className="text-xs font-semibold text-white">
                    Andrea Vargas (Orientação de Estágio)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Cursos Vinculados:</span>
                  <span className="text-xs text-slate-300">
                    Jogos Digitais • Informática • Redes
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  Qualquer tentativa de login com outra identificação ou sigla incorreta é automaticamente bloqueada e registrada na aba de auditoria.
                </span>
              </div>
            </div>
          )}

          {/* ABA 3: AUDITORIA / LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  Últimos acessos registrados:
                </span>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="text-xs text-slate-400 hover:text-white hover:underline"
                  >
                    Limpar Registro
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-slate-800 rounded-2xl bg-slate-950/40">
                  Nenhum registro de acesso registrado recentemente.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40 max-h-72 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${log.sucesso ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                          <span className="font-semibold text-white">{log.nome}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({log.identificador})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Método: {log.metodo}</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                          {log.motivo && <span className="text-rose-400">({log.motivo})</span>}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.sucesso
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.sucesso ? 'Autorizado' : 'Bloqueado'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-850/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
