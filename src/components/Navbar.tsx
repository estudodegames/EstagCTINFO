import React, { useRef } from 'react';
import { Gamepad2, Plus, Download, RefreshCw, Upload, Database, Settings, FileSpreadsheet, Calendar, Users } from 'lucide-react';

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
        <div className="flex items-center justify-between h-18">
          {/* Logo & Título */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Gestão de Estágios
                  <span className="hidden md:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Jogos Digitais
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline">Curso Técnico em Jogos Digitais</span>
                <span className="hidden sm:inline">•</span>
                <button
                  onClick={onOpenSettings}
                  title="Clique para ver detalhes da sincronização em nuvem"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado
                </button>
              </div>
            </div>
          </div>

          {/* Abas de Navegação Principal */}
          <div className="hidden md:flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl space-x-1">
            <button
              onClick={() => onChangeTab('estagios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'estagios'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cadastros ({totalRecords})</span>
            </button>

            <button
              onClick={() => onChangeTab('reunioes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'reunioes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reuniões & Frequência</span>
            </button>
          </div>

          {/* Ações da Barra */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJSON}
              accept=".json"
              className="hidden"
            />

            {/* Botão de Relatórios Oficiais */}
            <button
              onClick={onOpenRelatorios}
              title="Visualizar e Imprimir Relatórios Oficiais"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Relatórios</span>
            </button>

            {/* Botão de Atualizar */}
            <button
              onClick={onRefresh}
              title="Recarregar dados do banco"
              disabled={isLoading}
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden lg:inline">Atualizar</span>
            </button>

            {/* Configurações */}
            <button
              onClick={onOpenSettings}
              title="Configurações de sincronização do banco"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Backup / Exportar JSON */}
            <button
              onClick={onExportJSON}
              title="Salvar cópia de segurança (Backup JSON)"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Backup</span>
            </button>

            {/* Importar */}
            <button
              onClick={handleImportClick}
              title="Restaurar dados a partir de arquivo JSON"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Restaurar</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={onExportCSV}
              title="Exportar planilha CSV"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Botão Novo Aluno */}
            {activeTab === 'estagios' && (
              <button
                onClick={onOpenCreateModal}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Estágio</span>
                <span className="sm:hidden">Novo</span>
              </button>
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
