import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  FileCheck,
  Trash2,
  Users,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  ChevronRight,
  Filter
} from 'lucide-react';
import { EstagioRecord, ReuniaoMensal } from '../types.ts';
import { api } from '../services/api.ts';

interface ReunioesSectionProps {
  reunioes: ReuniaoMensal[];
  alunos: EstagioRecord[];
  onRefresh: () => void;
  onOpenDeclaracao: (aluno: EstagioRecord, reuniao: ReuniaoMensal) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ReunioesSection: React.FC<ReunioesSectionProps> = ({
  reunioes,
  alunos,
  onRefresh,
  onOpenDeclaracao,
  showToast,
}) => {
  const [selectedReuniaoId, setSelectedReuniaoId] = useState<string | null>(
    reunioes.length > 0 ? reunioes[0].id : null
  );

  const [isNewReuniaoModalOpen, setIsNewReuniaoModalOpen] = useState(false);
  const [mesAnoInput, setMesAnoInput] = useState(new Date().toISOString().substring(0, 7)); // Ex: "2026-10"
  const [dataReuniaoInput, setDataReuniaoInput] = useState(new Date().toISOString().split('T')[0]);
  const [pautaInput, setPautaInput] = useState('Reunião Mensal de Acompanhamento de Atividades de Estágio');
  const [observacoesInput, setObservacoesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aluno e justificativa para falta
  const [justificativaPrompt, setJustificativaPrompt] = useState<{ alunoId: string; nome: string } | null>(null);
  const [justificativaTexto, setJustificativaTexto] = useState('');

  // Filtro de aluno dentro da reunião
  const [alunoSearch, setAlunoSearch] = useState('');

  const currentReuniao = reunioes.find((r) => r.id === selectedReuniaoId) || reunioes[0] || null;

  const handleCreateReuniao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesAnoInput || !dataReuniaoInput || !pautaInput.trim()) {
      showToast('error', 'Preencha o Mês/Ano, a Data e a Pauta da Reunião.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.createReuniao({
        mesAno: mesAnoInput,
        dataReuniao: dataReuniaoInput,
        pauta: pautaInput.trim(),
        observacoes: observacoesInput.trim() || undefined,
      });
      showToast('success', `Reunião do mês ${mesAnoInput} criada com sucesso!`);
      setIsNewReuniaoModalOpen(false);
      onRefresh();
      setSelectedReuniaoId(created.id);
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao criar reunião.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcarPresenca = async (alunoId: string, status: 'Presença' | 'Falta', justificativa?: string) => {
    if (!currentReuniao) return;

    try {
      await api.updateFrequencia(currentReuniao.id, alunoId, status, justificativa);
      showToast('success', `${status} registrada para o aluno.`);
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao registrar frequência.');
    }
  };

  const handleDeleteReuniao = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta reunião e todo o registro de frequência associado?')) {
      try {
        await api.deleteReuniao(id);
        showToast('info', 'Reunião excluída.');
        onRefresh();
        if (selectedReuniaoId === id) {
          setSelectedReuniaoId(null);
        }
      } catch (err: any) {
        showToast('error', err.message || 'Erro ao excluir reunião.');
      }
    }
  };

  // Contagem de presenças na reunião selecionada
  const presencasMap = currentReuniao?.presencas || {};
  let totalPresentes = 0;
  let totalFaltas = 0;
  let totalPendentes = 0;

  alunos.forEach((a) => {
    const reg = presencasMap[a.id];
    if (reg?.status === 'Presença') totalPresentes++;
    else if (reg?.status === 'Falta') totalFaltas++;
    else totalPendentes++;
  });

  const filteredAlunos = alunos.filter((a) => {
    if (!alunoSearch) return true;
    const q = alunoSearch.toLowerCase();
    return (
      a.nome.toLowerCase().includes(q) ||
      a.matricula.toLowerCase().includes(q) ||
      (a.turma && a.turma.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header da Seção de Reuniões */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Controle de Frequência Mensal Obrigatória
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Reuniões Mensais de Acompanhamento</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-0.5">
            Registro obrigatório mensal dos estagiários. Marque presença ou falta e emita a 
            <strong> Declaração Oficial de Comparecimento</strong> individual para comprovação de horas.
          </p>
        </div>

        <button
          onClick={() => setIsNewReuniaoModalOpen(true)}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Reunião Mensal</span>
        </button>
      </div>

      {/* Grid: Lista de Reuniões à esquerda + Painel de Frequência à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Lista de Reuniões */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Reuniões Agendadas ({reunioes.length})</span>
          </div>

          {reunioes.length === 0 ? (
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                Nenhuma reunião mensal cadastrada ainda. Clique no botão acima para agendar a reunião do mês.
              </p>
              <button
                onClick={() => setIsNewReuniaoModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/40 rounded-lg transition-colors"
              >
                + Agendar Reunião
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {reunioes.map((reu) => {
                const isSelected = (currentReuniao?.id === reu.id);
                const dataFormatada = new Date(reu.dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR');

                return (
                  <div
                    key={reu.id}
                    onClick={() => setSelectedReuniaoId(reu.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Mês {reu.mesAno}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-1.5 line-clamp-1">
                          {reu.pauta}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReuniao(reu.id);
                        }}
                        title="Excluir esta reunião"
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Data: {dataFormatada}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {Object.keys(reu.presencas || {}).length} registros
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel Direito: Chamada de Frequência da Reunião Selecionada */}
        <div className="lg:col-span-8">
          {currentReuniao ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              {/* Top Details da Reunião */}
              <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Mês: {currentReuniao.mesAno}
                    </span>
                    <span className="text-xs text-slate-400">
                      Data da Reunião:{' '}
                      <strong className="text-white">
                        {new Date(currentReuniao.dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {currentReuniao.pauta}
                  </h3>
                </div>

                {/* Badges de Contagem */}
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    ● {totalPresentes} Presentes
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                    ● {totalFaltas} Faltas
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    ● {totalPendentes} Pendentes
                  </span>
                </div>
              </div>

              {/* Barra de Busca de Aluno na Chamada */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={alunoSearch}
                  onChange={(e) => setAlunoSearch(e.target.value)}
                  placeholder="Filtrar aluno por nome ou matrícula nesta chamada..."
                  className="w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tabela de Alunos e Marcação de Presença / Falta */}
              {alunos.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhum aluno cadastrado no sistema. Cadastre alunos na aba principal para realizar a chamada.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Matrícula</th>
                        <th className="py-2.5 px-3">Aluno</th>
                        <th className="py-2.5 px-3">Turma</th>
                        <th className="py-2.5 px-3 text-center">Frequência</th>
                        <th className="py-2.5 px-3 text-right">Declaração</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs sm:text-sm">
                      {filteredAlunos.map((aluno) => {
                        const statusReg = presencasMap[aluno.id];
                        const status = statusReg?.status;
                        const isPresente = status === 'Presença';
                        const isFalta = status === 'Falta';

                        return (
                          <tr key={aluno.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs text-indigo-300 font-medium">
                              {aluno.matricula}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-white">{aluno.nome}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {aluno.localEstagio}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-300">
                              {aluno.turma || '-'}
                            </td>

                            {/* Botões de Presença / Falta */}
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => handleMarcarPresenca(aluno.id, 'Presença')}
                                  title="Marcar presença do aluno"
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                    isPresente
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Presença</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setJustificativaPrompt({ alunoId: aluno.id, nome: aluno.nome });
                                    setJustificativaTexto(statusReg?.justificativa || '');
                                  }}
                                  title="Marcar falta (com opção de justificativa)"
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                    isFalta
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Falta</span>
                                </button>
                              </div>

                              {statusReg?.justificativa && (
                                <div className="text-[10px] text-rose-300/80 italic mt-0.5">
                                  Justificativa: {statusReg.justificativa}
                                </div>
                              )}
                            </td>

                            {/* Ação: Emitir Declaração de Comparecimento */}
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => onOpenDeclaracao(aluno, currentReuniao)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                                  isPresente
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                }`}
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Declaração</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              Selecione uma reunião à esquerda ou clique em <strong>+ Nova Reunião Mensal</strong> para registrar a frequência do mês.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Agendar Nova Reunião Mensal */}
      {isNewReuniaoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Agendar Reunião Mensal
              </h3>
              <button
                onClick={() => setIsNewReuniaoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReuniao} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mês / Ano de Referência <span className="text-rose-400">*</span>
                </label>
                <input
                  type="month"
                  value={mesAnoInput}
                  onChange={(e) => setMesAnoInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Data Específica da Reunião Mensal <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={dataReuniaoInput}
                  onChange={(e) => setDataReuniaoInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pauta da Reunião <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={pautaInput}
                  onChange={(e) => setPautaInput(e.target.value)}
                  placeholder="Ex: Orientação sobre relatório parcial de estágio e documentação"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Observações Gerais (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observacoesInput}
                  onChange={(e) => setObservacoesInput(e.target.value)}
                  placeholder="Instruções adicionais ou local da reunião..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewReuniaoModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md"
                >
                  {isSubmitting ? 'Salvando...' : 'Criar Reunião'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Falta com Justificativa */}
      {justificativaPrompt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Registrar Falta do Aluno
            </h3>
            <p className="text-xs text-slate-300">
              Aluno: <strong>{justificativaPrompt.nome}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Justificativa da Falta (Opcional):
              </label>
              <textarea
                rows={3}
                value={justificativaTexto}
                onChange={(e) => setJustificativaTexto(e.target.value)}
                placeholder="Ex: Atestado médico entregue, compromisso em estúdio..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setJustificativaPrompt(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleMarcarPresenca(justificativaPrompt.alunoId, 'Falta', justificativaTexto);
                  setJustificativaPrompt(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md"
              >
                Confirmar Falta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
