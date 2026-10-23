import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { EstagioRecord } from '../types.ts';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  record: EstagioRecord | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  isDeleting,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            Confirmar Exclusão de Estágio
          </h3>

          <p className="text-sm text-slate-300 mb-4">
            Tem certeza que deseja excluir permanentemente o cadastro de estágio do aluno abaixo?
          </p>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 mb-6 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Aluno:</span>
              <span className="font-semibold text-white">{record.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Matrícula:</span>
              <span className="font-mono text-indigo-300 font-medium">{record.matricula}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Local de Estágio:</span>
              <span className="text-slate-200">{record.localEstagio}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
