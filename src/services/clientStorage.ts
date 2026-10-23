import { EstagioFormData, EstagioRecord } from '../types.ts';

const STORAGE_KEY = 'estagios_jogos_digitais_db_v2';

export const INITIAL_RECORDS: EstagioRecord[] = [
  {
    id: 'est-1',
    matricula: '2024-JOG-0142',
    nome: 'Lucas Gabriel Albuquerque',
    localEstagio: 'PixelForge Game Studio',
    area: 'Programação de Jogos 2D / Unity C#',
    status: 'Ativo',
    dataInicio: '2024-02-15',
    cargaHoraria: '30h',
    supervisor: 'Guilherme Bastos (Lead Dev)',
    observacoes: 'Desenvolvimento de mecânicas de combate e integração de animações.',
    criadoEm: '2024-02-10T10:00:00.000Z',
    atualizadoEm: '2024-02-10T10:00:00.000Z',
  },
  {
    id: 'est-2',
    matricula: '2024-JOG-0158',
    nome: 'Mariana Duarte Siqueira',
    localEstagio: 'IronByte Interactive',
    area: 'Programação de Inteligência Artificial / Unreal C++',
    status: 'Ativo',
    dataInicio: '2024-03-01',
    cargaHoraria: '30h',
    supervisor: 'Camila Rocha (Diretora Técnica)',
    observacoes: 'Implementação de Behavior Trees e navegação de NPCs.',
    criadoEm: '2024-02-25T14:30:00.000Z',
    atualizadoEm: '2024-02-25T14:30:00.000Z',
  }
];

class ClientStorageEngine {
  private loadRecords(): EstagioRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Retorna o array salvo exatamente como está, mesmo que esteja vazio ([])!
          // Isso garante que se o usuário deletar registros, eles NUNCA voltam sozinhos.
          return parsed;
        }
      }
      // Se ainda não houver nenhum dado inicializado, inicia com lista VAZIA ([]).
      // "Só pode aparecer o que o usuário digitar".
      this.saveRecords([]);
      return [];
    } catch (e) {
      console.warn('[ClientStorage] Falha ao ler localStorage:', e);
      return [];
    }
  }

  private saveRecords(records: EstagioRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('[ClientStorage] Erro ao salvar dados no localStorage:', e);
    }
  }

  public getAll(query?: string, statusFilter?: string): EstagioRecord[] {
    let list = this.loadRecords();

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(r =>
        r.matricula.toLowerCase().includes(q) ||
        r.nome.toLowerCase().includes(q) ||
        r.localEstagio.toLowerCase().includes(q) ||
        (r.area && r.area.toLowerCase().includes(q)) ||
        (r.supervisor && r.supervisor.toLowerCase().includes(q))
      );
    }

    if (statusFilter && statusFilter !== 'Todos') {
      list = list.filter(r => r.status === statusFilter);
    }

    return list;
  }

  public getById(id: string): EstagioRecord | undefined {
    const list = this.loadRecords();
    return list.find(r => r.id === id);
  }

  public create(data: EstagioFormData): EstagioRecord {
    const list = this.loadRecords();
    const matriculaNorm = data.matricula.trim().toLowerCase();

    // Validação de unicidade da matrícula
    const exists = list.find(r => r.matricula.trim().toLowerCase() === matriculaNorm);
    if (exists) {
      throw new Error(`A matrícula "${data.matricula.trim()}" já está cadastrada para o aluno "${exists.nome}".`);
    }

    const now = new Date().toISOString();
    const newRecord: EstagioRecord = {
      ...data,
      id: 'est-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      matricula: data.matricula.trim(),
      nome: data.nome.trim(),
      localEstagio: data.localEstagio.trim(),
      area: data.area ? data.area.trim() : 'Desenvolvimento de Jogos Digitais',
      status: data.status || 'Ativo',
      criadoEm: now,
      atualizadoEm: now,
    };

    const updated = [newRecord, ...list];
    this.saveRecords(updated);
    return newRecord;
  }

  public update(id: string, data: Partial<EstagioFormData>): EstagioRecord {
    const list = this.loadRecords();
    const index = list.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Cadastro de estágio não encontrado para atualização.');
    }

    const current = list[index];

    // Se alterou matrícula, checar colisão
    if (data.matricula) {
      const matriculaNorm = data.matricula.trim().toLowerCase();
      const duplicate = list.find(r => r.id !== id && r.matricula.trim().toLowerCase() === matriculaNorm);
      if (duplicate) {
        throw new Error(`A matrícula "${data.matricula.trim()}" já pertence ao aluno "${duplicate.nome}".`);
      }
    }

    const updatedRecord: EstagioRecord = {
      ...current,
      ...data,
      id: current.id,
      criadoEm: current.criadoEm,
      matricula: data.matricula ? data.matricula.trim() : current.matricula,
      nome: data.nome ? data.nome.trim() : current.nome,
      localEstagio: data.localEstagio ? data.localEstagio.trim() : current.localEstagio,
      atualizadoEm: new Date().toISOString(),
    };

    list[index] = updatedRecord;
    this.saveRecords(list);
    return updatedRecord;
  }

  public delete(id: string): void {
    const list = this.loadRecords();
    const filtered = list.filter(r => r.id !== id);
    // Salva exatamente a lista filtrada (mesmo que fique vazia [])
    this.saveRecords(filtered);
  }

  public resetSample(): EstagioRecord[] {
    this.saveRecords(INITIAL_RECORDS);
    return [...INITIAL_RECORDS];
  }

  public clearAll(): EstagioRecord[] {
    this.saveRecords([]);
    return [];
  }

  public importJson(imported: EstagioRecord[]): EstagioRecord[] {
    if (!Array.isArray(imported)) {
      throw new Error('Formato de arquivo JSON inválido.');
    }

    const valid = imported.filter(item => item.matricula && item.nome && item.localEstagio);
    this.saveRecords(valid);
    return valid;
  }

  public exportJson(): string {
    const list = this.loadRecords();
    return JSON.stringify(list, null, 2);
  }
}

export const clientStorage = new ClientStorageEngine();
