import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type TableRow = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Generate PDF table and optionally prompt print or download */
  exportPDF(
    title: string,
    headers: string[],
    rows: TableRow[][],
    action: 'download' | 'print' = 'download',
    filename = 'report.pdf'
  ): void {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(14);
    doc.setTextColor(11, 94, 215);
    doc.text(title, 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);

    autoTable(doc, {
      head: [headers],
      body: rows as any,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [18, 35, 58], textColor: [207, 232, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    if (action === 'print') {
      doc.autoPrint();
      doc.output('dataurlnewwindow');
    } else {
      doc.save(filename);
    }
  }

  /** Generate LR Receipt PDF */
  generateLRReceipt(booking: Record<string, any>, action: 'download' | 'print' = 'download'): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

    // Header
    doc.setFillColor(18, 35, 58);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('1UNIQ TRANS — LORRY RECEIPT', 105, 11, { align: 'center' });

    // LR Number
    doc.setFillColor(11, 94, 215);
    doc.rect(0, 18, 210, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`LR No: ${booking['loadingReciept'] || '—'}`, 10, 25);
    doc.text(`Date: ${booking['bookingDate'] || new Date().toLocaleDateString()}`, 140, 25);

    let y = 34;
    const left  = 10;
    const right = 110;

    const field = (label: string, value: any, x: number, yPos: number) => {
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(label, x, yPos);
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value ?? '—'), x, yPos + 5);
      doc.setFont('helvetica', 'normal');
    };

    field('Payment Mode', booking['billType'], left, y);
    field('Destination', booking['destinationBranchCode'], right, y);
    y += 14;

    // Separator
    doc.setDrawColor(220, 220, 220);
    doc.line(left, y, 200, y); y += 4;

    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(11, 94, 215);
    doc.text('CONSIGNOR (FROM)', left, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20);
    field('Name', booking['consignorName'], left, y);
    field('Mobile', booking['consignorMobile'], right, y); y += 14;
    field('Address', booking['consignorAddress'], left, y); y += 12;

    doc.line(left, y, 200, y); y += 4;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(11, 94, 215);
    doc.text('CONSIGNEE (TO)', left, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20);
    field('Name', booking['consigneeName'], left, y);
    field('Mobile', booking['consigneeMobile'], right, y); y += 14;
    field('Address', booking['consigneeAddress'], left, y); y += 12;

    // Charges table
    doc.line(left, y, 200, y); y += 4;
    autoTable(doc, {
      startY: y,
      head: [['Freight', 'Loading', 'LR Charge', 'SGST', 'CGST', 'IGST', 'Grand Total']],
      body: [[
        `₹${booking['freight'] ?? 0}`,
        `₹${booking['loading'] ?? 0}`,
        `₹${booking['loadingCharge'] ?? 0}`,
        `₹${booking['sgst'] ?? 0}`,
        `₹${booking['cgst'] ?? 0}`,
        `₹${booking['igst'] ?? 0}`,
        `₹${(booking['freight']||0) + (booking['loading']||0) + (booking['loadingCharge']||0) + (booking['sgst']||0) + (booking['cgst']||0) + (booking['igst']||0)}`,
      ]],
      headStyles: { fillColor: [18, 35, 58], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8 },
    });

    if (action === 'print') {
      doc.autoPrint();
      doc.output('dataurlnewwindow');
    } else {
      doc.save(`LR_${booking['loadingReciept'] || 'receipt'}.pdf`);
    }
  }

  /** Export to Excel */
  exportExcel(data: TableRow[], filename = 'report.xlsx'): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  }
}
