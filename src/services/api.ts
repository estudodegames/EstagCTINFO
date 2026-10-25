import { EstagioFormData, EstagioRecord, ReuniaoMensal } from '../types.ts';
import { firestoreStorage } from './firestoreStorage.ts';
import { clientStorage } from './clientStorage.ts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.ts';

let isCloudConnected = true;

/**
 * Serviço de API Cloud em tempo real usando Google Cloud Firestore
 * Compartilha dados instantaneamente entre múltiplos computadores (ex: Computador A, Computador B)
 * e o link de produção no Netlify sem duplicidade ou desaparecimento de cadastros.
 */
export const api = {
  isBackendConnected(): boolean {
    return isCloudConnected;
  },

  // ================= ESTÁGIOS =================

  async getEstagios(
    query?: string,
    status?: string,
    turma?: string,
    curso?: string
  ): Promise<EstagioRecord[]> {
    try {
      // 1. Carrega registros oficiais do Firestore
      const cloudRecords = await firestoreStorage.getAllEstagios();
      isCloudConnected = true;

      // Sincroniza cache local com a nuvem
      clientStorage.importJson(cloudRecords);

      let filtered = cloudRecords;
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.matricula.toLowerCase().includes(q) ||
            r.nome.toLowerCase().includes(q) ||
            (r.curso && r.curso.toLowerCase().includes(q)) ||
            r.localEstagio.toLowerCase().includes(q) ||
            (r.turma && r.turma.toLowerCase().includes(q)) ||
            (r.ano && r.ano.toLowerCase().includes(q)) ||
            (r.supervisor && r.supervisor.toLowerCase().includes(q))
        );
      }
      if (status && status !== 'Todos') {
        filtered = filtered.filter((r) => r.status === status);
      }
      if (turma && turma !== 'Todas') {
        filtered = filtered.filter((r) => r.turma === turma);
      }
      if (curso && curso !== 'Todos') {
        filtered = filtered.filter((r) => r.curso === curso);
      }

      return filtered;
    } catch (err: any) {
      console.warn('[API Cloud] Falha ao consultar Firestore, utilizando cache local:', err);
      isCloudConnected = false;
      return clientStorage.getAllEstagios(query, status, turma, curso);
    }
  },

  async getEstagioById(id: string): Promise<EstagioRecord> {
    try {
      const record = await firestoreStorage.getEstagioById(id);
      if (record) {
        isCloudConnected = true;
        return record;
      }
    } catch {
      isCloudConnected = false;
    }

    const local = clientStorage.getEstagioById(id);
    if (!local) throw new Error('Estágio não encontrado.');
    return local;
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    // 1. Grava no Firestore na nuvem
    try {
      const created = await firestoreStorage.createEstagio(data);
      isCloudConnected = true;
      try {
        clientStorage.upsertEstagio(created);
      } catch (cacheErr) {
        console.warn('[Cache] Falha ao salvar no cache local:', cacheErr);
      }
      return created;
    } catch (err: any) {
      console.error('[API Cloud] Erro ao gravar aluno no Firestore:', err);
      // Se estiver totalmente offline, salva localmente
      if (!window.navigator.onLine) {
        isCloudConnected = false;
        return clientStorage.createEstagio(data);
      }
      throw new Error(`Falha ao salvar no banco em nuvem: ${err.message || 'Erro desconhecido'}`);
    }
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    try {
      const updated = await firestoreStorage.updateEstagio(id, data);
      isCloudConnected = true;
      try {
        clientStorage.upsertEstagio(updated);
      } catch {}
      return updated;
    } catch (err: any) {
      console.error('[API Cloud] Erro ao atualizar no Firestore:', err);
      if (!window.navigator.onLine) {
        isCloudConnected = false;
        return clientStorage.updateEstagio(id, data);
      }
      throw new Error(`Falha ao atualizar no banco em nuvem: ${err.message || 'Erro desconhecido'}`);
    }
  },

  async deleteEstagio(id: string): Promise<void> {
    try {
      clientStorage.deleteEstagio(id);
    } catch {}

    try {
      await firestoreStorage.deleteEstagio(id);
      isCloudConnected = true;
    } catch (err: any) {
      console.warn('[API Cloud] Falha ao excluir do Firestore:', err);
      isCloudConnected = false;
      throw new Error(`Falha ao excluir no banco em nuvem: ${err.message || 'Erro desconhecido'}`);
    }
  },

  async clearAllEstagios(): Promise<void> {
    try {
      clientStorage.clearAllEstagios();
    } catch {}

    try {
      await firestoreStorage.clearAllEstagios();
      isCloudConnected = true;
    } catch (err: any) {
      console.warn('[API Cloud] Falha ao limpar Firestore:', err);
      isCloudConnected = false;
      throw new Error(`Falha ao limpar banco em nuvem: ${err.message || 'Erro desconhecido'}`);
    }
  },

  // ================= REUNIÕES MENSAIS & FREQUÊNCIA =================

  async getReunioes(): Promise<ReuniaoMensal[]> {
    try {
      const cloudReunioes = await firestoreStorage.getAllReunioes();
      isCloudConnected = true;
      clientStorage.importReunioesJson(cloudReunioes);
      return cloudReunioes;
    } catch (err) {
      console.warn('[API Cloud] Falha ao listar reuniões da nuvem:', err);
      isCloudConnected = false;
      return clientStorage.getAllReunioes();
    }
  },

  async createReuniao(data: {
    mesAno: string;
    dataReuniao: string;
    pauta: string;
    observacoes?: string;
  }): Promise<ReuniaoMensal> {
    try {
      const created = await firestoreStorage.createReuniao(data);
      isCloudConnected = true;
      try {
        clientStorage.importReunioesJson([created, ...clientStorage.getAllReunioes().filter(r => r.id !== created.id)]);
      } catch {}
      return created;
    } catch (err: any) {
      console.error('[API Cloud] Erro ao criar reunião no Firestore:', err);
      if (!window.navigator.onLine) {
        isCloudConnected = false;
        return clientStorage.createReuniao(data);
      }
      throw new Error(`Falha ao cadastrar reunião na nuvem: ${err.message || 'Erro desconhecido'}`);
    }
  },

  async updateFrequencia(
    reuniaoId: string,
    alunoId: string,
    status: 'Presença' | 'Falta',
    justificativa?: string
  ): Promise<ReuniaoMensal> {
    try {
      const updated = await firestoreStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa);
      isCloudConnected = true;
      try {
        clientStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa);
      } catch {}
      return updated;
    } catch (err: any) {
      console.error('[API Cloud] Erro ao registrar presença no Firestore:', err);
      if (!window.navigator.onLine) {
        isCloudConnected = false;
        return clientStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa);
      }
      throw new Error(`Falha ao salvar presença na nuvem: ${err.message || 'Erro desconhecido'}`);
    }
  },

  async deleteReuniao(id: string): Promise<void> {
    try {
      clientStorage.deleteReuniao(id);
    } catch {}

    try {
      await firestoreStorage.deleteReuniao(id);
      isCloudConnected = true;
    } catch (err: any) {
      isCloudConnected = false;
      throw new Error(`Falha ao remover reunião: ${err.message || 'Erro'}`);
    }
  },

  // Escuta em tempo real para sincronização instantânea entre computadores e abas
  subscribeToChanges(
    onEstagiosUpdate: (records: EstagioRecord[]) => void,
    onReunioesUpdate: (reunioes: ReuniaoMensal[]) => void
  ) {
    const unsubEstagios = onSnapshot(
      collection(db, 'estagios'),
      (snapshot) => {
        const list: EstagioRecord[] = [];
        const seenIds = new Set<string>();

        snapshot.forEach((d) => {
          if (d.id !== '__connection_ping__') {
            const item = d.data() as EstagioRecord;
            const recId = item.id || d.id;
            if (!seenIds.has(recId)) {
              seenIds.add(recId);
              list.push({ ...item, id: recId });
            }
          }
        });
        list.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
        onEstagiosUpdate(list);
      },
      (error) => {
        console.warn('[Firestore onSnapshot estagios]', error);
      }
    );

    const unsubReunioes = onSnapshot(
      collection(db, 'reunioes'),
      (snapshot) => {
        const list: ReuniaoMensal[] = [];
        const seenIds = new Set<string>();

        snapshot.forEach((d) => {
          const item = d.data() as ReuniaoMensal;
          const recId = item.id || d.id;
          if (!seenIds.has(recId)) {
            seenIds.add(recId);
            list.push({ ...item, id: recId });
          }
        });
        list.sort((a, b) => (b.dataReuniao || '').localeCompare(a.dataReuniao || ''));
        onReunioesUpdate(list);
      },
      (error) => {
        console.warn('[Firestore onSnapshot reunioes]', error);
      }
    );

    return () => {
      unsubEstagios();
      unsubReunioes();
    };
  },

  exportJson(): string {
    return clientStorage.exportJson();
  },

  importJson(data: EstagioRecord[]): EstagioRecord[] {
    return clientStorage.importJson(data);
  },
};
