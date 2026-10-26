import { EstagioFormData, EstagioRecord, ReuniaoMensal, FrequenciaItem } from '../types.ts';

const STORAGE_KEY_ESTAGIOS = 'estagios_jogos_digitais_db_v2';
const STORAGE_KEY_REUNIOES = 'reunioes_jogos_digitais_db_v1';

class ClientStorageEngine {
  // --- ESTÁGIOS ---

  private loadEstagios(): EstagioRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ESTAGIOS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      this.saveEstagios([]);
      return [];
    } catch (e) {
      console.warn('[ClientStorage] Falha ao ler localStorage:', e);
      return [];
    }
  }

  private saveEstagios(records: EstagioRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ESTAGIOS, JSON.stringify(records));
    } catch (e) {
      console.error('[ClientStorage] Erro ao salvar dados no localStorage:', e);
    }
  }

  public getAllEstagios(query?: string, statusFilter?: string, turmaFilter?: string, cursoFilter?: string): EstagioRecord[] {
    let list = this.loadEstagios();

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(r =>
        r.matricula.toLowerCase().includes(q) ||
        r.nome.toLowerCase().includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.curso && r.curso.toLowerCase().includes(q)) ||
        r.localEstagio.toLowerCase().includes(q) ||
        (r.turma && r.turma.toLowerCase().includes(q)) ||
        (r.ano && r.ano.toLowerCase().includes(q)) ||
        (r.supervisor && r.supervisor.toLowerCase().includes(q))
      );
    }

    if (statusFilter && statusFilter !== 'Todos') {
      list = list.filter(r => r.status === statusFilter);
    }

    if (turmaFilter && turmaFilter !== 'Todas') {
      list = list.filter(r => r.turma === turmaFilter);
    }

    if (cursoFilter && cursoFilter !== 'Todos') {
      list = list.filter(r => r.curso === cursoFilter);
    }

    return list;
  }

  public getEstagioById(id: string): EstagioRecord | undefined {
    const list = this.loadEstagios();
    return list.find(r => r.id === id);
  }

  public createEstagio(data: EstagioFormData): EstagioRecord {
    const list = this.loadEstagios();
    const matriculaNorm = data.matricula.trim().toLowerCase();

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
      curso: data.curso || 'Jogos',
      turma: data.turma ? data.turma.trim() : undefined,
      ano: data.ano ? data.ano.trim() : undefined,
      sexo: data.sexo || undefined,
      localEstagio: data.localEstagio.trim(),
      status: data.status || 'Ativo',
      criadoEm: now,
      atualizadoEm: now,
    };

    const updated = [newRecord, ...list];
    this.saveEstagios(updated);
    return newRecord;
  }

  public upsertEstagio(record: EstagioRecord): void {
    const list = this.loadEstagios();
    const index = list.findIndex(r => r.id === record.id || r.matricula.trim().toLowerCase() === record.matricula.trim().toLowerCase());
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    this.saveEstagios(list);
  }

  public updateEstagio(id: string, data: Partial<EstagioFormData>): EstagioRecord {
    const list = this.loadEstagios();
    const index = list.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Cadastro de estágio não encontrado para atualização.');
    }

    const current = list[index];

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
      curso: data.curso || current.curso || 'Jogos',
      turma: data.turma !== undefined ? data.turma.trim() : current.turma,
      ano: data.ano !== undefined ? data.ano.trim() : current.ano,
      sexo: data.sexo !== undefined ? data.sexo : current.sexo,
      localEstagio: data.localEstagio ? data.localEstagio.trim() : current.localEstagio,
      status: data.status || current.status,
      supervisor: data.supervisor !== undefined ? data.supervisor.trim() : current.supervisor,
      observacoes: data.observacoes !== undefined ? data.observacoes.trim() : current.observacoes,
      atualizadoEm: new Date().toISOString(),
    };

    list[index] = updatedRecord;
    this.saveEstagios(list);
    return updatedRecord;
  }

  public deleteEstagio(id: string): void {
    const list = this.loadEstagios();
    const filtered = list.filter(r => r.id !== id);
    this.saveEstagios(filtered);
  }

  public clearAllEstagios(): void {
    this.saveEstagios([]);
  }

  public importJson(imported: EstagioRecord[]): EstagioRecord[] {
    if (!Array.isArray(imported)) {
      throw new Error('Formato de arquivo JSON inválido.');
    }
    const valid = imported.filter(item => item.matricula && item.nome && item.localEstagio);
    this.saveEstagios(valid);
    return valid;
  }

  public exportJson(): string {
    const list = this.loadEstagios();
    return JSON.stringify(list, null, 2);
  }

  // --- REUNIÕES MENSAIS E FREQUÊNCIA ---

  private loadReunioes(): ReuniaoMensal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REUNIOES);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      this.saveReunioes([]);
      return [];
    } catch {
      return [];
    }
  }

  private saveReunioes(records: ReuniaoMensal[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_REUNIOES, JSON.stringify(records));
    } catch (e) {
      console.error('[ClientStorage] Erro ao salvar reuniões:', e);
    }
  }

  public getAllReunioes(): ReuniaoMensal[] {
    return this.loadReunioes().sort((a, b) => b.dataReuniao.localeCompare(a.dataReuniao));
  }

  public getReuniaoById(id: string): ReuniaoMensal | undefined {
    return this.loadReunioes().find(r => r.id === id);
  }

  public createReuniao(data: {
    mesAno: string;
    dataReuniao: string;
    pauta: string;
    observacoes?: string;
  }): ReuniaoMensal {
    const list = this.loadReunioes();
    const now = new Date().toISOString();
    const newReuniao: ReuniaoMensal = {
      id: 'reu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      mesAno: data.mesAno.trim(),
      dataReuniao: data.dataReuniao.trim(),
      pauta: data.pauta.trim(),
      observacoes: data.observacoes ? data.observacoes.trim() : undefined,
      presencas: {},
      criadoEm: now,
      atualizadoEm: now,
    };
    const updated = [newReuniao, ...list];
    this.saveReunioes(updated);
    return newReuniao;
  }

  public updateReuniao(id: string, data: Partial<ReuniaoMensal>): ReuniaoMensal {
    const list = this.loadReunioes();
    const index = list.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reunião não encontrada');
    const current = list[index];
    const updated: ReuniaoMensal = {
      ...current,
      ...data,
      id: current.id,
      presencas: data.presencas || current.presencas,
      atualizadoEm: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveReunioes(list);
    return updated;
  }

  public updateFrequencia(
    reuniaoId: string,
    alunoId: string,
    status: 'Presença' | 'Falta',
    justificativa?: string
  ): ReuniaoMensal {
    const list = this.loadReunioes();
    const index = list.findIndex(r => r.id === reuniaoId);
    if (index === -1) throw new Error('Reunião não encontrada');
    const reuniao = list[index];

    reuniao.presencas[alunoId] = {
      status,
      justificativa: justificativa ? justificativa.trim() : undefined,
      dataRegistro: new Date().toISOString(),
    };
    reuniao.atualizadoEm = new Date().toISOString();

    list[index] = reuniao;
    this.saveReunioes(list);
    return reuniao;
  }

  public deleteReuniao(id: string): void {
    const list = this.loadReunioes();
    const filtered = list.filter(r => r.id !== id);
    this.saveReunioes(filtered);
  }

  public importReunioesJson(records: ReuniaoMensal[]): ReuniaoMensal[] {
    if (Array.isArray(records)) {
      this.saveReunioes(records);
      return records;
    }
    return [];
  }
}

export const clientStorage = new ClientStorageEngine();
