import React, { useState } from 'react';
import { X, Printer, FileDown, Calendar, FileCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { EstagioRecord, ReuniaoMensal, getNomeCompletoCurso } from '../types.ts';
import { generatePdfFromElement, printElementDirectly } from '../utils/printAndPdf.ts';

interface DeclaracaoComparecimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: EstagioRecord | null;
  reuniao: ReuniaoMensal | null;
}

export const DeclaracaoComparecimentoModal: React.FC<DeclaracaoComparecimentoModalProps> = ({
  isOpen,
  onClose,
  aluno,
  reuniao,
}) => {
  // Data de emissão escolhida pelo usuário (padrão: hoje no formato YYYY-MM-DD)
  const [dataEmissao, setDataEmissao] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !aluno || !reuniao) return null;

  const presenca = reuniao.presencas[aluno.id];
  const compareceu = presenca?.status === 'Presença';

  const dataReuniaoFormatada = new Date(reuniao.dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Converte a data escolhida para exibição: ex. "24 de outubro de 2026"
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
  const nomeCursoCompleto = getNomeCompletoCurso(aluno.curso);

  // 1. Gerar e baixar arquivo PDF
  const handleGerarPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      setFeedbackMsg(null);
      const filename = `declaracao_comparecimento_${aluno.matricula}_${reuniao.mesAno}.pdf`;
      await generatePdfFromElement('documento-declaracao-oficial', {
        filename,
        orientation: 'portrait',
      });
      setFeedbackMsg({
        type: 'success',
        text: `PDF gerado com sucesso! Arquivo salvo como "${filename}".`,
      });
    } catch (err: any) {
      console.error('Erro ao gerar PDF da declaração:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'Não foi possível gerar o PDF. Você também pode clicar em Enviar para Impressora.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Enviar diretamente para a impressora
  const handleImprimir = () => {
    printElementDirectly('documento-declaracao-oficial', `Declaração de Comparecimento - ${aluno.nome}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho da Janela Modal (oculto na impressão) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Declaração Mensal de Comparecimento</h3>
              <p className="text-xs text-slate-400">Comprovante de frequência à reunião mensal de orientação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Configuração pré-geração: Escolha da Data de Emissão (oculta na impressão) */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <label htmlFor="data-emissao-picker" className="text-xs font-medium text-slate-300">
              Data da Declaração (Texto de Emissão):
            </label>
            <input
              id="data-emissao-picker"
              type="date"
              value={dataEmissao}
              onChange={(e) => setDataEmissao(e.target.value)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Aparecerá no documento como: <strong className="text-white">Emitido em {dataEmissaoFormatada}</strong>
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

        {/* Documento Oficial da Declaração (Identificado com id para PDF e Impressão) */}
        <div
          id="documento-declaracao-oficial"
          className="p-6 sm:p-10 space-y-6 max-h-[68vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8 print:text-black bg-slate-900 print:bg-white"
        >
          {/* Cabeçalho Oficial Institucional */}
          <div className="text-center pb-6 border-b-2 border-slate-700 print:border-black space-y-1.5">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400 print:text-gray-700">
              ORIENTAÇÃO DE ESTÁGIO SUPERVISIONADO
            </p>
            <h2 className="text-lg sm:text-xl font-bold uppercase text-white print:text-black tracking-wide">
              {nomeCursoCompleto.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Comprovação Obrigatória de Frequência Mensal do Estagiário
            </p>
          </div>

          {/* Título do Documento */}
          <div className="text-center pt-2">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white print:text-black">
              DECLARAÇÃO DE COMPARECIMENTO
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Ref.: Reunião Mensal de Acompanhamento — Mês {reuniao.mesAno}
            </p>
          </div>

          {/* Corpo do Texto */}
          <div className="text-sm leading-relaxed text-slate-200 print:text-black text-justify space-y-4 pt-2">
            <p>
              Declaramos para os devidos fins de comprovação acadêmica e cumprimento das exigências do{' '}
              <strong>Estágio Curricular Supervisionado</strong> do <strong>{nomeCursoCompleto}</strong> que o(a) aluno(a):
            </p>

            {/* Ficha Resumida do Aluno no Documento */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 print:bg-gray-100 print:border-gray-300 text-xs sm:text-sm space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 print:text-gray-600">Nome do Aluno: </span>
                  <strong className="text-white print:text-black">{aluno.nome}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-600">Matrícula: </span>
                  <strong className="font-mono text-indigo-300 print:text-black">{aluno.matricula}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-600">Curso: </span>
                  <strong className="text-white print:text-black">{nomeCursoCompleto}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-600">Turma / Ano: </span>
                  <strong className="text-white print:text-black">
                    {aluno.turma || '-'} {aluno.ano ? `(${aluno.ano})` : ''}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 print:text-gray-600">Local de Estágio: </span>
                  <strong className="text-white print:text-black">{aluno.localEstagio}</strong>
                </div>
              </div>
            </div>

            <p>
              {compareceu ? (
                <>
                  <span className="text-emerald-400 print:text-black font-semibold">COMPARECEU</span> regularmente à{' '}
                  <strong>Reunião Mensal Obrigatória de Orientação e Acompanhamento de Estágio</strong>, realizada no dia{' '}
                  <strong>{dataReuniaoFormatada}</strong>, com a seguinte pauta de discussão: <em>"{reuniao.pauta}"</em>.
                </>
              ) : (
                <>
                  <span className="text-rose-400 print:text-black font-semibold">NÃO COMPARECEU</span> à Reunião Mensal Obrigatória de Orientação e Acompanhamento de Estágio realizada no dia{' '}
                  <strong>{dataReuniaoFormatada}</strong>, sendo registrada <strong className="text-rose-400 print:text-black">FALTA</strong> no acompanhamento mensal.
                  {presenca?.justificativa && (
                    <span className="block mt-2 italic text-xs">
                      Justificativa apresentada: "{presenca.justificativa}"
                    </span>
                  )}
                </>
              )}
            </p>

            <p>
              A presença nesta reunião é requisito indispensável para a validação das atividades de estágio curricular supervisionado e emissão do termo final de conclusão do curso técnico.
            </p>
          </div>

          {/* Data e Local Escolhida pelo Usuário */}
          <div className="text-right pt-6 text-xs sm:text-sm text-slate-300 print:text-black font-medium">
            Emitido em {dataEmissaoFormatada}.
          </div>

          {/* Campo de Assinatura: Linha -> Nome "Andrea Vargas" -> "Orientação de Estágio" -> Nome Completo do Curso */}
          <div className="pt-12 pb-4 text-center text-xs text-slate-300 print:text-black">
            <div className="max-w-md mx-auto space-y-1">
              <div className="border-t border-slate-600 print:border-black w-72 mx-auto pt-2" />
              <p className="font-bold text-base text-white print:text-black tracking-wide">
                Andrea Vargas
              </p>
              <p className="font-semibold text-xs text-slate-300 print:text-black uppercase tracking-wider">
                Orientação de Estágio
              </p>
              <p className="text-xs text-slate-400 print:text-gray-800 font-medium">
                {nomeCursoCompleto}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé da Janela com os dois botões: 1. Gerar PDF | 2. Enviar para Impressora */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/40 gap-3 print:hidden">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Status do Aluno:</span>
            <span className={compareceu ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {compareceu ? 'Presença Confirmada' : 'Falta Registrada'}
            </span>
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
              title="Baixa a declaração em arquivo PDF formatado para arquivamento ou envio digital"
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
              title="Abre a caixa de diálogo de impressão do sistema para imprimir na impressora"
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
