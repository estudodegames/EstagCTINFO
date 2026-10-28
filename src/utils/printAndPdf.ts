/**
 * Utilitário para envio direto de documentos à impressora
 * Funciona de forma imediata e resiliente em todos os navegadores, iframes, Netlify e ambientes locais.
 */

function ensurePrintStyles(): void {
  const STYLE_ID = 'app-official-print-styles';
  if (document.getElementById(STYLE_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    @media screen {
      #app-print-portal {
        display: none !important;
      }
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 12mm 15mm 12mm 15mm;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      html, body {
        background: #ffffff !important;
        color: #111827 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }
      /* Oculta toda a aplicação da tela principal (modais, menus, barras de rolagem) */
      body > *:not(#app-print-portal) {
        display: none !important;
      }
      /* Exibe com fidelidade e sem cortes o documento a ser impresso */
      #app-print-portal {
        display: block !important;
        position: static !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #111827 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      #app-print-portal table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 9.5pt !important;
        margin-top: 12px !important;
      }
      #app-print-portal thead {
        display: table-header-group !important;
      }
      #app-print-portal tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #app-print-portal th, #app-print-portal td {
        border: 1px solid #d1d5db !important;
        padding: 6px 8px !important;
        text-align: left !important;
        color: #111827 !important;
      }
      #app-print-portal th {
        background-color: #f3f4f6 !important;
        font-weight: 700 !important;
        color: #111827 !important;
      }
      #app-print-portal .text-center { text-align: center !important; }
      #app-print-portal .text-right { text-align: right !important; }
      #app-print-portal .font-bold { font-weight: 700 !important; }
      #app-print-portal .font-semibold { font-weight: 600 !important; }
      #app-print-portal .uppercase { text-transform: uppercase !important; }
    }
  `;
  document.head.appendChild(styleEl);
}

/**
 * Cria uma cópia limpa do elemento com estilos específicos para documento oficial
 * (fundo branco, texto preto, tipografia nítida, sem classes escuras do modal).
 */
function createPrintableClone(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;

  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#111827';
  clone.style.padding = '0';
  clone.style.margin = '0';
  clone.style.borderRadius = '0';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const allElements = clone.querySelectorAll('*');
  allElements.forEach((node) => {
    const el = node as HTMLElement;
    if (el.classList && el.classList.contains('print:hidden')) {
      el.remove();
      return;
    }

    el.style.backgroundColor = 'transparent';
    el.style.boxShadow = 'none';

    if (el.tagName === 'TH') {
      el.style.backgroundColor = '#f3f4f6';
      el.style.color = '#111827';
      el.style.borderColor = '#d1d5db';
      el.style.fontWeight = 'bold';
    } else if (el.tagName === 'TD') {
      el.style.borderColor = '#e5e7eb';
      el.style.color = '#111827';
    } else {
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
      if (el.classList.contains('text-emerald-400')) {
        el.style.color = '#166534';
      }
      if (el.classList.contains('text-rose-400')) {
        el.style.color = '#991b1b';
      }
      if (
        el.classList.contains('border-slate-800') ||
        el.classList.contains('border-slate-700') ||
        el.classList.contains('border-slate-600')
      ) {
        el.style.borderColor = '#d1d5db';
      }
    }
  });

  return clone;
}

/**
 * Envia o documento imediatamente para a impressora.
 */
export function printElementDirectly(elementId: string, documentTitle: string): void {
  ensurePrintStyles();

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    window.print();
    return;
  }

  // Obtém ou cria o portal de impressão diretamente no body
  let portal = document.getElementById('app-print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'app-print-portal';
    document.body.appendChild(portal);
  }

  // Prepara o conteúdo limpo
  const printableClone = createPrintableClone(sourceElement);
  portal.innerHTML = '';
  portal.appendChild(printableClone);

  const originalTitle = document.title;
  if (documentTitle) {
    document.title = documentTitle;
  }

  // Limpa o portal após impressão
  const cleanup = () => {
    document.title = originalTitle;
    if (portal) {
      portal.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);

  // Aciona imediatamente o diálogo nativo de impressão
  try {
    window.focus();
    window.print();
  } catch (err) {
    console.error('Falha ao acionar window.print():', err);
  }

  setTimeout(cleanup, 2500);
}
