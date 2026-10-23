import { EstagioFormData, EstagioRecord } from '../types.ts';

const BASE_URL = '/api/estagios';

export const api = {
  async getEstagios(query?: string, status?: string): Promise<EstagioRecord[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'Todos') params.append('status', status);

    const url = `${BASE_URL}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Falha ao buscar estágios');
    }
    return res.json();
  },

  async getEstagioById(id: string): Promise<EstagioRecord> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Estágio não encontrado');
    }
    return res.json();
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao cadastrar estágio');
    }
    return res.json();
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao atualizar estágio');
    }
    return res.json();
  },

  async deleteEstagio(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao excluir estágio');
    }
  },

  async resetSample(): Promise<EstagioRecord[]> {
    const res = await fetch(`${BASE_URL}/reset-sample`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao restaurar dados padrão');
    }
    const data = await res.json();
    return data.records;
  }
};
