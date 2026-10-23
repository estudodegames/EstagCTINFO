import { EstagioFormData, EstagioRecord, ReuniaoMensal } from '../types.ts';
import { clientStorage } from './clientStorage.ts';

const CLOUD_BACKEND_URL = 'https://ais-pre-huldpf6aiilosgwiptzsfk-739851012570.us-east1.run.app';
const API_URL_KEY = 'estagios_custom_api_url';

export function getApiBaseUrl(): string {
  const customUrl = localStorage.getItem(API_URL_KEY);
  if (customUrl) {
    return customUrl.replace(/\/$/, '') + '/api';
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('netlify.app') || hostname.includes('vercel.app') || (!hostname.includes('localhost') && !hostname.includes('run.app'))) {
      return `${CLOUD_BACKEND_URL}/api`;
    }
  }

  return '/api';
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

  // ================= ESTÁGIOS =================

  async getEstagios(query?: string, status?: string, turma?: string): Promise<EstagioRecord[]> {
    const baseUrl = `${getApiBaseUrl()}/estagios`;
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'Todos') params.append('status', status);
    if (turma && turma !== 'Todas') params.append('turma', turma);

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
        if (Array.isArray(data)) {
          clientStorage.importJson(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('[API] Falha ao conectar ao servidor central, lendo cache local:', err);
      lastConnectionSuccess = false;
    }

    return clientStorage.getAllEstagios(query, status, turma);
  },

  async getEstagioById(id: string): Promise<EstagioRecord> {
    const baseUrl = `${getApiBaseUrl()}/estagios`;
    try {
      const res = await fetch(`${baseUrl}/${id}`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        lastConnectionSuccess = true;
        return await res.json();
      }
    } catch {
      lastConnectionSuccess = false;
    }

    const item = clientStorage.getEstagioById(id);
    if (!item) throw new Error('Estágio não encontrado');
    return item;
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    const baseUrl = `${getApiBaseUrl()}/estagios`;

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
        try { clientStorage.createEstagio(data); } catch {}
        return json;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('matrícula') || err.message.includes('obrigatório'))) {
        throw err;
      }
      lastConnectionSuccess = false;
    }

    return clientStorage.createEstagio(data);
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    const baseUrl = `${getApiBaseUrl()}/estagios`;

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
        try { clientStorage.updateEstagio(id, data); } catch {}
        return json;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('matrícula') || err.message.includes('branco'))) {
        throw err;
      }
      lastConnectionSuccess = false;
    }

    return clientStorage.updateEstagio(id, data);
  },

  async deleteEstagio(id: string): Promise<void> {
    const baseUrl = `${getApiBaseUrl()}/estagios`;

    try { clientStorage.deleteEstagio(id); } catch {}

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

  async clearAllEstagios(): Promise<void> {
    clientStorage.clearAllEstagios();
    const records = await this.getEstagios();
    for (const r of records) {
      await this.deleteEstagio(r.id);
    }
  },

  // ================= REUNIÕES MENSAIS & FREQUÊNCIA =================

  async getReunioes(): Promise<ReuniaoMensal[]> {
    const baseUrl = `${getApiBaseUrl()}/reunioes`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(baseUrl, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        lastConnectionSuccess = true;
        if (Array.isArray(data)) {
          clientStorage.importReunioesJson(data);
          return data;
        }
      }
    } catch {
      lastConnectionSuccess = false;
    }

    return clientStorage.getAllReunioes();
  },

  async createReuniao(data: {
    mesAno: string;
    dataReuniao: string;
    pauta: string;
    observacoes?: string;
  }): Promise<ReuniaoMensal> {
    const baseUrl = `${getApiBaseUrl()}/reunioes`;

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
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        lastConnectionSuccess = true;
        try { clientStorage.createReuniao(data); } catch {}
        return json;
      }
    } catch {
      lastConnectionSuccess = false;
    }

    return clientStorage.createReuniao(data);
  },

  async updateFrequencia(
    reuniaoId: string,
    alunoId: string,
    status: 'Presença' | 'Falta',
    justificativa?: string
  ): Promise<ReuniaoMensal> {
    const baseUrl = `${getApiBaseUrl()}/reunioes/${reuniaoId}/frequencia`;

    try {
      const res = await fetch(baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ alunoId, status, justificativa }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        lastConnectionSuccess = true;
        try { clientStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa); } catch {}
        return json;
      }
    } catch {
      lastConnectionSuccess = false;
    }

    return clientStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa);
  },

  async deleteReuniao(id: string): Promise<void> {
    const baseUrl = `${getApiBaseUrl()}/reunioes/${id}`;
    try { clientStorage.deleteReuniao(id); } catch {}

    try {
      const res = await fetch(baseUrl, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        lastConnectionSuccess = true;
      }
    } catch {
      lastConnectionSuccess = false;
    }
  },

  exportJson(): string {
    return clientStorage.exportJson();
  },

  importJson(data: EstagioRecord[]): EstagioRecord[] {
    return clientStorage.importJson(data);
  }
};
