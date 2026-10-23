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

export type EstagioFormData = Omit<EstagioRecord, 'id' | 'criadoEm' | 'atualizadoEm'>;

export interface FilterState {
  search: string;
  status: string;
}
