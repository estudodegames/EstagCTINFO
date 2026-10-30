import React, { useRef } from 'react';
import {
  Gamepad2,
  Plus,
  Download,
  RefreshCw,
  Upload,
  Database,
  Settings,
  FileSpreadsheet,
  Calendar,
  Users,
  ShieldCheck,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { AuthUser } from '../services/authService.ts';

interface NavbarProps {
  activeTab: 'estagios' | 'reunioes';
  onChangeTab: (tab: 'estagios' | 'reunioes') => void;
  onOpenCreateModal: () => void;
  onOpenRelatorios: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSettings: () => void;
  onOpenSecurity: () => void;
  onLogout: () => void;
  currentUser: AuthUser | null;
  totalRecords: number;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onOpenCreateModal,
  onOpenRelatorios,
  onRefresh,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onOpenSettings,
  onOpenSecurity,
  onLogout,
  currentUser,
  totalRecords,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Logo / Emblema & Status */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <button
              onClick={onOpenSettings}
              title="Clique para ver detalhes da sincronização em nuvem"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-medium text-emerald-400 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronizado</span>
            </button>
          </div>

          {/* Abas de Navegação Principal */}
          <div className="hidden md:flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl space-x-1.5">
            <button
              onClick={() => onChangeTab('estagios')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'estagios'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cadastros ({totalRecords})</span>
            </button>

            <button
              onClick={() => onChangeTab('reunioes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'reunioes'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Reuniões & Frequência</span>
            </button>
          </div>

          {/* Ações da Barra */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap justify-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJSON}
              accept=".json"
              className="hidden"
            />

            {/* Botão Novo Estágio em destaque */}
            {activeTab === 'estagios' && (
              <button
                onClick={onOpenCreateModal}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Estágio</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}

            {/* Botão de Relatórios Oficiais */}
            <button
              onClick={onOpenRelatorios}
              title="Visualizar e Imprimir Relatórios Oficiais"
              className="px-3 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              <span>Relatórios</span>
            </button>

            {/* Botão de Atualizar */}
            <button
              onClick={onRefresh}
              title="Recarregar dados do banco"
              disabled={isLoading}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-xl transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={onExportCSV}
              title="Exportar planilha CSV"
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Políticas de Segurança */}
            <button
              onClick={onOpenSecurity}
              title="Políticas de Segurança e Controle de Acesso"
              className="px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Segurança</span>
            </button>

            {/* Backup / Exportar JSON */}
            <button
              onClick={onExportJSON}
              title="Salvar cópia de segurança (Backup JSON)"
              className="px-2.5 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Backup</span>
            </button>

            {/* Importar / Restaurar */}
            <button
              onClick={handleImportClick}
              title="Restaurar dados a partir de arquivo JSON"
              className="px-2.5 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Restaurar</span>
            </button>

            {/* Configurações */}
            <button
              onClick={onOpenSettings}
              title="Configurações de sincronização do banco"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Usuário Autenticado & Logout */}
            {currentUser && (
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200"
                  title={`Orientador: ${currentUser.nome}`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold tracking-wide">{currentUser.nome}</span>
                </div>

                <button
                  onClick={onLogout}
                  title={`Encerrar sessão de ${currentUser.nome}`}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700/80 hover:border-rose-500/30 rounded-xl transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs font-medium">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Abas Mobile */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60">
          <button
            onClick={() => onChangeTab('estagios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === 'estagios'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cadastros ({totalRecords})</span>
          </button>
          <button
            onClick={() => onChangeTab('reunioes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeTab === 'reunioes'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reuniões & Frequência</span>
          </button>
        </div>
      </div>
    </header>
  );
};
