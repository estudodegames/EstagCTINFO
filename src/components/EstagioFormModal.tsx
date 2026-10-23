import React, { useState, useEffect } from 'react';
import { X, Save, Building2, User, Hash, Briefcase, Calendar, Clock, UserCheck, AlertCircle, Users, BookOpen } from 'lucide-react';
import { EstagioFormData, EstagioRecord } from '../types.ts';

interface EstagioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EstagioFormData) => Promise<void>;
  initialData?: EstagioRecord | null;
  isSubmitting: boolean;
}

const QUICK_AREAS = [
  'Gameplay Programming (Unity / C#)',
  'Gameplay & Systems (Unreal / C++)',
  'Godot & GDScript',
  'Shaders & Tech Art / VFX',
  'Backend & Multiplayer em Jogos',
  'Física e Mecânicas de Jogos',
  'QA / Playtesting & Testes de Jogos',
  'Áudio Interativo & Middleware (FMOD / Wwise)',
  'UI/UX para Jogos Digitais'
];

export const EstagioFormModal: React.FC<EstagioFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [turma, setTurma] = useState('');
  const [ano, setAno] = useState('2026');
  const [sexo, setSexo] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [localEstagio, setLocalEstagio] = useState('');
  const [area, setArea] = useState('Gameplay Programming (Unity / C#)');
  const [status, setStatus] = useState<'Ativo' | 'Concluído' | 'Pendente'>('Ativo');
  const [dataInicio, setDataInicio] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('30h');
  const [supervisor, setSupervisor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setMatricula(initialData.matricula || '');
      setNome(initialData.nome || '');
      setTurma(initialData.turma || '');
      setAno(initialData.ano || '2026');
      setSexo(initialData.sexo || 'Masculino');
      setLocalEstagio(initialData.localEstagio || '');
      setArea(initialData.area || 'Gameplay Programming (Unity / C#)');
      setStatus(initialData.status || 'Ativo');
      setDataInicio(initialData.dataInicio || '');
      setCargaHoraria(initialData.cargaHoraria || '30h');
      setSupervisor(initialData.supervisor || '');
      setObservacoes(initialData.observacoes || '');
    } else {
      setMatricula('');
      setNome('');
      setTurma('Turma A');
      setAno('2026');
      setSexo('Masculino');
      setLocalEstagio('');
      setArea('Gameplay Programming (Unity / C#)');
      setStatus('Ativo');
      setDataInicio(new Date().toISOString().split('T')[0]);
      setCargaHoraria('30h');
      setSupervisor('');
      setObservacoes('');
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!matricula.trim()) {
      setErrorMessage('Por favor, informe a Matrícula do aluno.');
      return;
    }
    if (!nome.trim()) {
      setErrorMessage('Por favor, informe o Nome Completo do aluno.');
      return;
    }
    if (!localEstagio.trim()) {
      setErrorMessage('Por favor, informe o Local de Estágio.');
      return;
    }

    try {
      await onSubmit({
        matricula: matricula.trim(),
        nome: nome.trim(),
        turma: turma.trim() || undefined,
        ano: ano.trim() || undefined,
        sexo: sexo || undefined,
        localEstagio: localEstagio.trim(),
        area: area.trim(),
        status,
        dataInicio: dataInicio || undefined,
        cargaHoraria: cargaHoraria.trim() || undefined,
        supervisor: supervisor.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar o cadastro.');
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </span>
              {isEditing ? 'Editar Cadastro de Estágio' : 'Novo Cadastro de Estágio'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing
                ? `Atualizando informações do aluno ${initialData?.nome}`
                : 'Preencha os dados do estudante (Matrícula, Nome, Turma, Ano, Sexo e Local)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Linha 1: Matrícula & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Matrícula <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: 2024-JOG-0199"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wide"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Status do Estágio <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Ativo">Ativo (Em andamento)</option>
                <option value="Concluído">Concluído (Horas cumpridas)</option>
                <option value="Pendente">Pendente (Aguardando documentação)</option>
              </select>
            </div>
          </div>

          {/* Nome do Aluno */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Nome Completo do Aluno <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lucas Gabriel Albuquerque"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Novos Campos: Turma, Ano e Sexo do Aluno */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Turma
              </label>
              <input
                type="text"
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                placeholder="Ex: Turma A, 301-JOG"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Ano Letivo / Período
              </label>
              <input
                type="text"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2026, 3º Ano"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Sexo
              </label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Local de Estágio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Local de Estágio (Estúdio / Empresa / Instituição) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={localEstagio}
              onChange={(e) => setLocalEstagio(e.target.value)}
              placeholder="Ex: PixelForge Game Studio, Hoplon, Rogue Snail..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Área / Especialidade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Área de Atuação no Desenvolvimento de Jogos
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: Gameplay Programming, Unreal C++, Unity C#..."
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AREAS.slice(0, 5).map((quick) => (
                <button
                  type="button"
                  key={quick}
                  onClick={() => setArea(quick)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors border ${
                    area === quick
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          {/* Carga Horária & Início */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Carga Horária Semanal
              </label>
              <select
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="20h">20 horas semanais (4h/dia)</option>
                <option value="30h">30 horas semanais (6h/dia)</option>
                <option value="15h">15 horas semanais</option>
                <option value="Outro">Outro formato</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Data de Início do Estágio
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Supervisor na Empresa / Estúdio
            </label>
            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Ex: Fernando Souza (Tech Lead)"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações pertinentes sobre as atividades do estágio..."
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Cadastro' : 'Cadastrar Estágio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
