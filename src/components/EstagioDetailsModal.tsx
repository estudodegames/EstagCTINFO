import React from 'react';
import { X, Building2, User, Hash, Calendar, UserCheck, Printer, FileText, GraduationCap, Mail } from 'lucide-react';
import { EstagioRecord, CURSOS_INFO, getNomeCompletoCurso } from '../types.ts';

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

  const cursoNomeCompleto = getNomeCompletoCurso(record.curso);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:bg-white print:text-black print:border-none print:shadow-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40 print:border-b-2 print:border-gray-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white print:text-black">
                Ficha Cadastral do Estagiário
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                {cursoNomeCompleto}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Top Banner with Student Name & Status */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-gray-100 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 print:text-black print:border-gray-400">
                  {record.matricula}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 print:border-gray-400 print:text-black">
                  {record.curso || 'Jogos'}
                </span>
                {record.turma && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-200 print:bg-gray-200 print:text-black">
                    Turma: {record.turma}
                  </span>
                )}
                {record.ano && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-200 print:bg-gray-200 print:text-black">
                    Ano: {record.ano}
                  </span>
                )}
                {record.sexo && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-200 print:bg-gray-200 print:text-black">
                    Sexo: {record.sexo}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white print:text-black">{record.nome}</h3>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'Ativo'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : record.status === 'Concluído'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                } print:border print:text-black`}
              >
                ● {record.status || 'Ativo'}
              </span>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Curso Técnico
              </span>
              <p className="text-sm font-semibold text-white print:text-black">{cursoNomeCompleto}</p>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Local do Estágio
              </span>
              <p className="text-sm font-semibold text-white print:text-black">{record.localEstagio}</p>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                E-mail do Aluno
              </span>
              <p className="text-sm font-medium text-slate-200 print:text-black truncate">
                {record.email ? (
                  <span className="text-indigo-300 print:text-black font-mono">{record.email}</span>
                ) : (
                  <span className="text-slate-400 italic">Não informado</span>
                )}
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50 sm:col-span-2">
              <span className="text-xs text-slate-400 print:text-gray-600 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Supervisor na Empresa / Instituição
              </span>
              <p className="text-sm font-medium text-slate-200 print:text-black">
                {record.supervisor || 'Nenhum supervisor cadastrado.'}
              </p>
            </div>
          </div>

          {/* Observações */}
          {record.observacoes && (
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 block mb-1">
                Observações Técnicas:
              </span>
              <p className="text-xs text-slate-300 print:text-black leading-relaxed whitespace-pre-wrap">
                {record.observacoes}
              </p>
            </div>
          )}

          {/* Metadados de Auditoria */}
          <div className="flex flex-wrap justify-between text-[11px] text-slate-400 print:text-gray-500 pt-2 border-t border-slate-800 print:border-gray-300">
            <span>Cadastrado em: {new Date(record.criadoEm).toLocaleString('pt-BR')}</span>
            <span>Última atualização: {new Date(record.atualizadoEm).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/30 print:hidden">
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
