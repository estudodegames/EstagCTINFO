import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { EstagioFormData, EstagioRecord, ReuniaoMensal, FrequenciaItem, TipoCurso } from '../types.ts';

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
  throw new Error(error instanceof Error ? error.message : JSON.stringify(errInfo));
}

/**
 * Remove qualquer propriedade cujo valor seja undefined ou null antes de enviar ao Firestore.
 * O Firestore rejeita objetos que contenham chaves com valor undefined.
 */
function cleanFirestoreObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = cleanFirestoreObject(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
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
      const data = snapshot.data() as EstagioRecord;
      return { ...data, id: data.id || id };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${ESTAGIOS_COLLECTION}/${id}`);
    }
  },

  async createEstagio(data: EstagioFormData): Promise<EstagioRecord> {
    const id = `est_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const docData: Record<string, any> = {
      id,
      matricula: data.matricula.trim(),
      nome: data.nome.trim(),
      curso: data.curso || 'Jogos',
      localEstagio: data.localEstagio.trim(),
      status: data.status || 'Ativo',
      criadoEm: now,
      atualizadoEm: now,
    };

    if (data.email && data.email.trim()) docData.email = data.email.trim();
    if (data.turma && data.turma.trim()) docData.turma = data.turma.trim();
    if (data.ano && data.ano.trim()) docData.ano = data.ano.trim();
    if (data.sexo) docData.sexo = data.sexo;
    if (data.supervisor && data.supervisor.trim()) docData.supervisor = data.supervisor.trim();
    if (data.observacoes && data.observacoes.trim()) docData.observacoes = data.observacoes.trim();

    try {
      const docRef = doc(db, ESTAGIOS_COLLECTION, id);
      const cleaned = cleanFirestoreObject(docData);
      await setDoc(docRef, cleaned);
      return cleaned as EstagioRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${ESTAGIOS_COLLECTION}/${id}`);
    }
  },

  async updateEstagio(id: string, data: Partial<EstagioFormData>): Promise<EstagioRecord> {
    try {
      const current = await this.getEstagioById(id);
      if (!current) throw new Error('Estágio não encontrado para atualização.');

      const now = new Date().toISOString();
      const updated: Record<string, any> = {
        ...current,
        id: current.id,
        matricula: data.matricula !== undefined ? data.matricula.trim() : current.matricula,
        nome: data.nome !== undefined ? data.nome.trim() : current.nome,
        curso: (data.curso || current.curso || 'Jogos') as TipoCurso,
        localEstagio: data.localEstagio !== undefined ? data.localEstagio.trim() : current.localEstagio,
        status: data.status || current.status || 'Ativo',
        criadoEm: current.criadoEm || now,
        atualizadoEm: now,
      };

      if (data.email !== undefined) {
        if (data.email.trim()) updated.email = data.email.trim();
        else delete updated.email;
      }
      if (data.turma !== undefined) {
        if (data.turma.trim()) updated.turma = data.turma.trim();
        else delete updated.turma;
      }
      if (data.ano !== undefined) {
        if (data.ano.trim()) updated.ano = data.ano.trim();
        else delete updated.ano;
      }
      if (data.sexo !== undefined) {
        if (data.sexo) updated.sexo = data.sexo;
        else delete updated.sexo;
      }
      if (data.supervisor !== undefined) {
        if (data.supervisor.trim()) updated.supervisor = data.supervisor.trim();
        else delete updated.supervisor;
      }
      if (data.observacoes !== undefined) {
        if (data.observacoes.trim()) updated.observacoes = data.observacoes.trim();
        else delete updated.observacoes;
      }

      const docRef = doc(db, ESTAGIOS_COLLECTION, id);
      const cleaned = cleanFirestoreObject(updated);
      await setDoc(docRef, cleaned);
      return cleaned as EstagioRecord;
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
      const seenIds = new Set<string>();

      snapshot.forEach((d) => {
        const item = d.data() as ReuniaoMensal;
        const recId = item.id || d.id;
        if (!seenIds.has(recId)) {
          seenIds.add(recId);
          list.push({ ...item, id: recId });
        }
      });
      return list.sort((a, b) => (b.dataReuniao || '').localeCompare(a.dataReuniao || ''));
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
    const docData: Record<string, any> = {
      id,
      mesAno: data.mesAno.trim(),
      dataReuniao: data.dataReuniao.trim(),
      pauta: data.pauta.trim(),
      presencas: {},
      criadoEm: now,
      atualizadoEm: now,
    };

    if (data.observacoes && data.observacoes.trim()) {
      docData.observacoes = data.observacoes.trim();
    }

    try {
      const docRef = doc(db, REUNIOES_COLLECTION, id);
      const cleaned = cleanFirestoreObject(docData);
      await setDoc(docRef, cleaned);
      return cleaned as ReuniaoMensal;
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
      const novoItem: Record<string, any> = {
        status,
        dataRegistro: new Date().toISOString(),
      };
      if (justificativa && justificativa.trim()) {
        novoItem.justificativa = justificativa.trim();
      }

      const updatedPresencas: Record<string, FrequenciaItem> = {
        ...(current.presencas || {}),
        [alunoId]: novoItem as FrequenciaItem,
      };

      const updated: ReuniaoMensal = {
        ...current,
        id: current.id || reuniaoId,
        presencas: updatedPresencas,
        atualizadoEm: new Date().toISOString(),
      };

      const cleaned = cleanFirestoreObject(updated);
      await setDoc(docRef, cleaned);
      return cleaned as ReuniaoMensal;
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
