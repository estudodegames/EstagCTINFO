import React from 'react';
import { X, Building2, User, Hash, Briefcase, Calendar, Clock, UserCheck, Printer, FileText } from 'lucide-react';
import { EstagioRecord } from '../types.ts';

interface EstagioDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EstagioRecord | null;
  onEdit: (record: EstagioRecord) => void;
}

export const EstagioDetailsModal: React.FC<EstagioDetailsModalProps> = ({
  isOpen,
  onClose,
  record,
  onEdit,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ficha Cadastral do Estágio
              </h2>
              <p className="text-xs text-slate-400">
                Curso Técnico de Programação de Jogos Digitais
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Banner with Student Name & Status */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {record.matricula}
                </span>
                <span className="text-xs text-slate-400">Matrícula do Aluno</span>
              </div>
              <h3 className="text-lg font-bold text-white">{record.nome}</h3>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'Ativo'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : record.status === 'Concluído'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                ● {record.status || 'Ativo'}
              </span>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Local do Estágio
              </span>
              <p className="text-sm font-semibold text-white">{record.localEstagio}</p>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                Área / Especialidade
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {record.area || 'Desenvolvimento Geral de Jogos'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Carga Horária
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {record.cargaHoraria || 'Não especificada'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Data de Início
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {record.dataInicio
                  ? new Date(record.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')
                  : 'Não informada'}
              </p>
            </div>
          </div>

          {/* Supervisor */}
          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Supervisor / Responsável no Estúdio
            </span>
            <p className="text-sm font-medium text-slate-200">
              {record.supervisor || 'Nenhum supervisor cadastrado.'}
            </p>
          </div>

          {/* Observações */}
          {record.observacoes && (
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">
                Atividades / Observações Técnicas:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {record.observacoes}
              </p>
            </div>
          )}

          {/* Metadados de Auditoria */}
          <div className="flex flex-wrap justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Cadastrado em: {new Date(record.criadoEm).toLocaleString('pt-BR')}</span>
            <span>Última atualização: {new Date(record.atualizadoEm).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/30">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Imprimir Ficha</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
            >
              Editar Informações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
