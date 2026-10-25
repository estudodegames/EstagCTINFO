import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { EstagioFormData, EstagioRecord, ReuniaoMensal, FrequenciaItem } from '../types.ts';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const ESTAGIOS_COLLECTION = 'estagios';
const REUNIOES_COLLECTION = 'reunioes';

export const firestoreStorage = {
  // ==================== ESTÁGIOS ====================

  async getAllEstagios(): Promise<EstagioRecord[]> {
    try {
      const colRef = collection(db, ESTAGIOS_COLLECTION);
      const snapshot = await getDocs(colRef);
      const list: EstagioRecord[] = [];
      snapshot.forEach((d) => {
        if (d.id !== '__connection_ping__') {
          list.push(d.data() as EstagioRecord);
        }
      });
      // Ordena por data de criação decrescente
      return list.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, ESTAGIOS_COLLECTION);
    }
  },

  async getEstagioById(id: string): Promise<EstagioRecord | null> {
    try {
      const docRef = doc(db, ESTAGIOS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as EstagioRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${ESTAGIOS_COLLECTION}/${id}`);
    }
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    const id = `est_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const record: EstagioRecord = {
      id,
      matricula: data.matricula.trim(),
      nome: data.nome.trim(),
      curso: data.curso || 'Jogos',
      turma: data.turma?.trim() || undefined,
      ano: data.ano?.trim() || undefined,
      sexo: data.sexo || undefined,
      localEstagio: data.localEstagio.trim(),
      status: data.status || 'Ativo',
      supervisor: data.supervisor?.trim() || undefined,
      observacoes: data.observacoes?.trim() || undefined,
      criadoEm: now,
      atualizadoEm: now,
    };

    try {
      const docRef = doc(db, ESTAGIOS_COLLECTION, id);
      await setDoc(docRef, record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${ESTAGIOS_COLLECTION}/${id}`);
    }
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    try {
      const current = await this.getEstagioById(id);
      if (!current) throw new Error('Estágio não encontrado para atualização.');

      const updated: EstagioRecord = {
        ...current,
        ...(data.matricula !== undefined && { matricula: data.matricula.trim() }),
        ...(data.nome !== undefined && { nome: data.nome.trim() }),
        ...(data.curso !== undefined && { curso: data.curso }),
        ...(data.turma !== undefined && { turma: data.turma.trim() }),
        ...(data.ano !== undefined && { ano: data.ano.trim() }),
        ...(data.sexo !== undefined && { sexo: data.sexo }),
        ...(data.localEstagio !== undefined && { localEstagio: data.localEstagio.trim() }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.supervisor !== undefined && { supervisor: data.supervisor.trim() }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes.trim() }),
        atualizadoEm: new Date().toISOString(),
      };

      const docRef = doc(db, ESTAGIOS_COLLECTION, id);
      await setDoc(docRef, updated);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${ESTAGIOS_COLLECTION}/${id}`);
    }
  },

  async deleteEstagio(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, ESTAGIOS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${ESTAGIOS_COLLECTION}/${id}`);
    }
  },

  async clearAllEstagios(): Promise<void> {
    try {
      const all = await this.getAllEstagios();
      for (const item of all) {
        await this.deleteEstagio(item.id);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, ESTAGIOS_COLLECTION);
    }
  },

  // ==================== REUNIÕES MENSAIS ====================

  async getAllReunioes(): Promise<ReuniaoMensal[]> {
    try {
      const colRef = collection(db, REUNIOES_COLLECTION);
      const snapshot = await getDocs(colRef);
      const list: ReuniaoMensal[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ReuniaoMensal);
      });
      return list.sort((a, b) => b.dataReuniao.localeCompare(a.dataReuniao));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, REUNIOES_COLLECTION);
    }
  },

  async createReuniao(data: {
    mesAno: string;
    dataReuniao: string;
    pauta: string;
    observacoes?: string;
  }): Promise<ReuniaoMensal> {
    const id = `reu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const reuniao: ReuniaoMensal = {
      id,
      mesAno: data.mesAno,
      dataReuniao: data.dataReuniao,
      pauta: data.pauta,
      observacoes: data.observacoes || '',
      presencas: {},
      criadoEm: now,
      atualizadoEm: now,
    };

    try {
      const docRef = doc(db, REUNIOES_COLLECTION, id);
      await setDoc(docRef, reuniao);
      return reuniao;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${REUNIOES_COLLECTION}/${id}`);
    }
  },

  async updateFrequencia(
    reuniaoId: string,
    alunoId: string,
    status: 'Presença' | 'Falta',
    justificativa?: string
  ): Promise<ReuniaoMensal> {
    try {
      const docRef = doc(db, REUNIOES_COLLECTION, reuniaoId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new Error('Reunião não encontrada.');

      const current = snapshot.data() as ReuniaoMensal;
      const novoItem: FrequenciaItem = {
        status,
        dataRegistro: new Date().toISOString(),
        justificativa: justificativa || undefined,
      };

      const updatedPresencas: Record<string, FrequenciaItem> = {
        ...current.presencas,
        [alunoId]: novoItem,
      };

      const updated: ReuniaoMensal = {
        ...current,
        presencas: updatedPresencas,
        atualizadoEm: new Date().toISOString(),
      };

      await setDoc(docRef, updated);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${REUNIOES_COLLECTION}/${reuniaoId}`);
    }
  },

  async deleteReuniao(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, REUNIOES_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${REUNIOES_COLLECTION}/${id}`);
    }
  },
};
