import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EstagioRecord, ReuniaoMensal, getNomeCompletoCurso } from '../types.ts';

/**
 * Gerador oficial de PDFs vetoriais de alta fidelidade
 * Utiliza jsPDF e autoTable diretamente, garantindo 100% de compatibilidade,
 * sem erros de renderização DOM, cores oklch ou cortes de página.
 */

interface DeclaracaoPdfOptions {
  aluno: EstagioRecord;
  reuniao: ReuniaoMensal;
  dataEmissaoFormatada: string;
}

/**
 * Gera e faz download da Declaração de Comparecimento oficial em PDF
 */
export function generateDeclaracaoPDF({
  aluno,
  reuniao,
  dataEmissaoFormatada,
}: DeclaracaoPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const nomeCurso = getNomeCompletoCurso(aluno.curso);
  const presenca = reuniao.presencas[aluno.id];
  const compareceu = presenca?.status === 'Presença';

  const dataReuniaoFormatada = new Date(reuniao.dataReuniao + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let y = 20;

  // 1. Cabeçalho Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229); // indigo
  doc.text('ORIENTAÇÃO DE ESTÁGIO SUPERVISIONADO', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39); // quase preto
  doc.text(nomeCurso.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128); // cinza
  doc.text('Comprovação Obrigatória de Frequência Mensal do Estagiário', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Linha divisória
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // 2. Título do Documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text('DECLARAÇÃO DE COMPARECIMENTO', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`Ref.: Reunião Mensal de Acompanhamento — Mês ${reuniao.mesAno}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // 3. Preâmbulo
  doc.setFontSize(10.5);
  doc.setTextColor(31, 41, 55);
  const textoPreambulo = `Declaramos para os devidos fins de comprovação acadêmica e cumprimento das exigências regulamentares do Estágio Curricular Supervisionado do ${nomeCurso} que o(a) estudante abaixo qualificado(a):`;
  const splitPreambulo = doc.splitTextToSize(textoPreambulo, pageWidth - 40);
  doc.text(splitPreambulo, 20, y);
  y += splitPreambulo.length * 6 + 6;

  // 4. Caixa com Ficha Resumida do Estudante
  const boxX = 20;
  const boxWidth = pageWidth - 40;
  const boxHeight = 40;
  doc.setFillColor(249, 250, 251); // cinza bem claro
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'FD');

  const textX1 = boxX + 6;
  const textX2 = boxX + boxWidth / 2 + 4;
  let lineY = y + 8;

  // Linha 1: Nome e Matrícula
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Nome do Aluno:', textX1, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(aluno.nome, textX1 + 26, lineY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Matrícula:', textX2, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(aluno.matricula, textX2 + 18, lineY);

  lineY += 9;

  // Linha 2: Curso e Turma/Ano
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Curso:', textX1, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(aluno.curso || 'Jogos', textX1 + 14, lineY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Turma / Ano:', textX2, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`${aluno.turma || '-'} ${aluno.ano ? `(${aluno.ano})` : ''}`, textX2 + 23, lineY);

  lineY += 9;

  // Linha 3: Local de Estágio
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Local de Estágio:', textX1, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(aluno.localEstagio, textX1 + 29, lineY);

  y += boxHeight + 8;

  // 5. Parágrafo de Frequência / Presença / Falta
  doc.setFontSize(10.5);
  doc.setTextColor(31, 41, 55);

  let textoFrequencia = '';
  if (compareceu) {
    textoFrequencia = `COMPARECEU regularmente à Reunião Mensal Obrigatória de Orientação e Acompanhamento de Estágio, realizada no dia ${dataReuniaoFormatada}, tendo participado ativamente das discussões sobre a seguinte pauta de orientação profissional: "${reuniao.pauta}".`;
  } else {
    textoFrequencia = `NÃO COMPARECEU à Reunião Mensal Obrigatória de Orientação e Acompanhamento de Estágio realizada no dia ${dataReuniaoFormatada}, sendo registrada FALTA nesta reunião mensal de supervisão acadêmica.`;
    if (presenca?.justificativa) {
      textoFrequencia += ` Justificativa apresentada pelo estagiário: "${presenca.justificativa}".`;
    }
  }

  const splitFrequencia = doc.splitTextToSize(textoFrequencia, pageWidth - 40);
  doc.text(splitFrequencia, 20, y);
  y += splitFrequencia.length * 6 + 6;

  // Parágrafo regulamentar
  const textoRegulamento =
    'A frequência regular a esta reunião mensal é requisito indispensável para a validação das atividades de estágio curricular supervisionado e posterior emissão do certificado de conclusão do curso técnico.';
  const splitRegulamento = doc.splitTextToSize(textoRegulamento, pageWidth - 40);
  doc.text(splitRegulamento, 20, y);
  y += splitRegulamento.length * 6 + 14;

  // 6. Data Escolhida pelo Usuário (à direita)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Emitido em ${dataEmissaoFormatada}.`, pageWidth - 20, y, { align: 'right' });
  y += 24;

  // 7. Campo de Assinatura Oficial Centralizado com o nome Andrea Vargas
  const sigX = pageWidth / 2;
  doc.setDrawColor(75, 85, 99);
  doc.setLineWidth(0.4);
  doc.line(sigX - 45, y, sigX + 45, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('Andrea Vargas', sigX, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  doc.text('ORIENTAÇÃO DE ESTÁGIO', sigX, y, { align: 'center' });
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text(nomeCurso, sigX, y, { align: 'center' });

  // Download do arquivo
  doc.save(`declaracao_comparecimento_${aluno.matricula}_${reuniao.mesAno}.pdf`);
}

/**
 * =========================================================================
 * 1. RELATÓRIO DE FREQUÊNCIA MENSAL (ENVIO À GERÊNCIA)
 * =========================================================================
 */
interface RelatorioFrequenciaOptions {
  alunos: EstagioRecord[];
  reuniao: ReuniaoMensal | null;
  mesAnoFiltro: string;
  nomeMesAno: string;
  cursoFiltro: string;
  dataEmissaoFormatada: string;
  metricas?: {
    total: number;
    presentes: number;
    faltas: number;
    assiduidade: number;
  };
}

export function generateRelatorioFrequenciaPDF({
  alunos,
  reuniao,
  mesAnoFiltro,
  nomeMesAno,
  cursoFiltro,
  dataEmissaoFormatada,
}: RelatorioFrequenciaOptions): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Cabeçalho Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('ESCOLA TÉCNICA ESTADUAL REPÚBLICA - ETER', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  const cursoHeader =
    cursoFiltro === 'Todos'
      ? 'CURSOS TÉCNICOS: JOGOS DIGITAIS • INFORMÁTICA • REDES'
      : getNomeCompletoCurso(cursoFiltro).toUpperCase();
  doc.text(cursoHeader, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(10.5);
  doc.text(`RELATÓRIO MENSAL DE FREQUÊNCIA À REUNIÃO DE ACOMPANHAMENTO — MÊS DE ${nomeMesAno.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Ordena alunos em ordem alfabética pelo nome
  const sortedAlunos = [...alunos].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
  );

  // Tabela com autoTable
  const presencasMap = reuniao?.presencas || {};
  const tableData = sortedAlunos.map((aluno) => {
    const freq = presencasMap[aluno.id];
    const isPresente = freq?.status === 'Presença';
    const isFalta = freq?.status === 'Falta';
    const statusText = isPresente ? 'PRESENÇA' : isFalta ? 'FALTA' : 'Pendente';

    return [
      aluno.matricula,
      aluno.nome,
      aluno.curso || 'Jogos',
      `${aluno.turma || '-'} ${aluno.ano ? `(${aluno.ano})` : ''}`,
      aluno.localEstagio,
      statusText,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Matrícula', 'Nome do Aluno', 'Curso', 'Turma / Ano', 'Local de Estágio', 'Frequência no Mês']],
    body: tableData,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      font: 'helvetica',
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 38, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.text[0] === 'PRESENÇA') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [16, 120, 70];
        } else if (data.cell.text[0] === 'FALTA') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    },
  });

  // Assinatura na última página
  const finalY = (doc as any).lastAutoTable?.finalY || y + 30;
  let sigY = finalY + 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (sigY > pageHeight - 35) {
    doc.addPage();
    sigY = 30;
  }

  // Data de Emissão à direita
  if (dataEmissaoFormatada) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(`Emitido em ${dataEmissaoFormatada}.`, pageWidth - 14, sigY, { align: 'right' });
    sigY += 14;
  }

  const sigX = pageWidth / 2;
  doc.setDrawColor(75, 85, 99);
  doc.setLineWidth(0.4);
  doc.line(sigX - 45, sigY, sigX + 45, sigY);
  sigY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Andrea Vargas', sigX, sigY, { align: 'center' });
  sigY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('ORIENTAÇÃO DE ESTÁGIO', sigX, sigY, { align: 'center' });
  sigY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    cursoFiltro === 'Todos'
      ? 'Cursos Técnicos de Jogos Digitais, Informática e Redes'
      : getNomeCompletoCurso(cursoFiltro),
    sigX,
    sigY,
    { align: 'center' }
  );

  const cleanCurso = cursoFiltro.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`relatorio_frequencia_${mesAnoFiltro}_${cleanCurso}.pdf`);
}

/**
 * =========================================================================
 * 2. RELATÓRIO GERAL DE TODOS OS ESTAGIÁRIOS CADASTRADOS
 * =========================================================================
 */
interface RelatorioGeralOptions {
  alunos: EstagioRecord[];
  cursoFiltro: string;
  dataEmissaoFormatada: string;
}

export function generateRelatorioGeralPDF({
  alunos,
  cursoFiltro,
  dataEmissaoFormatada,
}: RelatorioGeralOptions): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Cabeçalho Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('ORIENTAÇÃO DE ESTÁGIO SUPERVISIONADO • CURSOS TÉCNICOS', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  const cursoHeader =
    cursoFiltro === 'Todos'
      ? 'CURSOS TÉCNICOS: JOGOS DIGITAIS • INFORMÁTICA • REDES'
      : getNomeCompletoCurso(cursoFiltro).toUpperCase();
  doc.text(cursoHeader, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(11);
  doc.text('RELATÓRIO GERAL DE TODOS OS ESTAGIÁRIOS CADASTRADOS', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Tabela com alunos ordenados em ordem alfabética pelo nome
  const sortedAlunos = [...alunos].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
  );
  const tableData = sortedAlunos.map((aluno) => [
    aluno.matricula,
    aluno.nome,
    aluno.curso || 'Jogos',
    aluno.turma || '-',
    aluno.ano || '-',
    aluno.sexo || '-',
    aluno.localEstagio,
    aluno.status || 'Ativo',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Matrícula', 'Nome do Aluno', 'Curso', 'Turma', 'Ano', 'Sexo', 'Local de Estágio', 'Status']],
    body: tableData,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 32 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 26, halign: 'center' },
    },
  });

  // Assinatura na última página
  const finalY = (doc as any).lastAutoTable?.finalY || y + 30;
  let sigY = finalY + 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (sigY > pageHeight - 35) {
    doc.addPage();
    sigY = 30;
  }

  // Data de Emissão à direita
  if (dataEmissaoFormatada) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(`Emitido em ${dataEmissaoFormatada}.`, pageWidth - 14, sigY, { align: 'right' });
    sigY += 14;
  }

  const sigX = pageWidth / 2;
  doc.setDrawColor(75, 85, 99);
  doc.setLineWidth(0.4);
  doc.line(sigX - 45, sigY, sigX + 45, sigY);
  sigY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Andrea Vargas', sigX, sigY, { align: 'center' });
  sigY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('ORIENTAÇÃO DE ESTÁGIO', sigX, sigY, { align: 'center' });

  const cleanCurso = cursoFiltro.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`relatorio_geral_estagiarios_${cleanCurso}.pdf`);
}

/**
 * =========================================================================
 * 3. RELATÓRIO DE ESTAGIÁRIOS ATIVOS NO MÊS
 * =========================================================================
 */
interface RelatorioAtivosOptions {
  alunos: EstagioRecord[];
  cursoFiltro: string;
  mesAnoFiltro: string;
  nomeMesAno: string;
  dataEmissaoFormatada: string;
}

export function generateRelatorioAtivosPDF({
  alunos,
  cursoFiltro,
  mesAnoFiltro,
  nomeMesAno,
  dataEmissaoFormatada,
}: RelatorioAtivosOptions): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Cabeçalho Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('ORIENTAÇÃO DE ESTÁGIO SUPERVISIONADO • CURSOS TÉCNICOS', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  const cursoHeader =
    cursoFiltro === 'Todos'
      ? 'CURSOS TÉCNICOS: JOGOS DIGITAIS • INFORMÁTICA • REDES'
      : getNomeCompletoCurso(cursoFiltro).toUpperCase();
  doc.text(cursoHeader, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(11);
  doc.text(`RELATÓRIO DE ESTAGIÁRIOS ATIVOS — MÊS DE ${nomeMesAno.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Tabela com estagiários ativos ordenados em ordem alfabética pelo nome
  const sortedAlunos = [...alunos].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
  );
  const tableData = sortedAlunos.map((aluno) => [
    aluno.matricula,
    aluno.nome,
    aluno.curso || 'Jogos',
    aluno.turma || '-',
    aluno.ano || '-',
    aluno.localEstagio,
    aluno.supervisor || 'Não informado',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Matrícula', 'Nome do Estagiário', 'Curso', 'Turma', 'Ano', 'Local de Estágio', 'Supervisor na Empresa']],
    body: tableData,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 32 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18 },
      5: { cellWidth: 60 },
      6: { cellWidth: 'auto' },
    },
  });

  // Assinatura na última página
  const finalY = (doc as any).lastAutoTable?.finalY || y + 30;
  let sigY = finalY + 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (sigY > pageHeight - 35) {
    doc.addPage();
    sigY = 30;
  }

  // Data de Emissão à direita
  if (dataEmissaoFormatada) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(`Emitido em ${dataEmissaoFormatada}.`, pageWidth - 14, sigY, { align: 'right' });
    sigY += 14;
  }

  const sigX = pageWidth / 2;
  doc.setDrawColor(75, 85, 99);
  doc.setLineWidth(0.4);
  doc.line(sigX - 45, sigY, sigX + 45, sigY);
  sigY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Andrea Vargas', sigX, sigY, { align: 'center' });
  sigY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('ORIENTAÇÃO DE ESTÁGIO', sigX, sigY, { align: 'center' });

  const cleanCurso = cursoFiltro.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`relatorio_ativos_${mesAnoFiltro}_${cleanCurso}.pdf`);
}
