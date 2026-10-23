import React from 'react';
import { Gamepad2, Plus, Download, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  totalRecords: number;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onRefresh,
  onExportCSV,
  totalRecords,
  isLoading,
}) => {
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
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Gestão de Estágios
                  <span className="hidden md:inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Jogos Digitais
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Curso Técnico em Programação de Jogos Digitais • Registro e Acompanhamento
              </p>
            </div>
          </div>

          {/* Ações da Barra */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              onClick={onRefresh}
              title="Sincronizar com o banco de dados"
              disabled={isLoading}
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Exportar listagem para planilha CSV"
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Estágio</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
