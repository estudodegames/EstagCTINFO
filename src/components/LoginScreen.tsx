import React, { useState } from 'react';
import { Shield, Lock, Key, AlertCircle, Eye, EyeOff, UserCheck, ArrowRight } from 'lucide-react';
import { authService, AuthUser } from '../services/authService.ts';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [accessKey, setAccessKey] = useState('');
  const [orientadorIdentificacao, setOrientadorIdentificacao] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanSigla = orientadorIdentificacao.trim().toUpperCase();
    if (!cleanSigla) {
      setErrorMessage('Por favor, preencha o campo de Identificação do Orientador.');
      return;
    }

    if (cleanSigla !== 'ACVR') {
      setErrorMessage('Identificação inválida. Acesso não autorizado.');
      return;
    }

    if (!accessKey.trim()) {
      setErrorMessage('Por favor, digite a Chave de Acesso da Orientação.');
      return;
    }

    try {
      setIsLoadingKey(true);
      const user = await authService.loginWithAccessKey(accessKey, cleanSigla);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Chave de acesso incorreta ou não autorizada.');
    } finally {
      setIsLoadingKey(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 mb-2">
            <Shield className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Acesso Restrito à Orientação
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Portal de Estágios ETER
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cursos Técnicos de <strong>Jogos Digitais</strong>, <strong>Informática</strong> e <strong>Redes</strong>. Autentique-se com sua Chave de Acesso e Identificação autorizada.
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Formulário de Acesso por Chave */}
          <form onSubmit={handleKeyLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Identificação do Orientador
                  <span className="text-rose-400 text-sm leading-none">*</span>
                </span>
              </label>
              <input
                type="text"
                value={orientadorIdentificacao}
                onChange={(e) => setOrientadorIdentificacao(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Chave de Acesso da Orientação
                  <span className="text-rose-400 text-sm leading-none">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Digite a chave da equipe..."
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  title={showPassword ? 'Ocultar chave' : 'Mostrar chave'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingKey}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            >
              {isLoadingKey ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Escola Técnica Estadual República • CTINFO - Orientação de Estágio
        </div>
      </div>
    </div>
  );
};
