import { EstagioFormData, EstagioRecord } from '../types.ts';
import { clientStorage } from './clientStorage.ts';

const BASE_URL = '/api/estagios';

// Armazena em cache se o backend Express está ativo ou se estamos em ambiente estático (Netlify/Vercel)
let backendAvailable: boolean | null = null;

async function checkBackendAvailability(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(BASE_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      backendAvailable = true;
    } else {
      backendAvailable = false;
    }
  } catch {
    backendAvailable = false;
  }

  return backendAvailable;
}

export const api = {
  async getStorageMode(): Promise<'backend' | 'client'> {
    const isBackend = await checkBackendAvailability();
    return isBackend ? 'backend' : 'client';
  },

  async getEstagios(query?: string, status?: string): Promise<EstagioRecord[]> {
    const isBackend = await checkBackendAvailability();

    if (isBackend) {
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (status && status !== 'Todos') params.append('status', status);

        const url = `${BASE_URL}?${params.toString()}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        const contentType = res.headers.get('content-type') || '';

        if (res.ok && contentType.includes('application/json')) {
          return await res.json();
        }
        // Se a resposta não for JSON (ex: página 404 do Netlify), fallback para o armazenamento local
        backendAvailable = false;
      } catch (err) {
        console.warn('[API] Servidor backend indisponível, usando armazenamento local do navegador:', err);
        backendAvailable = false;
      }
    }

    // Modo cliente / Netlify
    return clientStorage.getAll(query, status);
  },

  async getEstagioById(id: string): Promise<EstagioRecord> {
    const isBackend = await checkBackendAvailability();

    if (isBackend) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { headers: { Accept: 'application/json' } });
        if (res.ok) return await res.json();
      } catch {
        backendAvailable = false;
      }
    }

    const item = clientStorage.getById(id);
    if (!item) throw new Error('Estágio não encontrado');
    return item;
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    const isBackend = await checkBackendAvailability();

    if (isBackend) {
      try {
        const res = await fetch(BASE_URL, {
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
          return json;
        }

        // Se retornou HTML (ex: 404 do Netlify), fallback
        backendAvailable = false;
      } catch (err: any) {
        // Se o erro for de validação da API (ex: matrícula duplicada), repassa o erro
        if (err.message && err.message.includes('matrícula')) {
          throw err;
        }
        console.warn('[API] Falha de comunicação com /api/estagios, salvando localmente:', err);
        backendAvailable = false;
      }
    }

    // Modo cliente / Netlify: salva localmente com todas as validações e persistência
    return clientStorage.create(data);
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    const isBackend = await checkBackendAvailability();

    if (isBackend) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
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
          return json;
        }

        backendAvailable = false;
      } catch (err: any) {
        if (err.message && err.message.includes('matrícula')) {
          throw err;
        }
        backendAvailable = false;
      }
    }

    return clientStorage.update(id, data);
  },

  async deleteEstagio(id: string): Promise<void> {
    const isBackend = await checkBackendAvailability();

    if (isBackend) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return;
        }

        backendAvailable = false;
      } catch {
        backendAvailable = false;
      }
    }

    clientStorage.delete(id);
  },

  async resetSample(): Promise<EstagioRecord[]> {
    const isBackend = await checkBackendAvailability();

    if (isBackend) {
      try {
        const res = await fetch(`${BASE_URL}/reset-sample`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          return data.records;
        }
      } catch {
        backendAvailable = false;
      }
    }

    return clientStorage.resetSample();
  },

  exportJson(): string {
    return clientStorage.exportJson();
  },

  importJson(data: EstagioRecord[]): EstagioRecord[] {
    return clientStorage.importJson(data);
  }
};
