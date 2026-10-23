import React, { useState } from 'react';
import { X, Printer, FileSpreadsheet, FileText, Calendar, Filter, Users, Building2, CheckCircle2 } from 'lucide-react';
import { EstagioRecord } from '../types.ts';

interface RelatoriosModalProps {
  isOpen: boolean;
  onClose: () => void;
  alunos: EstagioRecord[];
}

export const RelatoriosModal: React.FC<RelatoriosModalProps> = ({
  isOpen,
  onClose,
  alunos,
}) => {
  const [tab, setTab] = useState<'geral' | 'ativosMes'>('geral');
  const [mesAnoFiltro, setMesAnoFiltro] = useState(new Date().toISOString().substring(0, 7)); // Ex: "2026-10"

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Filtragem dos ativos no mês
  const estagiariosAtivos = alunos.filter((a) => {
    if (a.status !== 'Ativo') return false;
    // Se tiver data de início, verificar se iniciou até o mês selecionado
    if (a.dataInicio) {
      const inicioMes = a.dataInicio.substring(0, 7);
      return inicioMes <= mesAnoFiltro;
    }
    return true;
  });

  const [ano, mes] = mesAnoFiltro.split('-');
  const dataRef = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, 1);
  const nomeMesAno = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal (oculto na impressão) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Relatórios Oficiais de Estágio</h3>
              <p className="text-xs text-slate-400">Curso Técnico de Programação de Jogos Digitais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Abas dos Relatórios (oculta na impressão) */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTab('geral')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                tab === 'geral'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              1. Relatório Geral de Todos os Estagiários
            </button>

            <button
              onClick={() => setTab('ativosMes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                tab === 'ativosMes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              2. Relatório de Estagiários Ativos no Mês
            </button>
          </div>

          {tab === 'ativosMes' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Mês de Referência:</span>
              <input
                type="month"
                value={mesAnoFiltro}
                onChange={(e) => setMesAnoFiltro(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Área do Documento para Visualização e Impressão */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6 print:text-black">
          {/* Cabeçalho Oficial Timbrado para Impressão */}
          <div className="text-center pb-4 border-b-2 border-slate-700 print:border-black space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400 print:text-gray-700">
              SECRETARIA ACADÊMICA & COORDENAÇÃO DE ESTÁGIOS
            </p>
            <h1 className="text-lg sm:text-xl font-bold uppercase text-white print:text-black">
              CURSO TÉCNICO DE PROGRAMAÇÃO DE JOGOS DIGITAIS
            </h1>
            <h2 className="text-sm font-semibold text-slate-300 print:text-gray-800">
              {tab === 'geral'
                ? 'RELATÓRIO GERAL DE ESTAGIÁRIOS CADASTRADOS'
                : `RELATÓRIO DE ESTAGIÁRIOS ATIVOS — MÊS DE ${nomeMesAno.toUpperCase()}`}
            </h2>
          </div>

          {/* TAB 1: RELATÓRIO GERAL */}
          {tab === 'geral' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 print:text-gray-600">
                <span>Total de Alunos Registrados: <strong>{alunos.length}</strong></span>
                <span>Data de Emissão: {dataHoje}</span>
              </div>

              {alunos.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum registro de aluno cadastrado no momento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-700 bg-slate-800/60 print:bg-gray-100 print:border-black font-semibold text-slate-300 print:text-black">
                        <th className="py-2.5 px-3">Matrícula</th>
                        <th className="py-2.5 px-3">Nome do Aluno</th>
                        <th className="py-2.5 px-3">Turma</th>
                        <th className="py-2.5 px-3">Ano</th>
                        <th className="py-2.5 px-3">Sexo</th>
                        <th className="py-2.5 px-3">Local de Estágio</th>
                        <th className="py-2.5 px-3">Área de Atuação</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                      {alunos.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-indigo-300 print:text-black font-medium">
                            {a.matricula}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-white print:text-black">
                            {a.nome}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.turma || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.ano || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.sexo || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 print:text-black">
                            {a.localEstagio}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 print:text-gray-700">
                            {a.area || 'Desenvolvimento Geral'}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            <span className={a.status === 'Ativo' ? 'text-emerald-400 print:text-black' : a.status === 'Concluído' ? 'text-blue-400 print:text-black' : 'text-amber-400 print:text-black'}>
                              {a.status || 'Ativo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RELATÓRIO DE ATIVOS NO MÊS */}
          {tab === 'ativosMes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 print:text-gray-600">
                <span>
                  Estagiários com Estágio em Andamento em {nomeMesAno}:{' '}
                  <strong className="text-emerald-400 print:text-black">{estagiariosAtivos.length} ativos</strong>
                </span>
                <span>Data de Emissão: {dataHoje}</span>
              </div>

              {estagiariosAtivos.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum estagiário ativo encontrado para o mês de {nomeMesAno}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-700 bg-slate-800/60 print:bg-gray-100 print:border-black font-semibold text-slate-300 print:text-black">
                        <th className="py-2.5 px-3">Matrícula</th>
                        <th className="py-2.5 px-3">Estagiário</th>
                        <th className="py-2.5 px-3">Turma</th>
                        <th className="py-2.5 px-3">Ano</th>
                        <th className="py-2.5 px-3">Local de Estágio</th>
                        <th className="py-2.5 px-3">Carga Horária</th>
                        <th className="py-2.5 px-3">Início</th>
                        <th className="py-2.5 px-3">Supervisor no Estúdio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                      {estagiariosAtivos.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-indigo-300 print:text-black font-medium">
                            {a.matricula}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-white print:text-black">
                            {a.nome}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.turma || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.ano || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 print:text-black">
                            {a.localEstagio}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.cargaHoraria || '30h'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.dataInicio ? new Date(a.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 print:text-gray-700">
                            {a.supervisor || 'Não informado'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Campo de Assinatura para Impressão */}
          <div className="pt-10 pb-4 text-center text-xs text-slate-300 print:text-black">
            <div className="border-t border-slate-600 print:border-black w-2/5 mx-auto pt-2" />
            <p className="font-semibold text-white print:text-black">Coordenação de Estágios Supervisionados</p>
            <p className="text-[11px] text-slate-400 print:text-gray-600">Curso Técnico de Programação de Jogos Digitais</p>
          </div>
        </div>

        {/* Footer com botão de impressão */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/30 print:hidden">
          <div className="text-xs text-slate-400">
            Formato configurado para impressão direta ou exportação em PDF (A4).
          </div>
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
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
