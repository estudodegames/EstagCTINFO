import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EstagioRecord {
  id: string;
  matricula: string;
  nome: string;
  localEstagio: string;
  area?: string;
  status?: 'Ativo' | 'Concluído' | 'Pendente';
  dataInicio?: string;
  cargaHoraria?: string;
  supervisor?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'estagios.json');

// Dados iniciais específicos para o Curso Técnico de Programação de Jogos Digitais
const INITIAL_RECORDS: EstagioRecord[] = [
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
    criadoEm: new Date('2024-02-10T10:00:00Z').toISOString(),
    atualizadoEm: new Date('2024-02-10T10:00:00Z').toISOString(),
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
    criadoEm: new Date('2024-02-25T14:30:00Z').toISOString(),
    atualizadoEm: new Date('2024-02-25T14:30:00Z').toISOString(),
  },
  {
    id: 'est-3',
    matricula: '2024-JOG-0189',
    nome: 'Rodrigo Medeiros Fontes',
    localEstagio: 'MadVoxel Entretenimento Digital',
    area: 'Programação de Shaders & Efeitos Visuais',
    status: 'Ativo',
    dataInicio: '2024-04-10',
    cargaHoraria: '20h',
    supervisor: 'Alexandre Pires (Tech Artist)',
    observacoes: 'HLSL e otimização de renderização para dispositivos mobile.',
    criadoEm: new Date('2024-04-05T09:15:00Z').toISOString(),
    atualizadoEm: new Date('2024-04-05T09:15:00Z').toISOString(),
  },
  {
    id: 'est-4',
    matricula: '2023-JOG-0094',
    nome: 'Beatriz Vasconcelos Rios',
    localEstagio: 'Hoplon Infotainment Labs',
    area: 'Backend Multiplayer & Redes para Jogos',
    status: 'Concluído',
    dataInicio: '2023-08-01',
    cargaHoraria: '30h',
    supervisor: 'Marcelo Zanin (Engenheiro de Redes)',
    observacoes: 'Carga horária total de 400 horas concluída com relatório aprovado.',
    criadoEm: new Date('2023-07-28T11:00:00Z').toISOString(),
    atualizadoEm: new Date('2024-01-20T16:00:00Z').toISOString(),
  },
  {
    id: 'est-5',
    matricula: '2024-JOG-0205',
    nome: 'Felipe Santana Moreira',
    localEstagio: 'Aquiris Studios / Epic Games Brasil',
    area: 'Quality Assurance (QA) & Testes Automatizados',
    status: 'Pendente',
    dataInicio: '2024-11-01',
    cargaHoraria: '20h',
    supervisor: 'Juliana Prado (Coordenadora de QA)',
    observacoes: 'Aguardando validação final do termo de compromisso pela coordenação.',
    criadoEm: new Date('2024-10-15T08:20:00Z').toISOString(),
    atualizadoEm: new Date('2024-10-15T08:20:00Z').toISOString(),
  }
];

class StorageService {
  private memoryCache: EstagioRecord[] = [];
  private isLoaded = false;

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): EstagioRecord[] {
    this.ensureDir();
    if (!fs.existsSync(DATA_FILE)) {
      this.memoryCache = [...INITIAL_RECORDS];
      this.persist();
      this.isLoaded = true;
      return this.memoryCache;
    }

    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        this.memoryCache = parsed;
      } else {
        this.memoryCache = [...INITIAL_RECORDS];
        this.persist();
      }
    } catch (err) {
      console.error('[StorageService] Erro ao ler arquivo de dados, recarregando padrão:', err);
      this.memoryCache = [...INITIAL_RECORDS];
      this.persist();
    }
    this.isLoaded = true;
    return this.memoryCache;
  }

  private persist() {
    this.ensureDir();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  }

  public getAll(): EstagioRecord[] {
    if (!this.isLoaded) {
      this.load();
    }
    return [...this.memoryCache];
  }

  public getById(id: string): EstagioRecord | undefined {
    if (!this.isLoaded) this.load();
    return this.memoryCache.find(r => r.id === id);
  }

  public getByMatricula(matricula: string): EstagioRecord | undefined {
    if (!this.isLoaded) this.load();
    const normalized = matricula.trim().toLowerCase();
    return this.memoryCache.find(r => r.matricula.trim().toLowerCase() === normalized);
  }

  public create(data: Omit<EstagioRecord, 'id' | 'criadoEm' | 'atualizadoEm'>): EstagioRecord {
    if (!this.isLoaded) this.load();

    const normalizedMatricula = data.matricula.trim();
    if (this.getByMatricula(normalizedMatricula)) {
      throw new Error(`A matrícula "${normalizedMatricula}" já está cadastrada para outro aluno.`);
    }

    const now = new Date().toISOString();
    const newRecord: EstagioRecord = {
      ...data,
      id: 'est-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      matricula: normalizedMatricula,
      nome: data.nome.trim(),
      localEstagio: data.localEstagio.trim(),
      criadoEm: now,
      atualizadoEm: now,
    };

    this.memoryCache.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  public update(id: string, data: Partial<Omit<EstagioRecord, 'id' | 'criadoEm'>>): EstagioRecord {
    if (!this.isLoaded) this.load();

    const index = this.memoryCache.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Estágio com ID ${id} não foi encontrado.`);
    }

    const current = this.memoryCache[index];

    // Se a matrícula foi alterada, verificar se não colide com outro registro
    if (data.matricula) {
      const normalizedMatricula = data.matricula.trim();
      const existingWithMatricula = this.memoryCache.find(
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
      localEstagio: data.localEstagio ? data.localEstagio.trim() : current.localEstagio,
      atualizadoEm: new Date().toISOString(),
    };

    this.memoryCache[index] = updatedRecord;
    this.persist();
    return updatedRecord;
  }

  public delete(id: string): boolean {
    if (!this.isLoaded) this.load();

    const initialLength = this.memoryCache.length;
    this.memoryCache = this.memoryCache.filter(r => r.id !== id);

    if (this.memoryCache.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }

  public resetSampleData(): EstagioRecord[] {
    this.memoryCache = [...INITIAL_RECORDS];
    this.persist();
    return [...this.memoryCache];
  }
}

export const storage = new StorageService();
