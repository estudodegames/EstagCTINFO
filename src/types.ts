export interface EstagioRecord {
  id: string;
  matricula: string;
  nome: string;
  turma?: string;
  ano?: string;
  sexo?: 'Masculino' | 'Feminino' | 'Outro';
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
}
