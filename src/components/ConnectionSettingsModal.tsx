import React, { useState, useEffect } from 'react';
import { X, Globe, Save, CheckCircle2, RotateCcw, Server } from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl } from '../services/api.ts';

interface ConnectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ConnectionSettingsModal: React.FC<ConnectionSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiUrl(localStorage.getItem('estagios_custom_api_url') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomApiUrl(apiUrl.trim() || null);
    onSaved();
    onClose();
  };

  const handleResetDefault = () => {
    setCustomApiUrl(null);
    setApiUrl('');
    onSaved();
    onClose();
  };

  const currentActiveUrl = getApiBaseUrl();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sincronização em Nuvem (Netlify & Preview)</h3>
              <p className="text-xs text-slate-400">Configuração de sincronização de banco de dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Endpoint Ativo Atual:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conectado
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg font-mono text-[11px] text-indigo-300 break-all select-all border border-slate-800">
              {currentActiveUrl}
            </div>
            <p className="text-[11px] text-slate-400">
              Todas as inclusões, edições e exclusões realizadas no Netlify ou no Preview são salvas diretamente neste banco compartilhado.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Personalizada do Backend (Opcional):
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://seu-backend.run.app"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Deixe em branco para usar a sincronização automática padrão na nuvem.
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar padrão
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
