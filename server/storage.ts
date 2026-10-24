import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type TipoCurso = 'Jogos' | 'Informática' | 'Redes';

export interface EstagioRecord {
  id: string;
  matricula: string;
  nome: string;
  curso: TipoCurso;
  turma?: string;
  ano?: string;
  sexo?: 'Masculino' | 'Feminino' | 'Outro';
  localEstagio: string;
  status?: 'Ativo' | 'Concluído' | 'Pendente';
  supervisor?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FrequenciaItem {
  status: 'Presença' | 'Falta';
  justificativa?: string;
  dataRegistro: string;
}

export interface ReuniaoMensal {
  id: string;
  mesAno: string; // Ex: "2026-10"
  dataReuniao: string; // Ex: "2026-10-22"
  pauta: string;
  observacoes?: string;
  presencas: {
    [alunoId: string]: FrequenciaItem;
  };
  criadoEm: string;
  atualizadoEm: string;
}

const DATA_DIR = path.join(__dirname, 'data');
const ESTAGIOS_FILE = path.join(DATA_DIR, 'estagios.json');
const REUNIOES_FILE = path.join(DATA_DIR, 'reunioes.json');

class StorageService {
  private estagiosCache: EstagioRecord[] = [];
  private reunioesCache: ReuniaoMensal[] = [];
  private isEstagiosLoaded = false;
  private isReunioesLoaded = false;

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  // --- ESTÁGIOS ---

  private loadEstagios(): EstagioRecord[] {
    this.ensureDir();
    if (!fs.existsSync(ESTAGIOS_FILE)) {
      this.estagiosCache = [];
      this.persistEstagios();
      this.isEstagiosLoaded = true;
      return this.estagiosCache;
    }

    try {
      const content = fs.readFileSync(ESTAGIOS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        this.estagiosCache = parsed.map((item: any) => ({
          ...item,
          curso: item.curso || 'Jogos',
        }));
      } else {
        this.estagiosCache = [];
        this.persistEstagios();
      }
    } catch (err) {
      console.error('[StorageService] Erro ao ler estagios.json:', err);
      this.estagiosCache = [];
      this.persistEstagios();
    }
    this.isEstagiosLoaded = true;
    return this.estagiosCache;
  }

  private persistEstagios() {
    this.ensureDir();
    const tempFile = `${ESTAGIOS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.estagiosCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, ESTAGIOS_FILE);
  }

  public getAllEstagios(): EstagioRecord[] {
    if (!this.isEstagiosLoaded) this.loadEstagios();
    return [...this.estagiosCache];
  }

  public getEstagioById(id: string): EstagioRecord | undefined {
    if (!this.isEstagiosLoaded) this.loadEstagios();
    return this.estagiosCache.find(r => r.id === id);
  }

  public getEstagioByMatricula(matricula: string): EstagioRecord | undefined {
    if (!this.isEstagiosLoaded) this.loadEstagios();
    const normalized = matricula.trim().toLowerCase();
    return this.estagiosCache.find(r => r.matricula.trim().toLowerCase() === normalized);
  }

  public createEstagio(data: Omit<EstagioRecord, 'id' | 'criadoEm' | 'atualizadoEm'>): EstagioRecord {
    if (!this.isEstagiosLoaded) this.loadEstagios();

    const normalizedMatricula = data.matricula.trim();
    if (this.getEstagioByMatricula(normalizedMatricula)) {
      throw new Error(`A matrícula "${normalizedMatricula}" já está cadastrada para outro aluno.`);
    }

    const now = new Date().toISOString();
    const newRecord: EstagioRecord = {
      id: 'est-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      matricula: normalizedMatricula,
      nome: data.nome.trim(),
      curso: data.curso || 'Jogos',
      turma: data.turma ? data.turma.trim() : undefined,
      ano: data.ano ? data.ano.trim() : undefined,
      sexo: data.sexo || undefined,
      localEstagio: data.localEstagio.trim(),
      status: data.status || 'Ativo',
      supervisor: data.supervisor ? data.supervisor.trim() : undefined,
      observacoes: data.observacoes ? data.observacoes.trim() : undefined,
      criadoEm: now,
      atualizadoEm: now,
    };

    this.estagiosCache.unshift(newRecord);
    this.persistEstagios();
    return newRecord;
  }

  public updateEstagio(id: string, data: Partial<Omit<EstagioRecord, 'id' | 'criadoEm'>>): EstagioRecord {
    if (!this.isEstagiosLoaded) this.loadEstagios();

    const index = this.estagiosCache.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Estágio com ID ${id} não foi encontrado.`);
    }

    const current = this.estagiosCache[index];

    if (data.matricula) {
      const normalizedMatricula = data.matricula.trim();
      const existingWithMatricula = this.estagiosCache.find(
        r => r.id !== id && r.matricula.trim().toLowerCase() === normalizedMatricula.toLowerCase()
      );
      if (existingWithMatricula) {
        throw new Error(`A matrícula "${normalizedMatricula}" já pertence ao aluno "${existingWithMatricula.nome}".`);
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

    this.estagiosCache[index] = updatedRecord;
    this.persistEstagios();
    return updatedRecord;
  }

  public deleteEstagio(id: string): boolean {
    if (!this.isEstagiosLoaded) this.loadEstagios();

    const initialLength = this.estagiosCache.length;
    this.estagiosCache = this.estagiosCache.filter(r => r.id !== id);

    if (this.estagiosCache.length !== initialLength) {
      this.persistEstagios();
      return true;
    }
    return false;
  }

  public clearAllEstagios(): void {
    this.estagiosCache = [];
    this.persistEstagios();
  }

  // --- REUNIÕES MENSAIS E FREQUÊNCIA ---

  private loadReunioes(): ReuniaoMensal[] {
    this.ensureDir();
    if (!fs.existsSync(REUNIOES_FILE)) {
      this.reunioesCache = [];
      this.persistReunioes();
      this.isReunioesLoaded = true;
      return this.reunioesCache;
    }

    try {
      const content = fs.readFileSync(REUNIOES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        this.reunioesCache = parsed;
      } else {
        this.reunioesCache = [];
        this.persistReunioes();
      }
    } catch (err) {
      console.error('[StorageService] Erro ao ler reunioes.json:', err);
      this.reunioesCache = [];
      this.persistReunioes();
    }
    this.isReunioesLoaded = true;
    return this.reunioesCache;
  }

  private persistReunioes() {
    this.ensureDir();
    const tempFile = `${REUNIOES_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.reunioesCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, REUNIOES_FILE);
  }

  public getAllReunioes(): ReuniaoMensal[] {
    if (!this.isReunioesLoaded) this.loadReunioes();
    return [...this.reunioesCache].sort((a, b) => b.dataReuniao.localeCompare(a.dataReuniao));
  }

  public getReuniaoById(id: string): ReuniaoMensal | undefined {
    if (!this.isReunioesLoaded) this.loadReunioes();
    return this.reunioesCache.find(r => r.id === id);
  }

  public createReuniao(data: {
    mesAno: string;
    dataReuniao: string;
    pauta: string;
    observacoes?: string;
  }): ReuniaoMensal {
    if (!this.isReunioesLoaded) this.loadReunioes();

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

    this.reunioesCache.unshift(newReuniao);
    this.persistReunioes();
    return newReuniao;
  }

  public updateReuniao(id: string, data: Partial<ReuniaoMensal>): ReuniaoMensal {
    if (!this.isReunioesLoaded) this.loadReunioes();

    const index = this.reunioesCache.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Reunião ${id} não encontrada.`);
    }

    const current = this.reunioesCache[index];
    const updated: ReuniaoMensal = {
      ...current,
      ...data,
      id: current.id,
      presencas: data.presencas || current.presencas,
      atualizadoEm: new Date().toISOString(),
    };

    this.reunioesCache[index] = updated;
    this.persistReunioes();
    return updated;
  }

  public updateFrequencia(
    reuniaoId: string,
    alunoId: string,
    status: 'Presença' | 'Falta',
    justificativa?: string
  ): ReuniaoMensal {
    if (!this.isReunioesLoaded) this.loadReunioes();

    const reuniao = this.getReuniaoById(reuniaoId);
    if (!reuniao) {
      throw new Error('Reunião não encontrada.');
    }

    reuniao.presencas[alunoId] = {
      status,
      justificativa: justificativa ? justificativa.trim() : undefined,
      dataRegistro: new Date().toISOString(),
    };
    reuniao.atualizadoEm = new Date().toISOString();

    this.persistReunioes();
    return reuniao;
  }

  public deleteReuniao(id: string): boolean {
    if (!this.isReunioesLoaded) this.loadReunioes();

    const initialLength = this.reunioesCache.length;
    this.reunioesCache = this.reunioesCache.filter(r => r.id !== id);

    if (this.reunioesCache.length !== initialLength) {
      this.persistReunioes();
      return true;
    }
    return false;
  }
}

export const storage = new StorageService();
