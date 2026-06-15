import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatAppDate } from '../../shared/utils/date.util';
import { calcBookingGrandTotal } from '../../shared/utils/booking-report.util';

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
    doc.text(`Generated: ${formatAppDate(new Date())}`, 14, 21);

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
  generateLRReceipt(booking: Record<string, any>, action: 'download' | 'print' = 'download', dynamicChargeFields?: {key: string, label: string}[]): void {
    const copies = ['Consignor Copy', 'Consignee Copy', 'Office Copy'];
    const rawLr = booking['loadingReciept'] || 'receipt';
    // Replace slashes with dashes to ensure valid filename and avoid format stripping by browser
    const safeLr = rawLr.replace(/\//g, '-');
    const title = `LR-${safeLr} Receipt`;
    const filename = `${title}.pdf`;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Attempt to get company and branch from auth service if available
    let companyName = 'LOGISTICS TRANSPORTS';
    let companyBranch = booking['branchCode'] || 'BRANCH';
    try {
      const authRaw = sessionStorage.getItem('user');
      if (authRaw) {
        const user = JSON.parse(authRaw);
        companyName = user.companyAndBranchDeatils?.companyName || user.companyName || companyName;
        companyBranch = user.companyAndBranchDeatils?.branchName || user.branchName || companyBranch;
      }
    } catch (e) {}

    const drawSingle = (copyLabel: string, startY: number) => {
      // 1. Header Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(companyName.toUpperCase(), 105, startY + 8, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(companyBranch.toUpperCase(), 105, startY + 13, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(copyLabel, 200, startY + 8, { align: 'right' });

      const boxY = startY + 16;
      const boxH = 82; // Increased height
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(10, boxY, 190, boxH);

      // Horizontal lines dividing sections
      doc.line(10, boxY + 6, 200, boxY + 6);
      doc.line(10, boxY + 12, 200, boxY + 12);
      doc.line(10, boxY + 45, 200, boxY + 45); // Separates FROM/TO and details
      
      // Vertical lines for the 3 columns
      // Col 1: 10 to 80 (width 70)
      // Col 2: 80 to 150 (width 70)
      // Col 3: 150 to 200 (width 50)
      doc.line(80, boxY + 6, 80, boxY + boxH);
      doc.line(150, boxY + 6, 150, boxY + boxH);

      // --- ROW 1 (Date, LR No, Payment Mode) ---
      doc.setFontSize(8);
      const dateStr = booking['bookingDate'] ? formatAppDate(booking['bookingDate']) : formatAppDate(new Date());
      doc.text(`Date: ${dateStr}`, 12, boxY + 4.5);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`LR No: ${booking['loadingReciept'] || '—'}`, 82, boxY + 4.5);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment Mode: ${booking['billType'] || '—'}`, 152, boxY + 4.5);

      // --- ROW 2 (FROM, TO, CHARGES HEADER) ---
      doc.setFont('helvetica', 'bold');
      doc.text(`FROM: ${companyBranch.toUpperCase()}`, 12, boxY + 10.5);
      doc.text(`TO: ${booking['destinationBranchCode'] || '—'}`, 82, boxY + 10.5);
      doc.text('CHARGES', 175, boxY + 10.5, { align: 'center' });

      // --- ROW 3 & 4 (Consignor, Consignee Details) ---
      // Left Column (Consignor)
      let cy = boxY + 16;
      doc.setFont('helvetica', 'normal');
      doc.text(`Consignor:`, 12, cy); doc.setFont('helvetica', 'bold'); doc.text(`${booking['consignorName'] || '—'}`, 30, cy); doc.setFont('helvetica', 'normal');
      cy += 5;
      doc.text(`Address:`, 12, cy); doc.setFont('helvetica', 'bold'); 
      const fromAddr = doc.splitTextToSize(`${booking['consignorAddress'] || '—'}`, 45);
      doc.text(fromAddr, 26, cy); 
      cy += (fromAddr.length * 4) + 1;
      doc.setFont('helvetica', 'normal');
      doc.text(`Mobile:`, 12, cy); doc.setFont('helvetica', 'bold'); doc.text(`${booking['consignorMobile'] || '—'}`, 24, cy); doc.setFont('helvetica', 'normal');

      // Center Column (Consignee)
      let cy2 = boxY + 16;
      doc.text(`Consignee:`, 82, cy2); doc.setFont('helvetica', 'bold'); doc.text(`${booking['consigneeName'] || '—'}`, 100, cy2); doc.setFont('helvetica', 'normal');
      cy2 += 5;
      doc.text(`Address:`, 82, cy2); doc.setFont('helvetica', 'bold');
      const toAddr = doc.splitTextToSize(`${booking['consigneeAddress'] || '—'}`, 45);
      doc.text(toAddr, 96, cy2); 
      cy2 += (toAddr.length * 4) + 1;
      doc.setFont('helvetica', 'normal');
      doc.text(`Mobile:`, 82, cy2); doc.setFont('helvetica', 'bold'); doc.text(`${booking['consigneeMobile'] || '—'}`, 94, cy2); doc.setFont('helvetica', 'normal');

      // Right Column (Charges)
      let cy3 = boxY + 16;
      const rightColRightAlign = 196;
      
      const chargeField = (label: string, val: number | string, yPos: number, xStart = 152, xEnd = rightColRightAlign) => {
        doc.text(label, xStart, yPos);
        doc.text(String(val), xEnd, yPos, { align: 'right' });
      };

      const gst = (booking['cgst']||0) + (booking['sgst']||0) + (booking['igst']||0);
      
      const defaultChargeFields = [
        { key: 'lrCharge', label: 'LR Charge' },
        { key: 'loading', label: 'Loading' },
        { key: 'loadingCharge', label: 'Load Chg' },
        { key: 'unloading', label: 'Unloading' },
        { key: 'hamali', label: 'Hamali' },
        { key: 'stationary', label: 'Stationary' },
        { key: 'otherCharges', label: 'Other' },
        { key: 'otherTransportCharges', label: 'Transport' },
        { key: 'miscellaneous', label: 'Misc' },
        { key: 'crossingAmount', label: 'Crossing' },
        { key: 'podCharges', label: 'POD' },
        { key: 'doorDelivery', label: 'Door Del' },
        { key: 'doorPickup', label: 'Door Pick' },
        { key: 'ddc', label: 'DDC' },
        { key: 'dcc', label: 'DCC' },
        { key: 'demurrage', label: 'Demurrage' },
        { key: 'localVehicle', label: 'Local Veh' },
        { key: 'crossingHire', label: 'Cross Hire' }
      ];

      let chargesList: {label: string, val: number}[] = [];
      chargesList.push({ label: 'Freight:', val: booking['freight'] || 0 });

      // First add any dynamic charges requested
      const processedKeys = new Set<string>();
      if (dynamicChargeFields && dynamicChargeFields.length > 0) {
        dynamicChargeFields.forEach(f => {
          let shortLabel = f.label.length > 10 ? f.label.substring(0, 9) + '.' : f.label;
          chargesList.push({ label: shortLabel + ':', val: booking[f.key] || 0 });
          processedKeys.add(f.key);
        });
      }

      // Then add any other non-zero charges that were not in dynamicChargeFields
      defaultChargeFields.forEach(f => {
        if (!processedKeys.has(f.key) && Number(booking[f.key]) > 0) {
          chargesList.push({ label: f.label + ':', val: booking[f.key] });
        }
      });

      chargesList.push({ label: 'GST:', val: gst });

      let activeCharges = chargesList.filter(c => Number(c.val) > 0);
      if (activeCharges.length === 0) activeCharges.push(chargesList[0]);

      doc.setFontSize(7);
      if (activeCharges.length <= 6) {
        let step = 22 / activeCharges.length;
        if (step > 5) step = 5;
        activeCharges.forEach(c => {
           chargeField(c.label, `Rs. ${c.val}`, cy3);
           cy3 += step;
        });
      } else {
        doc.setFontSize(5.5);
        let rows = Math.ceil(activeCharges.length / 2);
        let step = Math.min(3.5, 22.5 / rows); // available vertical space is ~22.5
        if (step < 2.5) { doc.setFontSize(5); }
        let y1 = boxY + 15.5;
        let y2 = boxY + 15.5;
        activeCharges.forEach((c, index) => {
           if (index % 2 === 0) {
              chargeField(c.label, c.val, y1, 151, 173);
              y1 += step;
           } else {
              chargeField(c.label, c.val, y2, 175, 198);
              y2 += step;
           }
        });
      }
      doc.setFontSize(8);
      
      doc.line(150, boxY + 38, 200, boxY + 38);
      doc.setFont('helvetica', 'bold');
      const grandTotal = booking['totalAmount'] ?? booking['grandTotal'] ?? activeCharges.reduce((sum, c) => sum + Number(c.val), 0);
      chargeField('Total:', `Rs. ${grandTotal}`, boxY + 43);
      doc.setFont('helvetica', 'normal');

      // --- ROW 5 (Articles, Invoice) ---
      let by = boxY + 50;
      let totalQty = 0;
      // Support artQty or artQuantity
      if (booking['articleDetails'] && Array.isArray(booking['articleDetails'])) {
        totalQty = booking['articleDetails'].reduce((sum, a) => sum + (Number(a.artQty || a.artQuantity) || 0), 0);
      }
      doc.text(`Quantity: ${totalQty}`, 12, by);
      
      const stcList = booking['articleDetails'] && Array.isArray(booking['articleDetails'])
        ? Array.from(new Set(booking['articleDetails'].map(a => a.saidToContain).filter(s => !!s)))
        : [];
      const stcStr = stcList.length > 0 ? stcList.join(', ') : '—';
      doc.text(`Said to Contain: ${stcStr}`, 12, by + 6);

      doc.text(`Invoice No: ${booking['invoiceNumber'] || '—'}`, 12, by + 12);
      doc.text(`Invoice Value: Rs. ${booking['invoiceValue'] || '—'}`, 12, by + 18);
      
      // Handle multiple eWayBills
      let billsArray: string[] = [];
      if (booking['eWayBillNumbers']) {
        if (Array.isArray(booking['eWayBillNumbers'])) {
          billsArray = booking['eWayBillNumbers'].filter(b => !!b);
        } else if (typeof booking['eWayBillNumbers'] === 'string') {
          billsArray = booking['eWayBillNumbers'].split(',').map(s => s.trim()).filter(s => !!s);
        }
      }
      if (billsArray.length === 0 && booking['eWayBillNumber']) {
        billsArray = String(booking['eWayBillNumber']).split(',').map(s => s.trim()).filter(s => !!s);
      }

      if (billsArray.length > 0) {
        doc.text(`E-Way Bill:`, 12, by + 24);
        let billY = by + 24;
        for (let i = 0; i < billsArray.length; i += 2) {
          const pair = billsArray.slice(i, i + 2).join(', ');
          doc.text(pair, 30, billY);
          if (i + 2 < billsArray.length) {
            billY += 4;
          }
        }
      } else {
        doc.text(`E-Way Bill: —`, 12, by + 24);
      }
      
      doc.text(`Delivery At: Godown`, 82, by);
      doc.text(`Remarks: ${booking['remarks'] || '—'}`, 82, by + 24);

      // Signature
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: Rs. ${grandTotal}`, 152, by);
      doc.setFont('helvetica', 'normal');
      doc.text(`Signature: ________________`, 152, by + 18);
    };

    // Draw the 3 copies vertically on one A4 page
    copies.forEach((c, idx) => {
      const startY = idx * 98; // 0, 98, 196
      drawSingle(c, startY);
      
      // Draw cut line between copies
      if (idx < 2) {
        doc.setDrawColor(180);
        if (typeof doc.setLineDashPattern === 'function') {
           doc.setLineDashPattern([3, 3], 0);
        }
        doc.line(10, startY + 95, 200, startY + 95);
        if (typeof doc.setLineDashPattern === 'function') {
           doc.setLineDashPattern([], 0);
        }
      }
    });

    doc.setProperties({
      title: title,
      subject: 'Lorry Receipt'
    });

    if (action === 'print') {
      // For print, we want the default filename if the user chooses 'Save as PDF'
      // We can achieve this using an iframe or opening a new window with HTML containing an iframe
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>body { margin: 0; padding: 0; overflow: hidden; }</style>
            </head>
            <body>
              <iframe width="100%" height="100%" src="${url}#toolbar=0&navpanes=0&scrollbar=0" frameborder="0" onload="setTimeout(function(){ window.print(); }, 500);"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback
        doc.autoPrint();
        doc.output('dataurlnewwindow', { filename: filename });
      }
    } else {
      // Force reliable download with exact filename
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }

  /** Export to Excel */
  exportExcel(data: TableRow[], filename = 'report.xlsx'): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  }

  /** Generate Loading Sheet (LS) PDF — Print or Download */
  generateLSReceipt(
    ls: Record<string, any>,
    bookings: any[],
    action: 'download' | 'print' = 'download'
  ): void {
    const lsNumber = ls['loadingSheetNumber'] || '—';
    const title = `LS-${lsNumber}`;
    const filename = `${title}.pdf`;

    // Read company info from session
    let companyName = '';
    let fromBranch  = ls['fromBranch'] || '';
    let companyAddress = '';
    let companyPhone = '';
    let companyGst = '';

    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        companyName = u.companyAndBranchDeatils?.companyName || u.companyName || companyName;
        fromBranch  = fromBranch || u.companyAndBranchDeatils?.branchName  || u.branchName;
        companyAddress = u.companyAndBranchDeatils?.address || u.address || companyAddress;
        companyPhone = u.companyAndBranchDeatils?.phone || u.phone || companyPhone;
        companyGst = u.companyAndBranchDeatils?.gstNo || u.gstNo || companyGst;
      }
    } catch (e) {}

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = 297; // A4 landscape width
    const margin = 14;

    // ── Header ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    // Company details
    doc.text((companyName || '').toUpperCase(), pageW / 2, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (companyAddress) doc.text(`ADDRESS : ${companyAddress}`, pageW / 2, 22, { align: 'center' });
    if (companyPhone) doc.text(`PHONE NO.: ${companyPhone}`, pageW / 2, 27, { align: 'center' });
    if (companyGst) doc.text(`GST NO.: ${companyGst}`, pageW / 2, 32, { align: 'center' });

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('DISPATCH STOCK REPORT', pageW / 2, 40, { align: 'center' });

    // ── Details Section ─────────────────────────────────────────────────────
    doc.setFontSize(10);
    const startY = 50;
    const dateStr = ls['createdAt'] ? formatAppDate(ls['createdAt']) : formatAppDate(new Date());

    // Left Details
    doc.setFont('helvetica', 'bold');
    doc.text('From :', margin, startY); doc.setFont('helvetica', 'normal'); doc.text(` ${fromBranch.toUpperCase()}`, margin + 12, startY);
    doc.setFont('helvetica', 'bold');
    doc.text('Loading Sheet No.:', margin, startY + 6); doc.setFont('helvetica', 'normal'); doc.text(` ${lsNumber}`, margin + 35, startY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle No.:', margin, startY + 12); doc.setFont('helvetica', 'normal'); doc.text(` ${ls['vehicleNumber'] || '—'}`, margin + 22, startY + 12);
    doc.setFont('helvetica', 'bold');
    doc.text('Broker/Owner Name :', margin, startY + 18); doc.setFont('helvetica', 'normal'); doc.text(' —', margin + 38, startY + 18);


    // Right Details
    const rightColX = pageW / 2 + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('To :', rightColX, startY); doc.setFont('helvetica', 'normal'); doc.text(` ${ls['destinationBranch'] || '—'}`, rightColX + 8, startY);
    doc.setFont('helvetica', 'bold');
    doc.text('Date :', rightColX, startY + 6); doc.setFont('helvetica', 'normal'); doc.text(` ${dateStr}`, rightColX + 11, startY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text('Driver :', rightColX, startY + 12); doc.setFont('helvetica', 'normal'); doc.text(` ${ls['driverName'] || '—'} (${ls['driverPhone'] || '0000000000'})`, rightColX + 14, startY + 12);
    doc.setFont('helvetica', 'bold');
    doc.text('Driving License no.:', rightColX, startY + 18); doc.setFont('helvetica', 'normal'); doc.text(' —', rightColX + 35, startY + 18);

    // ── LR List table ───────────────────────────────────────────────────────
    let tableStartY = startY + 30;
    let totalArticles = 0;
    let totalWeight = 0;
    let totalAmount = 0;

    const lrRows = bookings.map((b, idx) => {
      const bkgDate = b.bookingDate ? formatAppDate(b.bookingDate).substring(0, 8) : '—'; // Short date
      
      let arts = 0;
      let wgt = 0;
      if (b.articleDetails && Array.isArray(b.articleDetails)) {
        arts = b.articleDetails.reduce((sum: number, a: any) => sum + (Number(a.artQty || a.artQuantity) || 0), 0);
        wgt = b.articleDetails.reduce((sum: number, a: any) => sum + (Number(a.actualWeight) || 0), 0);
      }
      
      const amt = calcBookingGrandTotal(b);
      
      totalArticles += arts;
      totalWeight += wgt;
      totalAmount += Number(amt);

      return [
        String(idx + 1),
        b.loadingReciept || '—',
        bkgDate,
        ((b as any).formattedFrom || fromBranch).substring(0, 30),
        ((b as any).formattedTo || ls['destinationBranch'] || '—').substring(0, 30),
        String(arts),
        b.bookingtype || 'BAG', // Defaulting based on sample if empty
        String(wgt || 100), // Defaulting based on sample if 0
        (b.consignorName || '—').substring(0, 15),
        (b.consigneeName || '—').substring(0, 15),
        b.billType || 'To Pay',
        String(amt)
      ];
    });

    // Add Total Row
    lrRows.push([
      'TOTAL', '', '', '', '',
      String(totalArticles), '', String(totalWeight || 100), '', '', '',
      String(totalAmount)
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['SL.NO.', 'LR No.', 'BKG.DATE', 'FROM', 'TO', 'ART', 'PACKING TYPE', 'WEIGHT', 'CONSIGNOR', 'CONSIGNEE', 'LR TYPE', 'AMOUNT']],
      body: lrRows,
      styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.2 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center' },
      columnStyles: {
        0: { cellWidth: 12 },
        8: { halign: 'left' },
        9: { halign: 'left' }
      },
      margin: { left: margin, right: margin },
      theme: 'plain',
      willDrawCell: (data: any) => {
        // Draw borders for all cells
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
      },
      didParseCell: function(data: any) {
        if (data.row.index === lrRows.length - 1) {
           data.cell.styles.fontStyle = 'bold';
        }
      }
    } as any);

    // ── Summary table ───────────────────────────────────────────────────────
    let currentY = (doc as any).lastAutoTable?.finalY ?? 150;
    currentY += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Summary', margin, currentY);
    currentY += 3;

    // Group by LR TYPE
    const summaryMap = new Map<string, { arts: number, amt: number }>();
    bookings.forEach(b => {
      const type = b.billType || 'To Pay';
      let arts = 0;
      if (b.articleDetails && Array.isArray(b.articleDetails)) {
        arts = b.articleDetails.reduce((sum: number, a: any) => sum + (Number(a.artQty || a.artQuantity) || 0), 0);
      }
      const amt = calcBookingGrandTotal(b);

      const existing = summaryMap.get(type) || { arts: 0, amt: 0 };
      existing.arts += arts;
      existing.amt += amt;
      summaryMap.set(type, existing);
    });

    const summaryRows: any[][] = [];
    let sumArts = 0;
    let sumAmt = 0;

    summaryMap.forEach((val, key) => {
      summaryRows.push([key, String(val.arts), String(val.amt)]);
      sumArts += val.arts;
      sumAmt += val.amt;
    });

    // Handle case where there are no bookings (e.g. testing)
    if (summaryRows.length === 0) {
       summaryRows.push(['To Pay', '0', '0']);
    }

    summaryRows.push(['TOTAL', String(sumArts), String(sumAmt)]);

    autoTable(doc, {
      startY: currentY,
      head: [['LR TYPE', 'NO.OF ARTICLES', 'AMOUNT']],
      body: summaryRows,
      styles: { fontSize: 8, cellPadding: 2, textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center' },
      margin: { left: margin, right: margin },
      theme: 'plain',
      willDrawCell: (data: any) => {
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
      },
      didParseCell: function(data: any) {
        if (data.row.index === summaryRows.length - 1) {
           data.cell.styles.fontStyle = 'bold';
           data.cell.styles.fontSize = 9;
        }
      }
    } as any);

    // ── Footer ──────────────────────────────────────────────────────────────
    currentY = (doc as any).lastAutoTable?.finalY ?? 180;
    currentY += 10;

    let userName = 'Admin';
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        userName = u.userName || u.firstName || userName;
      }
    } catch (e) {}

    doc.setFont('helvetica', 'bold');
    doc.text(`Remark : ${ls['remarks'] || '--'}`, margin, currentY);
    doc.text(`Prepared By : ${userName}`, margin, currentY + 6);

    doc.setProperties({ title, subject: 'Loading Sheet Report' });

    if (action === 'print') {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><head><title>${title}</title>
          <style>body{margin:0;padding:0;overflow:hidden;}</style></head>
          <body><iframe width="100%" height="100%" src="${url}#toolbar=0" frameborder="0"
            onload="setTimeout(function(){window.print();},500);"></iframe></body></html>`);
        win.document.close();
      } else {
        doc.autoPrint();
        doc.output('dataurlnewwindow', { filename });
      }
    } else {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }
}

