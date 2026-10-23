import React, { useRef } from 'react';
import { Gamepad2, Plus, Download, RefreshCw, Upload, Database, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalRecords: number;
  isLoading: boolean;
  storageMode: 'backend' | 'client';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onRefresh,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  totalRecords,
  isLoading,
  storageMode,
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
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Gestão de Estágios
                  <span className="hidden md:inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Jogos Digitais
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline">Curso Técnico em Programação de Jogos</span>
                <span className="hidden sm:inline">•</span>
                <span
                  title={
                    storageMode === 'backend'
                      ? 'Persistência via Servidor Node.js'
                      : 'Persistência no Navegador (Pronto para Netlify/Web)'
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {storageMode === 'backend' ? 'Servidor Ativo' : 'Armazenamento Web Ativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Ações da Barra */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Input oculto para carregar backup JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJSON}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={onRefresh}
              title="Sincronizar dados"
              disabled={isLoading}
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden md:inline">Atualizar</span>
            </button>

            {/* Backup / Exportar JSON */}
            <button
              onClick={onExportJSON}
              title="Salvar cópia de segurança (Backup JSON) dos estágios"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Backup JSON</span>
            </button>

            {/* Importar JSON */}
            <button
              onClick={handleImportClick}
              title="Restaurar ou importar cadastros a partir de um arquivo JSON"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Restaurar</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={onExportCSV}
              title="Exportar listagem para planilha CSV (Excel)"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-lg transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Botão Principal */}
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
