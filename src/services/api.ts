import { EstagioFormData, EstagioRecord, ReuniaoMensal } from '../types.ts';
import { firestoreStorage } from './firestoreStorage.ts';
import { clientStorage } from './clientStorage.ts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.ts';

let isCloudConnected = true;
let initialMigrationDone = false;

/**
 * Serviço de API Híbrido com Firestore Cloud em tempo real
 * Garante que múltiplos computadores (Computer A e Computer B) e a publicação no Netlify
 * compartilhem exatamente a mesma base de dados em tempo real.
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
      // 1. Tenta carregar do Firestore (Nuvem em tempo real)
      const cloudRecords = await firestoreStorage.getAllEstagios();
      isCloudConnected = true;

      // Migração inicial transparente: se a nuvem estiver vazia e o computador local tiver dados, envia para a nuvem
      if (!initialMigrationDone && cloudRecords.length === 0) {
        initialMigrationDone = true;
        const localRecords = clientStorage.getAllEstagios();
        if (localRecords.length > 0) {
          console.log('[Sincronização] Enviando registros locais para o banco em nuvem...');
          for (const rec of localRecords) {
            await firestoreStorage.createEstagio(rec);
          }
          return await firestoreStorage.getAllEstagios();
        }
      }

      // Sincroniza cache local para redundância
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
    } catch (err) {
      console.warn('[API Cloud] Firestore indisponível no momento, usando cache local:', err);
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
    try {
      // Grava no Firestore na nuvem
      const created = await firestoreStorage.createEstagio(data);
      isCloudConnected = true;
      try { clientStorage.createEstagio(data); } catch {}
      return created;
    } catch (err: any) {
      console.warn('[API Cloud] Falha ao gravar no Firestore, salvando localmente:', err);
      isCloudConnected = false;
      return clientStorage.createEstagio(data);
    }
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    try {
      const updated = await firestoreStorage.updateEstagio(id, data);
      isCloudConnected = true;
      try { clientStorage.updateEstagio(id, data); } catch {}
      return updated;
    } catch (err: any) {
      console.warn('[API Cloud] Falha ao atualizar no Firestore, atualizando localmente:', err);
      isCloudConnected = false;
      return clientStorage.updateEstagio(id, data);
    }
  },

  async deleteEstagio(id: string): Promise<void> {
    try { clientStorage.deleteEstagio(id); } catch {}

    try {
      await firestoreStorage.deleteEstagio(id);
      isCloudConnected = true;
    } catch (err) {
      console.warn('[API Cloud] Falha ao excluir do Firestore:', err);
      isCloudConnected = false;
    }
  },

  async clearAllEstagios(): Promise<void> {
    try { clientStorage.clearAllEstagios(); } catch {}

    try {
      await firestoreStorage.clearAllEstagios();
      isCloudConnected = true;
    } catch (err) {
      console.warn('[API Cloud] Falha ao limpar Firestore:', err);
      isCloudConnected = false;
    }
  },

  // ================= REUNIÕES MENSAIS & FREQUÊNCIA =================

  async getReunioes(): Promise<ReuniaoMensal[]> {
    try {
      const cloudReunioes = await firestoreStorage.getAllReunioes();
      isCloudConnected = true;

      // Se nuvem estiver vazia, migra locais
      if (cloudReunioes.length === 0) {
        const localReunioes = clientStorage.getAllReunioes();
        if (localReunioes.length > 0) {
          for (const r of localReunioes) {
            await firestoreStorage.createReuniao(r);
          }
          return await firestoreStorage.getAllReunioes();
        }
      }

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
      try { clientStorage.createReuniao(data); } catch {}
      return created;
    } catch (err) {
      isCloudConnected = false;
      return clientStorage.createReuniao(data);
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
      try { clientStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa); } catch {}
      return updated;
    } catch (err) {
      isCloudConnected = false;
      return clientStorage.updateFrequencia(reuniaoId, alunoId, status, justificativa);
    }
  },

  async deleteReuniao(id: string): Promise<void> {
    try { clientStorage.deleteReuniao(id); } catch {}

    try {
      await firestoreStorage.deleteReuniao(id);
      isCloudConnected = true;
    } catch {
      isCloudConnected = false;
    }
  },

  // Escuta em tempo real para sincronização instantânea sem necessidade de reload
  subscribeToChanges(
    onEstagiosUpdate: (records: EstagioRecord[]) => void,
    onReunioesUpdate: (reunioes: ReuniaoMensal[]) => void
  ) {
    const unsubEstagios = onSnapshot(
      collection(db, 'estagios'),
      (snapshot) => {
        const list: EstagioRecord[] = [];
        snapshot.forEach((d) => {
          if (d.id !== '__connection_ping__') {
            list.push(d.data() as EstagioRecord);
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
        snapshot.forEach((d) => {
          list.push(d.data() as ReuniaoMensal);
        });
        list.sort((a, b) => b.dataReuniao.localeCompare(a.dataReuniao));
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
