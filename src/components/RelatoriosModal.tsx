import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  FileSpreadsheet,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Award,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { EstagioRecord, ReuniaoMensal, getNomeCompletoCurso, TipoCurso } from '../types.ts';
import {
  generateRelatorioFrequenciaPDF,
  generateRelatorioGeralPDF,
  generateRelatorioAtivosPDF,
} from '../utils/pdfGenerator.ts';
import { printElementDirectly } from '../utils/printAndPdf.ts';

interface RelatoriosModalProps {
  isOpen: boolean;
  onClose: () => void;
  alunos: EstagioRecord[];
  reunioes: ReuniaoMensal[];
}

export const RelatoriosModal: React.FC<RelatoriosModalProps> = ({
  isOpen,
  onClose,
  alunos,
  reunioes,
}) => {
  const [tab, setTab] = useState<'frequencia' | 'geral' | 'ativosMes'>('frequencia');
  const [mesAnoFiltro, setMesAnoFiltro] = useState(new Date().toISOString().substring(0, 7)); // Ex: "2026-10"
  const [cursoFiltro, setCursoFiltro] = useState<string>('Todos');
  const [dataEmissao, setDataEmissao] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const [anoStr, mesStr] = mesAnoFiltro.split('-');
  const dataRef = new Date(parseInt(anoStr, 10), parseInt(mesStr, 10) - 1, 1);
  const nomeMesAno = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Formata data de emissão escolhida
  const formatarDataExtenso = (isoDate: string) => {
    if (!isoDate) return '';
    const [ano, mes, dia] = isoDate.split('-');
    const d = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10));
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const dataEmissaoFormatada = formatarDataExtenso(dataEmissao);

  // Reunião correspondente ao mês selecionado
  const reuniaoDoMes = reunioes.find((r) => r.mesAno === mesAnoFiltro) || null;
  const presencasMap = reuniaoDoMes?.presencas || {};

  // Filtra alunos pelo curso selecionado (se aplicável) e ordena em ordem alfabética pelo nome
  const alunosFiltrados = alunos
    .filter((a) => {
      if (cursoFiltro === 'Todos') return true;
      return a.curso === cursoFiltro;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

  // Estatísticas de Frequência do Mês
  let countPresentes = 0;
  let countFaltas = 0;
  let countNaoRegistrado = 0;

  alunosFiltrados.forEach((a) => {
    const status = presencasMap[a.id]?.status;
    if (status === 'Presença') countPresentes++;
    else if (status === 'Falta') countFaltas++;
    else countNaoRegistrado++;
  });

  const totalAvaliados = countPresentes + countFaltas;
  const taxaPresenca = totalAvaliados > 0 ? Math.round((countPresentes / totalAvaliados) * 100) : 0;

  // Filtragem dos ativos no mês
  const estagiariosAtivos = alunosFiltrados.filter((a) => a.status === 'Ativo');

  // Título do relatório para impressão direta
  const getReportTitle = () => {
    if (tab === 'frequencia') {
      return `Relatório de Frequência Mensal - ${nomeMesAno}`;
    }
    if (tab === 'geral') {
      return 'Relatório Geral de Estagiários Cadastrados';
    }
    return `Relatório de Estagiários Ativos - ${nomeMesAno}`;
  };

  // 1. Gerar e baixar PDF do relatório selecionado (jsPDF + autoTable)
  const handleGerarPDF = () => {
    try {
      setIsGeneratingPdf(true);
      setFeedbackMsg(null);

      if (tab === 'frequencia') {
        generateRelatorioFrequenciaPDF({
          alunos: alunosFiltrados,
          reuniao: reuniaoDoMes,
          mesAnoFiltro,
          nomeMesAno,
          cursoFiltro,
          dataEmissaoFormatada,
          metricas: {
            total: alunosFiltrados.length,
            presentes: countPresentes,
            faltas: countFaltas,
            assiduidade: taxaPresenca,
          },
        });
      } else if (tab === 'geral') {
        generateRelatorioGeralPDF({
          alunos: alunosFiltrados,
          cursoFiltro,
          dataEmissaoFormatada,
        });
      } else {
        generateRelatorioAtivosPDF({
          alunos: estagiariosAtivos,
          cursoFiltro,
          mesAnoFiltro,
          nomeMesAno,
          dataEmissaoFormatada,
        });
      }

      setFeedbackMsg({
        type: 'success',
        text: `Relatório em PDF gerado com sucesso! O arquivo foi baixado.`,
      });
    } catch (err: any) {
      console.error('Erro ao gerar PDF do relatório:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'Não foi possível gerar o arquivo PDF. Você pode clicar no botão "Enviar para Impressora".',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Enviar diretamente para a impressora
  const handleImprimir = () => {
    printElementDirectly('documento-relatorio-oficial', getReportTitle(), { orientation: 'landscape' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none"
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
              <h3 className="text-base font-bold text-white">Relatórios de Estágio Supervisionado</h3>
              <p className="text-xs text-slate-400">Cursos Técnicos de Jogos Digitais, Informática e Redes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Abas e Filtros (oculta na impressão) */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => {
                setTab('frequencia');
                setFeedbackMsg(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                tab === 'frequencia'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              1. Frequência Mensal (Envio à Gerência)
            </button>

            <button
              onClick={() => {
                setTab('geral');
                setFeedbackMsg(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                tab === 'geral'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              2. Todos os Estagiários Cadastrados
            </button>

            <button
              onClick={() => {
                setTab('ativosMes');
                setFeedbackMsg(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                tab === 'ativosMes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              3. Estagiários Ativos no Mês
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filtro de Curso */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Curso:</span>
              <select
                value={cursoFiltro}
                onChange={(e) => setCursoFiltro(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Todos">Todos os Cursos</option>
                <option value="Jogos">Jogos Digitais</option>
                <option value="Informática">Informática</option>
                <option value="Redes">Redes</option>
              </select>
            </div>

            {/* Filtro de Mês */}
            {(tab === 'frequencia' || tab === 'ativosMes') && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Mês da Reunião:</span>
                <input
                  type="month"
                  value={mesAnoFiltro}
                  onChange={(e) => setMesAnoFiltro(e.target.value)}
                  className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Data de Emissão do Documento */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Data de Emissão:</span>
              <input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback de Operação */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {feedbackMsg.text}
            </span>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="hover:underline text-[11px] font-semibold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Área do Documento para Visualização, PDF e Impressão */}
        <div
          id="documento-relatorio-oficial"
          className="p-6 sm:p-8 space-y-6 max-h-[66vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6 print:text-black bg-slate-900 print:bg-white"
        >
          {/* Cabeçalho Oficial Timbrado */}
          <div className="text-center pb-4 border-b-2 border-slate-700 print:border-black space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400 print:text-gray-700">
              {tab === 'frequencia'
                ? 'ESCOLA TÉCNICA ESTADUAL REPÚBLICA - ETER'
                : 'ORIENTAÇÃO DE ESTÁGIO SUPERVISIONADO • CURSOS TÉCNICOS'}
            </p>
            <h1 className="text-base sm:text-lg font-bold uppercase text-white print:text-black">
              {cursoFiltro === 'Todos'
                ? 'CURSOS TÉCNICOS: JOGOS DIGITAIS • INFORMÁTICA • REDES'
                : getNomeCompletoCurso(cursoFiltro).toUpperCase()}
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-300 print:text-gray-800">
              {tab === 'frequencia'
                ? `RELATÓRIO MENSAL DE FREQUÊNCIA À REUNIÃO DE ACOMPANHAMENTO — MÊS DE ${nomeMesAno.toUpperCase()}`
                : tab === 'geral'
                ? 'RELATÓRIO GERAL DE ESTAGIÁRIOS CADASTRADOS'
                : `RELATÓRIO DE ESTAGIÁRIOS ATIVOS — MÊS DE ${nomeMesAno.toUpperCase()}`}
            </h2>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: RELATÓRIO DE FREQUÊNCIA MENSAL (ENVIO À GERÊNCIA)        */}
          {/* ============================================================== */}
          {tab === 'frequencia' && (
            <div className="space-y-4">
              {/* Tabela de Frequência de Todos os Estagiários */}
              {alunosFiltrados.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum estagiário cadastrado para o filtro selecionado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-700 bg-slate-800/60 print:bg-gray-100 print:border-black font-semibold text-slate-300 print:text-black">
                        <th className="py-2.5 px-3">Matrícula</th>
                        <th className="py-2.5 px-3">Nome do Aluno</th>
                        <th className="py-2.5 px-3">Curso</th>
                        <th className="py-2.5 px-3">Turma / Ano</th>
                        <th className="py-2.5 px-3">Local de Estágio</th>
                        <th className="py-2.5 px-3 text-center">Frequência no Mês</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                      {alunosFiltrados.map((a) => {
                        const freq = presencasMap[a.id];
                        const isPresente = freq?.status === 'Presença';
                        const isFalta = freq?.status === 'Falta';

                        return (
                          <tr key={a.id} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-mono text-indigo-300 print:text-black font-medium whitespace-nowrap">
                              {a.matricula}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-white print:text-black">
                              {a.nome}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 print:text-black whitespace-nowrap">
                              {a.curso || 'Jogos'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 print:text-black whitespace-nowrap">
                              {a.turma || '-'} {a.ano ? `(${a.ano})` : ''}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200 print:text-black">
                              {a.localEstagio}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {isPresente && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black print:border print:border-gray-500">
                                  PRESENÇA
                                </span>
                              )}
                              {isFalta && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 print:bg-transparent print:text-black print:border print:border-gray-500">
                                  FALTA
                                </span>
                              )}
                              {!isPresente && !isFalta && (
                                <span className="text-slate-500 print:text-gray-500 text-[11px]">
                                  Pendente
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: RELATÓRIO GERAL DE TODOS OS ESTAGIÁRIOS                 */}
          {/* ============================================================== */}
          {tab === 'geral' && (
            <div className="space-y-4">
              {alunosFiltrados.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum estagiário cadastrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-700 bg-slate-800/60 print:bg-gray-100 print:border-black font-semibold text-slate-300 print:text-black">
                        <th className="py-2.5 px-3">Matrícula</th>
                        <th className="py-2.5 px-3">Nome do Aluno</th>
                        <th className="py-2.5 px-3">Curso</th>
                        <th className="py-2.5 px-3">Turma</th>
                        <th className="py-2.5 px-3">Ano</th>
                        <th className="py-2.5 px-3">Sexo</th>
                        <th className="py-2.5 px-3">Local de Estágio</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                      {alunosFiltrados.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-indigo-300 print:text-black font-medium">
                            {a.matricula}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-white print:text-black">
                            {a.nome}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-black">
                            {a.curso || 'Jogos'}
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
                          <td className="py-2.5 px-3 font-medium">
                            <span
                              className={
                                a.status === 'Ativo'
                                  ? 'text-emerald-400 print:text-black'
                                  : a.status === 'Concluído'
                                  ? 'text-blue-400 print:text-black'
                                  : 'text-amber-400 print:text-black'
                              }
                            >
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

          {/* ============================================================== */}
          {/* TAB 3: RELATÓRIO DE ESTAGIÁRIOS ATIVOS NO MÊS                   */}
          {/* ============================================================== */}
          {tab === 'ativosMes' && (
            <div className="space-y-4">
              {estagiariosAtivos.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum estagiário com status Ativo encontrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-700 bg-slate-800/60 print:bg-gray-100 print:border-black font-semibold text-slate-300 print:text-black">
                        <th className="py-2.5 px-3">Matrícula</th>
                        <th className="py-2.5 px-3">Nome do Estagiário</th>
                        <th className="py-2.5 px-3">Curso</th>
                        <th className="py-2.5 px-3">Turma</th>
                        <th className="py-2.5 px-3">Ano</th>
                        <th className="py-2.5 px-3">Local de Estágio</th>
                        <th className="py-2.5 px-3">Supervisor na Empresa</th>
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
                            {a.curso || 'Jogos'}
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

          {/* Bloco de Emissão e Assinatura com proteção contra quebra de página */}
          <div className="bloco-assinatura print:break-inside-avoid space-y-4 pt-6 pb-4">
            {dataEmissaoFormatada && (
              <div className="text-right text-xs text-slate-300 print:text-black font-medium pr-2">
                Emitido em {dataEmissaoFormatada}.
              </div>
            )}

            {/* Campo de Assinatura: Andrea Vargas -> Orientação de Estágio + Curso */}
            <div className="text-center text-xs text-slate-300 print:text-black">
              <div className="max-w-md mx-auto space-y-1">
                <div className="border-t border-slate-600 print:border-black w-72 mx-auto pt-2" />
                <p className="font-bold text-base text-white print:text-black tracking-wide">
                  Andrea Vargas
                </p>
                <p className="font-semibold text-xs text-slate-300 print:text-black uppercase tracking-wider">
                  Orientação de Estágio
                </p>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  {cursoFiltro === 'Todos'
                    ? 'Cursos Técnicos de Jogos Digitais, Informática e Redes'
                    : getNomeCompletoCurso(cursoFiltro)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com os dois botões: 1. Gerar PDF | 2. Enviar para Impressora */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/40 gap-3 print:hidden">
          <div className="text-xs text-slate-400">
            Relatório pronto para prestação de contas à Gerência Escolar.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors"
            >
              Fechar
            </button>

            {/* Botão 1: Gerar e Baixar PDF */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleGerarPDF}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
              title="Baixa o relatório completo em formato PDF pronto para arquivamento ou envio à gerência"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Gerar PDF</span>
                </>
              )}
            </button>

            {/* Botão 2: Enviar diretamente para a impressora */}
            <button
              type="button"
              onClick={handleImprimir}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
              title="Envia o relatório diretamente para a impressora sem menus nem cortes"
            >
              <Printer className="w-4 h-4" />
              <span>Enviar para Impressora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
