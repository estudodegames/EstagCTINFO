import React from 'react';
import { X, Cloud, CheckCircle2, Database, ShieldCheck } from 'lucide-react';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

interface ConnectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ConnectionSettingsModal: React.FC<ConnectionSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Banco em Nuvem Ativo (Multi-Dispositivos)</h3>
              <p className="text-xs text-slate-400">Sincronização em tempo real entre computadores e Netlify</p>
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
          <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Google Cloud Firestore
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sincronizado
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400">Projeto Firebase: </span>
                <strong className="font-mono text-indigo-300">{firebaseConfig.projectId}</strong>
              </div>
              <div>
                <span className="text-slate-400">Instância do Banco: </span>
                <strong className="font-mono text-emerald-300 break-all">{firebaseConfig.firestoreDatabaseId}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-emerald-800/40">
              Todos os cadastros, edições e presenças realizadas em qualquer computador conectado ao link do Netlify são gravados e sincronizados instantaneamente nesta base em nuvem compartilhada.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Sincronização Bidirecional Ativa
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Quando você cadastra ou altera um aluno no <strong>Computador A</strong>, o <strong>Computador B</strong> e o link do Netlify recebem a alteração em tempo real automaticamente.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
