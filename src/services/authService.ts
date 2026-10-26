import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase.ts';

export interface AuthUser {
  id: string;
  nome: string;
  email?: string;
  role: 'Administrador' | 'Orientador';
  authMethod: 'Google' | 'Chave de Acesso';
  photoURL?: string;
  authenticatedAt: string;
}

export interface SecurityPolicies {
  authorizedEmails: string[];
  accessKey: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AccessLogEntry {
  id: string;
  nome: string;
  identificador: string;
  metodo: 'Google' | 'Chave de Acesso';
  timestamp: string;
  sucesso: boolean;
  motivo?: string;
}

const STORAGE_SESSION_KEY = 'estagio_eter_auth_session_v1';
const STORAGE_POLICIES_KEY = 'estagio_eter_security_policies_v1';
const STORAGE_LOGS_KEY = 'estagio_eter_access_logs_v1';

const DEFAULT_ADMIN_EMAIL = 'gamesoundsbr@gmail.com';
const DEFAULT_ACCESS_KEY = 'ETER@Estagio2026';

const DEFAULT_POLICIES: SecurityPolicies = {
  authorizedEmails: [DEFAULT_ADMIN_EMAIL],
  accessKey: DEFAULT_ACCESS_KEY,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistema',
};

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];
  private cachedPolicies: SecurityPolicies | null = null;

  constructor() {
    this.restoreSession();
    this.initFirebaseListener();
  }

  private restoreSession() {
    try {
      const saved = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private saveSession(user: AuthUser | null, persist = true) {
    this.currentUser = user;
    try {
      if (user) {
        const str = JSON.stringify(user);
        sessionStorage.setItem(STORAGE_SESSION_KEY, str);
        if (persist) {
          localStorage.setItem(STORAGE_SESSION_KEY, str);
        }
      } else {
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch {}
    this.notifyListeners();
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentUser);
      } catch {}
    }
  }

  public onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  private initFirebaseListener() {
    onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.email) {
        const policies = await this.getPolicies();
        const normEmail = firebaseUser.email.toLowerCase().trim();
        const isAuthorized = policies.authorizedEmails.some(
          (e) => e.toLowerCase().trim() === normEmail
        );

        if (isAuthorized) {
          const user: AuthUser = {
            id: firebaseUser.uid,
            nome: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: normEmail === DEFAULT_ADMIN_EMAIL ? 'Administrador' : 'Orientador',
            authMethod: 'Google',
            photoURL: firebaseUser.photoURL || undefined,
            authenticatedAt: new Date().toISOString(),
          };
          this.saveSession(user, true);
        }
      }
    });
  }

  // Obter políticas de segurança do Firestore (ou cache local)
  public async getPolicies(): Promise<SecurityPolicies> {
    if (this.cachedPolicies) {
      return this.cachedPolicies;
    }

    try {
      // 1. Tenta carregar do Firestore
      const docRef = doc(db, 'seguranca', 'politicas');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<SecurityPolicies>;
        const merged: SecurityPolicies = {
          authorizedEmails: Array.isArray(data.authorizedEmails) && data.authorizedEmails.length > 0
            ? Array.from(new Set([DEFAULT_ADMIN_EMAIL, ...data.authorizedEmails]))
            : [DEFAULT_ADMIN_EMAIL],
          accessKey: data.accessKey && data.accessKey.trim() ? data.accessKey.trim() : DEFAULT_ACCESS_KEY,
          updatedAt: data.updatedAt || new Date().toISOString(),
          updatedBy: data.updatedBy || 'Sistema',
        };
        this.cachedPolicies = merged;
        localStorage.setItem(STORAGE_POLICIES_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[Segurança] Falha ao consultar Firestore para políticas:', err);
    }

    // 2. Fallback para localStorage
    try {
      const local = localStorage.getItem(STORAGE_POLICIES_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        this.cachedPolicies = parsed;
        return parsed;
      }
    } catch {}

    this.cachedPolicies = DEFAULT_POLICIES;
    return DEFAULT_POLICIES;
  }

  // Salvar políticas de segurança no Firestore e sincronizar
  public async savePolicies(updates: Partial<SecurityPolicies>): Promise<SecurityPolicies> {
    const current = await this.getPolicies();
    const updated: SecurityPolicies = {
      authorizedEmails: updates.authorizedEmails
        ? Array.from(new Set([DEFAULT_ADMIN_EMAIL, ...updates.authorizedEmails.map((e) => e.trim().toLowerCase())]))
        : current.authorizedEmails,
      accessKey: updates.accessKey && updates.accessKey.trim() ? updates.accessKey.trim() : current.accessKey,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUser?.nome || this.currentUser?.email || 'Administrador',
    };

    // Salva no Firestore
    try {
      const docRef = doc(db, 'seguranca', 'politicas');
      await setDoc(docRef, updated);
    } catch (err) {
      console.warn('[Segurança] Erro ao salvar políticas no Firestore:', err);
    }

    // Salva localmente
    this.cachedPolicies = updated;
    localStorage.setItem(STORAGE_POLICIES_KEY, JSON.stringify(updated));
    return updated;
  }

  // 1. LOGIN COM GOOGLE
  public async loginWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        await signOut(auth);
        this.recordLog('Desconhecido', 'Google (Sem e-mail)', 'Google', false, 'Conta Google sem e-mail válido');
        throw new Error('A conta Google utilizada não possui um endereço de e-mail válido.');
      }

      const policies = await this.getPolicies();
      const normEmail = firebaseUser.email.toLowerCase().trim();
      const isAuthorized = policies.authorizedEmails.some(
        (e) => e.toLowerCase().trim() === normEmail
      );

      if (!isAuthorized) {
        await signOut(auth);
        this.recordLog(firebaseUser.displayName || normEmail, normEmail, 'Google', false, 'E-mail não está na lista de autorizados');
        throw new Error(
          `O e-mail "${normEmail}" não possui permissão de acesso à Orientação de Estágios. Peça ao administrador (${DEFAULT_ADMIN_EMAIL}) para incluir seu e-mail.`
        );
      }

      const user: AuthUser = {
        id: firebaseUser.uid,
        nome: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        role: normEmail === DEFAULT_ADMIN_EMAIL ? 'Administrador' : 'Orientador',
        authMethod: 'Google',
        photoURL: firebaseUser.photoURL || undefined,
        authenticatedAt: new Date().toISOString(),
      };

      this.saveSession(user, true);
      this.recordLog(user.nome, user.email || '', 'Google', true);
      return user;
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        throw new Error(
          'O domínio deste site (ex: Netlify) ainda não foi autorizado no Firebase Authentication. Você pode entrar imediatamente utilizando a Chave de Acesso da Equipe abaixo!'
        );
      }
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('A janela de login com Google foi fechada antes de concluir.');
      }
      throw err;
    }
  }

  // 2. LOGIN COM CHAVE DE ACESSO DA EQUIPE
  public async loginWithAccessKey(key: string, customName?: string): Promise<AuthUser> {
    const policies = await this.getPolicies();
    const cleanKey = key.trim();

    if (!cleanKey) {
      throw new Error('Por favor, informe a Chave de Acesso.');
    }

    if (cleanKey !== policies.accessKey.trim()) {
      this.recordLog(customName || 'Equipe', 'Chave Incorreta', 'Chave de Acesso', false, 'Chave de acesso incorreta digitada');
      throw new Error('Chave de Acesso incorreta. Verifique a senha da Orientação de Estágios e tente novamente.');
    }

    const displayName = customName && customName.trim() ? customName.trim() : 'Orientação de Estágio';
    const user: AuthUser = {
      id: `key_${Date.now()}`,
      nome: displayName,
      role: 'Orientador',
      authMethod: 'Chave de Acesso',
      authenticatedAt: new Date().toISOString(),
    };

    this.saveSession(user, true);
    this.recordLog(user.nome, 'Senha da Equipe', 'Chave de Acesso', true);
    return user;
  }

  // LOGOUT
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {}
    this.saveSession(null);
  }

  // REGISTRO DE AUDITORIA DE ACESSO
  private recordLog(
    nome: string,
    identificador: string,
    metodo: 'Google' | 'Chave de Acesso',
    sucesso: boolean,
    motivo?: string
  ) {
    try {
      const logs = this.getAccessLogs();
      const newEntry: AccessLogEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        nome,
        identificador,
        metodo,
        timestamp: new Date().toISOString(),
        sucesso,
        motivo,
      };
      const updated = [newEntry, ...logs.slice(0, 29)]; // Mantém os últimos 30 acessos
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated));
    } catch {}
  }

  public getAccessLogs(): AccessLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_LOGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [];
  }

  public clearAccessLogs(): void {
    try {
      localStorage.removeItem(STORAGE_LOGS_KEY);
    } catch {}
  }
}

export const authService = new AuthService();
