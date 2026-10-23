import { EstagioFormData, EstagioRecord } from '../types.ts';
import { clientStorage } from './clientStorage.ts';

// URL do servidor central na nuvem (Cloud Run)
const CLOUD_BACKEND_URL = 'https://ais-pre-huldpf6aiilosgwiptzsfk-739851012570.us-east1.run.app';
const API_URL_KEY = 'estagios_custom_api_url';

/**
 * Obtém a URL base da API REST:
 * - Se estiver rodando no mesmo host (localhost ou run.app): usa caminho relativo '/api/estagios'
 * - Se estiver rodando no Netlify (estagioeter.netlify.app): conecta à URL do servidor central na nuvem
 */
export function getApiBaseUrl(): string {
  // Permite override manual caso o usuário queira configurar outra URL
  const customUrl = localStorage.getItem(API_URL_KEY);
  if (customUrl) {
    return customUrl.replace(/\/$/, '') + '/api/estagios';
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Se estiver no Netlify ou qualquer outro domínio externo, usa o backend em nuvem
    if (hostname.includes('netlify.app') || hostname.includes('vercel.app') || (!hostname.includes('localhost') && !hostname.includes('run.app'))) {
      return `${CLOUD_BACKEND_URL}/api/estagios`;
    }
  }

  // No preview local / Cloud Run do AI Studio
  return '/api/estagios';
}

export function setCustomApiUrl(url: string | null) {
  if (url && url.trim()) {
    localStorage.setItem(API_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(API_URL_KEY);
  }
}

let lastConnectionSuccess = false;

export const api = {
  isBackendConnected(): boolean {
    return lastConnectionSuccess;
  },

  async getEstagios(query?: string, status?: string): Promise<EstagioRecord[]> {
    const baseUrl = getApiBaseUrl();
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'Todos') params.append('status', status);

    const url = `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        lastConnectionSuccess = true;
        // Atualiza réplica local com os dados reais do servidor
        if (Array.isArray(data)) {
          clientStorage.importJson(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('[API] Falha ao conectar ao servidor central, lendo cache local:', err);
      lastConnectionSuccess = false;
    }

    // Se o backend estiver inacessível, usa o armazenamento local
    return clientStorage.getAll(query, status);
  },

  async getEstagioById(id: string): Promise<EstagioRecord> {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        lastConnectionSuccess = true;
        return await res.json();
      }
    } catch {
      lastConnectionSuccess = false;
    }

    const item = clientStorage.getById(id);
    if (!item) throw new Error('Estágio não encontrado');
    return item;
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Erro ao cadastrar estágio');
        }
        lastConnectionSuccess = true;
        // Salva na réplica local também
        try { clientStorage.create(data); } catch { /* ignore if already exists */ }
        return json;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('matrícula') || err.message.includes('obrigatório'))) {
        throw err;
      }
      console.warn('[API] Erro de rede com backend central, salvando no armazenamento local:', err);
      lastConnectionSuccess = false;
    }

    // Fallback local se o servidor estiver temporariamente fora
    return clientStorage.create(data);
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Erro ao atualizar estágio');
        }
        lastConnectionSuccess = true;
        try { clientStorage.update(id, data); } catch {}
        return json;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('matrícula') || err.message.includes('branco'))) {
        throw err;
      }
      lastConnectionSuccess = false;
    }

    return clientStorage.update(id, data);
  },

  async deleteEstagio(id: string): Promise<void> {
    const baseUrl = getApiBaseUrl();

    // Remove SEMPRE do cache local primeiro para nunca mais reaparecer na tela
    try {
      clientStorage.delete(id);
    } catch (e) {
      console.warn('Erro ao remover do cache local:', e);
    }

    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        lastConnectionSuccess = true;
        return;
      }
    } catch {
      lastConnectionSuccess = false;
    }
  },

  async resetSample(): Promise<EstagioRecord[]> {
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/reset-sample`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        lastConnectionSuccess = true;
        clientStorage.importJson(data.records);
        return data.records;
      }
    } catch {
      lastConnectionSuccess = false;
    }

    return clientStorage.resetSample();
  },

  async clearAll(): Promise<void> {
    clientStorage.clearAll();
    const records = await this.getEstagios();
    for (const r of records) {
      await this.deleteEstagio(r.id);
    }
  },

  exportJson(): string {
    return clientStorage.exportJson();
  },

  importJson(data: EstagioRecord[]): EstagioRecord[] {
    return clientStorage.importJson(data);
  }
};
