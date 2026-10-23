import React from 'react';
import { X, Printer, Award, CheckCircle2, Calendar, User, Building2, Hash, FileCheck } from 'lucide-react';
import { EstagioRecord, ReuniaoMensal } from '../types.ts';

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
  if (!isOpen || !aluno || !reuniao) return null;

  const presenca = reuniao.presencas[aluno.id];
  const compareceu = presenca?.status === 'Presença';

  const dataFormatada = new Date(reuniao.dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const hojeFormatado = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header (oculto na impressão) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Declaração Mensal de Comparecimento</h3>
              <p className="text-xs text-slate-400">Comprovante oficial de presença em reunião de orientação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Documento Oficial para Impressão */}
        <div className="p-6 sm:p-10 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8 print:text-black">
          {/* Cabeçalho Oficial Institucional */}
          <div className="text-center pb-6 border-b-2 border-slate-700 print:border-black space-y-1.5">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400 print:text-gray-700">
              COORDENAÇÃO DE ESTÁGIO SUPERVISIONADO
            </p>
            <h2 className="text-lg sm:text-xl font-bold uppercase text-white print:text-black tracking-wide">
              CURSO TÉCNICO DE PROGRAMAÇÃO DE JOGOS DIGITAIS
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
              <strong>Estágio Curricular Supervisionado</strong> do Curso Técnico em Programação de Jogos Digitais que o(a) aluno(a):
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
                  <span className="text-slate-400 print:text-gray-600">Turma: </span>
                  <strong className="text-white print:text-black">{aluno.turma || 'Não informada'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-gray-600">Ano: </span>
                  <strong className="text-white print:text-black">{aluno.ano || '2026'}</strong>
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
                  <span className="text-emerald-400 print:text-black font-semibold">COMPARECEU</span> regularmente à <strong>Reunião Mensal Obrigatória de Orientação e Acompanhamento de Estágio</strong>, realizada no dia <strong>{dataFormatada}</strong>, com a seguinte pauta de discussão: <em>"{reuniao.pauta}"</em>.
                </>
              ) : (
                <>
                  <span className="text-rose-400 print:text-black font-semibold">NÃO COMPARECEU</span> à Reunião Mensal Obrigatória de Orientação e Acompanhamento de Estágio realizada no dia <strong>{dataFormatada}</strong>, sendo registrada <strong className="text-rose-400 print:text-black">FALTA</strong> no acompanhamento mensal.
                  {presenca?.justificativa && (
                    <span className="block mt-2 italic text-xs">
                      Justificativa apresentada: "{presenca.justificativa}"
                    </span>
                  )}
                </>
              )}
            </p>

            <p>
              A presença nesta reunião é requisito indispensável para a validação das horas de estágio curricular supervisionado e emissão do termo final de conclusão de curso.
            </p>
          </div>

          {/* Data e Local */}
          <div className="text-right pt-6 text-xs sm:text-sm text-slate-300 print:text-black">
            Emitido em {hojeFormatado}.
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 pb-4 text-center text-xs text-slate-300 print:text-black">
            <div className="space-y-1">
              <div className="border-t border-slate-600 print:border-black w-4/5 mx-auto pt-2" />
              <p className="font-semibold text-white print:text-black">Coordenação de Estágio</p>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Curso Técnico de Programação de Jogos Digitais</p>
            </div>
            <div className="space-y-1">
              <div className="border-t border-slate-600 print:border-black w-4/5 mx-auto pt-2" />
              <p className="font-semibold text-white print:text-black">{aluno.nome}</p>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Estagiário(a) • Matrícula {aluno.matricula}</p>
            </div>
          </div>
        </div>

        {/* Footer (oculto na impressão) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/30 print:hidden">
          <div className="text-xs text-slate-400">
            Status: <span className={compareceu ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {compareceu ? 'Presença Confirmada' : 'Falta Registrada'}
            </span>
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
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
