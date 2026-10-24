// @ts-ignore
import html2pdf from 'html2pdf.js';

/**
 * Utilitário para geração de PDF e envio de documentos para a impressora
 * Funciona de forma resiliente em iframes, Netlify e ambientes locais.
 */

interface GeneratePdfOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Cria uma cópia limpa do elemento com estilos específicos para documento oficial
 * (fundo branco, texto preto, tipografia nítida, sem classes escuras do modal).
 */
function createPrintableClone(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;

  // Garante fundo branco e cor de texto escura
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#111827';
  clone.style.padding = '24px';
  clone.style.borderRadius = '0';
  clone.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  // Ajusta elementos para visual de impressão de alta qualidade
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((node) => {
    const el = node as HTMLElement;
    if (el.classList) {
      if (
        el.classList.contains('bg-slate-900') ||
        el.classList.contains('bg-slate-950') ||
        el.classList.contains('bg-slate-800') ||
        el.classList.contains('bg-slate-800/70') ||
        el.classList.contains('bg-slate-800/50')
      ) {
        el.style.backgroundColor = '#f9fafb';
        el.style.borderColor = '#d1d5db';
      }
      if (
        el.classList.contains('text-white') ||
        el.classList.contains('text-slate-100') ||
        el.classList.contains('text-slate-200') ||
        el.classList.contains('text-slate-300')
      ) {
        el.style.color = '#111827';
      }
      if (el.classList.contains('text-slate-400') || el.classList.contains('text-slate-500')) {
        el.style.color = '#4b5563';
      }
      if (el.classList.contains('text-indigo-400') || el.classList.contains('text-indigo-300')) {
        el.style.color = '#3730a3';
      }
      if (el.classList.contains('border-slate-800') || el.classList.contains('border-slate-700')) {
        el.style.borderColor = '#e5e7eb';
      }
    }
  });

  return clone;
}

/**
 * Gera e faz download de um PDF oficial a partir de um ID de elemento HTML
 */
export async function generatePdfFromElement(
  elementId: string,
  options: GeneratePdfOptions
): Promise<void> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Elemento com ID "${elementId}" não foi encontrado para gerar PDF.`);
  }

  // Cria um contêiner temporário fora da tela com o clone estilizado para impressão
  const printableClone = createPrintableClone(sourceElement);
  printableClone.style.position = 'absolute';
  printableClone.style.left = '-9999px';
  printableClone.style.top = '0';
  printableClone.style.width = options.orientation === 'landscape' ? '1120px' : '800px';

  document.body.appendChild(printableClone);

  const cleanFilename = options.filename.endsWith('.pdf')
    ? options.filename
    : `${options.filename}.pdf`;

  const pdfOptions = {
    margin: [10, 10, 10, 10], // mm
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      scrollY: 0,
      windowWidth: options.orientation === 'landscape' ? 1200 : 850,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: options.orientation || 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    await (html2pdf as any)().set(pdfOptions).from(printableClone).save();
  } finally {
    if (document.body.contains(printableClone)) {
      document.body.removeChild(printableClone);
    }
  }
}

/**
 * Envia o elemento diretamente para o spooler de impressão do sistema / navegador
 * usando um iframe isolado para evitar cortes, rolagem de modal e bloqueios de iframe.
 */
export function printElementDirectly(elementId: string, documentTitle: string): void {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    window.print();
    return;
  }

  const printableClone = createPrintableClone(sourceElement);

  // Cria iframe invisível
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.title = 'Print Frame';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const styles = `
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: 600;
      color: #1f2937;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .uppercase { text-transform: uppercase; }
  `;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${printableClone.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print intercepted, fallback to window.print()', err);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
}
