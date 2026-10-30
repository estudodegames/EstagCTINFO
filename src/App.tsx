import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Hash,
  User,
  GraduationCap,
  Sparkles,
  Gamepad2,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Database,
  Calendar,
  Users
} from 'lucide-react';
import { EstagioRecord, EstagioFormData, ReuniaoMensal, TipoCurso } from './types.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { EstagioFormModal } from './components/EstagioFormModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { EstagioDetailsModal } from './components/EstagioDetailsModal.tsx';
import { ConnectionSettingsModal } from './components/ConnectionSettingsModal.tsx';
import { RelatoriosModal } from './components/RelatoriosModal.tsx';
import { ReunioesSection } from './components/ReunioesSection.tsx';
import { DeclaracaoComparecimentoModal } from './components/DeclaracaoComparecimentoModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { SecurityModal } from './components/SecurityModal.tsx';
import { Toast, ToastMessage } from './components/Toast.tsx';
import { authService, AuthUser } from './services/authService.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'estagios' | 'reunioes'>('estagios');

  const [estagios, setEstagios] = useState<EstagioRecord[]>([]);
  const [reunioes, setReunioes] = useState<ReuniaoMensal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filtros de busca, status, turma e curso
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [turmaFilter, setTurmaFilter] = useState('Todas');
  const [cursoFilter, setCursoFilter] = useState('Todos');

  // Controle de Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EstagioRecord | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<EstagioRecord | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EstagioRecord | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);

  // Declaração de comparecimento
  const [declaracaoData, setDeclaracaoData] = useState<{
    aluno: EstagioRecord;
    reuniao: ReuniaoMensal;
  } | null>(null);

  // Carrega listagem de estágios e reuniões
  const loadData = async (silenceLoading = false) => {
    try {
      if (!silenceLoading) setIsLoading(true);
      const [estagiosData, reunioesData] = await Promise.all([
        api.getEstagios(),
        api.getReunioes(),
      ]);
      setEstagios(estagiosData);
      setReunioes(reunioesData);
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao carregar dados do sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubAuth = authService.onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    loadData();

    // Sincronização em tempo real entre múltiplos computadores (Computer A e B)
    const unsubscribe = api.subscribeToChanges(
      (cloudEstagios) => {
        setEstagios(cloudEstagios);
        setIsLoading(false);
      },
      (cloudReunioes) => {
        setReunioes(cloudReunioes);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente encerrar a sessão de trabalho?')) {
      await authService.logout();
      setEstagios([]);
      setReunioes([]);
      showToast('info', 'Sessão de trabalho encerrada com segurança.');
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({
      id: Math.random().toString(),
      type,
      text,
    });
  };

  // 1. CRIAR OU EDITAR ESTÁGIO
  const handleFormSubmit = async (formData: EstagioFormData) => {
    try {
      setIsSubmitting(true);
      if (editingRecord) {
        const updated = await api.updateEstagio(editingRecord.id, formData);
        setEstagios((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        showToast('success', `Cadastro do aluno "${updated.nome}" atualizado com sucesso!`);
      } else {
        const created = await api.createEstagio(formData);
        setEstagios((prev) => {
          if (prev.some((item) => item.id === created.id || item.matricula.trim().toLowerCase() === created.matricula.trim().toLowerCase())) {
            return prev.map((item) => (item.id === created.id ? created : item));
          }
          return [created, ...prev];
        });
        showToast('success', `Estágio do aluno "${created.nome}" cadastrado com sucesso!`);
      }
      setIsFormModalOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. EXCLUIR ESTÁGIO
  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteEstagio(recordToDelete.id);
      setEstagios((prev) => prev.filter((item) => item.id !== recordToDelete.id));
      showToast('success', `Estágio do aluno "${recordToDelete.nome}" excluído com sucesso.`);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao excluir o cadastro.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Limpar todos os registros
  const handleClearAll = async () => {
    if (window.confirm('Tem certeza que deseja apagar TODOS os cadastros existentes? Esta ação é definitiva.')) {
      try {
        setIsLoading(true);
        await api.clearAllEstagios();
        setEstagios([]);
        showToast('info', 'Todos os cadastros foram removidos.');
      } catch (err: any) {
        showToast('error', 'Erro ao limpar cadastros.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Exportar Backup JSON
  const handleExportJSON = () => {
    try {
      const jsonStr = api.exportJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `backup_estagios_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Backup JSON exportado com sucesso!');
    } catch (err: any) {
      showToast('error', 'Falha ao exportar backup JSON.');
    }
  };

  // Importar Backup JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const imported = api.importJson(parsed);
        setEstagios(imported);
        showToast('success', `${imported.length} cadastros importados com sucesso!`);
      } catch (err: any) {
        showToast('error', err.message || 'Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    if (estagios.length === 0) {
      showToast('info', 'Não há registros para exportar.');
      return;
    }

    const headers = ['Matricula', 'Nome', 'Email', 'Curso', 'Turma', 'Ano', 'Sexo', 'Local_Estagio', 'Status', 'Supervisor'];
    const rows = estagios.map((r) => [
      `"${r.matricula.replace(/"/g, '""')}"`,
      `"${r.nome.replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${r.curso || 'Jogos'}"`,
      `"${(r.turma || '').replace(/"/g, '""')}"`,
      `"${(r.ano || '').replace(/"/g, '""')}"`,
      `"${(r.sexo || '').replace(/"/g, '""')}"`,
      `"${r.localEstagio.replace(/"/g, '""')}"`,
      `"${r.status || 'Ativo'}"`,
      `"${(r.supervisor || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estagios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Relatório CSV exportado com sucesso!');
  };

  // Lista de turmas existentes para o filtro
  const turmasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    estagios.forEach((e) => {
      if (e.turma && e.turma.trim()) set.add(e.turma.trim());
    });
    return Array.from(set).sort();
  }, [estagios]);

  // Filtro reativo em memória
  const filteredEstagios = useMemo(() => {
    const list = estagios.filter((record) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        record.matricula.toLowerCase().includes(q) ||
        record.nome.toLowerCase().includes(q) ||
        (record.email && record.email.toLowerCase().includes(q)) ||
        (record.curso && record.curso.toLowerCase().includes(q)) ||
        record.localEstagio.toLowerCase().includes(q) ||
        (record.turma && record.turma.toLowerCase().includes(q)) ||
        (record.ano && record.ano.toLowerCase().includes(q)) ||
        (record.sexo && record.sexo.toLowerCase().includes(q)) ||
        (record.supervisor && record.supervisor.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'Todos' || record.status === statusFilter;

      const matchesTurma =
        turmaFilter === 'Todas' || record.turma === turmaFilter;

      const matchesCurso =
        cursoFilter === 'Todos' || record.curso === cursoFilter;

      return matchesSearch && matchesStatus && matchesTurma && matchesCurso;
    });

    // Ordenação alfabética pelo campo ALUNO (nome do estudante)
    return list.sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
    );
  }, [estagios, searchTerm, statusFilter, turmaFilter, cursoFilter]);

  // Se não estiver autenticado, exige login com Conta Google Autorizada ou Chave de Acesso
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast('success', `Acesso autorizado! Bem-vindo(a), ${user.nome}.`);
          }}
        />
        {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegação Superior */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenCreateModal={() => {
          setEditingRecord(null);
          setIsFormModalOpen(true);
        }}
        onOpenRelatorios={() => setIsRelatoriosOpen(true)}
        onRefresh={() => loadData(false)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        totalRecords={estagios.length}
        isLoading={isLoading}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'estagios' ? (
          <>
            {/* Banner Informativo dos Cursos */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                    <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                    {estagios.length} {estagios.length === 1 ? 'estagiário cadastrado' : 'estagiários cadastrados'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Cadastro e Acompanhamento de Estágios
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                  Registro oficial de estágios curriculares para os cursos de <strong>Jogos Digitais</strong>, <strong>Informática</strong> e <strong>Redes</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setIsRelatoriosOpen(true)}
                  className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-750 hover:text-white border border-slate-700 rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Ver Relatórios</span>
                </button>

                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Aluno</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtros e Busca Rápida */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between">
                {/* Campo de Busca */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por Matrícula, Nome, Curso, Turma, Ano, Sexo ou Local..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Filtro por Turma */}
                {turmasDisponiveis.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-slate-400">Turma:</span>
                    <select
                      value={turmaFilter}
                      onChange={(e) => setTurmaFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Todas">Todas as Turmas</option>
                      {turmasDisponiveis.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro por Status */}
                <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    Status:
                  </span>
                  {(['Todos', 'Ativo', 'Concluído', 'Pendente'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                        statusFilter === st
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro Rápido por Curso */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/70 overflow-x-auto">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Curso Técnico:</span>
                {(['Todos', 'Jogos', 'Informática', 'Redes'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCursoFilter(c)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      cursoFilter === c
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    {c === 'Todos' ? 'Todos os Cursos' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabela de Cadastros */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        <span className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-indigo-400" />
                          Matrícula
                        </span>
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          Aluno
                        </span>
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                          Curso
                        </span>
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          Turma / Ano
                        </span>
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          Local de Estágio
                        </span>
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Status
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs">Carregando cadastros de estágio...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredEstagios.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center">
                          <div className="max-w-md mx-auto space-y-3 px-4">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-slate-500" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">
                              Nenhum cadastro de estágio encontrado
                            </h4>
                            <p className="text-xs text-slate-400">
                              {searchTerm || statusFilter !== 'Todos' || turmaFilter !== 'Todas' || cursoFilter !== 'Todos'
                                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente ajustar o termo de busca.'
                                : 'Nenhum aluno cadastrado no momento. Cadastre seu primeiro registro abaixo.'}
                            </p>
                            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingRecord(null);
                                  setIsFormModalOpen(true);
                                }}
                                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors inline-flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Cadastrar Primeiro Aluno
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredEstagios.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Matrícula */}
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                              {record.matricula}
                            </span>
                          </td>

                          {/* Nome do Aluno & Sexo */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="font-semibold text-white">{record.nome}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                              {record.email && (
                                <span className="text-indigo-400 font-mono text-[11px]">
                                  {record.email}
                                </span>
                              )}
                              {record.sexo && (
                                <span className="text-slate-400">Sexo: {record.sexo}</span>
                              )}
                              {record.supervisor && (
                                <span className="truncate max-w-xs">
                                  • Sup: {record.supervisor}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Curso */}
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {record.curso || 'Jogos'}
                            </span>
                          </td>

                          {/* Turma / Ano */}
                          <td className="py-4 px-4 sm:px-6 hidden sm:table-cell whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-200">
                              {record.turma || '-'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {record.ano || '2026'}
                            </div>
                          </td>

                          {/* Local de Estágio */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                <Building2 className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-medium text-slate-200">
                                {record.localEstagio}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                record.status === 'Ativo'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : record.status === 'Concluído'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                              {record.status || 'Ativo'}
                            </span>
                          </td>

                          {/* Ações CRUD */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Visualizar Ficha Completa */}
                              <button
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setIsDetailsModalOpen(true);
                                }}
                                title="Visualizar Ficha Detalhada"
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Atualizar / Editar */}
                              <button
                                onClick={() => {
                                  setEditingRecord(record);
                                  setIsFormModalOpen(true);
                                }}
                                title="Editar Cadastro"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Excluir com Confirmação */}
                              <button
                                onClick={() => {
                                  setRecordToDelete(record);
                                  setIsDeleteModalOpen(true);
                                }}
                                title="Excluir Cadastro"
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Rodapé da Tabela */}
              <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                <div>
                  Mostrando <span className="font-semibold text-white">{filteredEstagios.length}</span> de{' '}
                  <span className="font-semibold text-white">{estagios.length}</span> alunos cadastrados
                </div>
                <div className="flex items-center gap-3">
                  {estagios.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1"
                      title="Apaga todos os cadastros"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar todos
                    </button>
                  )}
                  {estagios.length > 0 && <span>•</span>}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                    title="Configurações de sincronização do banco"
                  >
                    <span>Banco Sincronizado</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Aba de Reuniões Mensais & Frequência */
          <ReunioesSection
            reunioes={reunioes}
            alunos={estagios}
            onRefresh={() => loadData(true)}
            onOpenDeclaracao={(aluno, reuniao) => {
              setDeclaracaoData({ aluno, reuniao });
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modal de Formulário (Criar / Editar Aluno) */}
      <EstagioFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        record={recordToDelete}
        isDeleting={isDeleting}
      />

      {/* Modal de Detalhes do Aluno */}
      <EstagioDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onEdit={(rec) => {
          setEditingRecord(rec);
          setIsFormModalOpen(true);
        }}
      />

      {/* Modal de Configurações de Conexão */}
      <ConnectionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => loadData(false)}
      />

      {/* Modal de Relatórios Oficiais */}
      <RelatoriosModal
        isOpen={isRelatoriosOpen}
        onClose={() => setIsRelatoriosOpen(false)}
        alunos={estagios}
        reunioes={reunioes}
      />

      {/* Modal de Declaração de Comparecimento */}
      <DeclaracaoComparecimentoModal
        isOpen={Boolean(declaracaoData)}
        onClose={() => setDeclaracaoData(null)}
        aluno={declaracaoData?.aluno || null}
        reuniao={declaracaoData?.reuniao || null}
      />

      {/* Modal de Políticas de Segurança e Controle de Acesso */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onToast={showToast}
      />

      {/* Notificação Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
