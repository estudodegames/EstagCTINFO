export type TipoCurso = 'Jogos' | 'Informática' | 'Redes';

export const CURSOS_INFO: Record<TipoCurso, { nomeCurto: TipoCurso; nomeCompleto: string; cor: string }> = {
  Jogos: {
    nomeCurto: 'Jogos',
    nomeCompleto: 'Curso Técnico de Programação de Jogos Digitais',
    cor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  Informática: {
    nomeCurto: 'Informática',
    nomeCompleto: 'Curso Técnico de Informática',
    cor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  Redes: {
    nomeCurto: 'Redes',
    nomeCompleto: 'Curso Técnico de Redes',
    cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
};

export function getNomeCompletoCurso(curso?: string | null): string {
  if (curso === 'Jogos') return CURSOS_INFO.Jogos.nomeCompleto;
  if (curso === 'Informática') return CURSOS_INFO.Informática.nomeCompleto;
  if (curso === 'Redes') return CURSOS_INFO.Redes.nomeCompleto;
  return 'Curso Técnico Profissionalizante';
}

export interface EstagioRecord {
  id: string;
  matricula: string;
  nome: string;
  email?: string;
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

export type EstagioFormData = Omit<EstagioRecord, 'id' | 'criadoEm' | 'atualizadoEm'>;

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

export interface FilterState {
  search: string;
  status: string;
  turma?: string;
  curso?: string;
}
