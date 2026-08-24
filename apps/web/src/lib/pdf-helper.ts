export interface PDFTableColumn {
  header: string;
  dataKey: string;
}

export const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '-';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '-';
  
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${parts.join(',')}`;
};

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  columns: PDFTableColumn[];
  rows: any[];
  themeColor?: [number, number, number]; // RGB array
  footerRows?: any[][]; // Optional footer rows (allows cell objects with specific styles)
}

export const generatePDFReport = async (options: PDFReportOptions) => {
  const { 
    title, 
    subtitle, 
    filename = 'report.pdf', 
    columns, 
    rows, 
    themeColor = [99, 102, 241], // Elegant Indigo default theme Color
    footerRows
  } = options;

  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page Width
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55); // Slate 800
  doc.text(title, 14, 20);

  let startY = 22;

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Slate 500
    doc.text(subtitle, 14, startY + 4);
    startY += 8;
  }

  // Draw separator line
  doc.setLineWidth(0.4);
  doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.line(14, startY + 2, pageWidth - 14, startY + 2);
  startY += 8;

  // Headers and body formatting
  const headers = columns.map(col => col.header);
  const bodyData = rows.map(row => columns.map(col => String(row[col.dataKey] ?? '')));

  // Render Table
  autoTable(doc, {
    startY: startY,
    head: [headers],
    body: bodyData,
    foot: footerRows,
    theme: 'striped',
    headStyles: {
      fillColor: themeColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      fontSize: 8,
      halign: 'left'
    },
    footStyles: {
      fillColor: [243, 244, 246], // Slate 100
      textColor: [17, 24, 39], // Slate 900
      fontSize: 9,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { top: 20, left: 14, right: 14, bottom: 20 },
    didDrawPage: (data: any) => {
      // Add page numbering footer
      const totalPages = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // Slate 400
      
      const footerText = `Página ${data.pageNumber}`;
      doc.text(footerText, pageWidth - 14 - doc.getTextWidth(footerText), doc.internal.pageSize.height - 10);
      
      // Print date on bottom left
      const today = new Date().toLocaleDateString();
      doc.text(`Generado el: ${today}`, 14, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(filename);
};
