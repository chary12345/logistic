import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../../../core/services/export.service';

@Component({
  selector: 'app-lr-receipt-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatDividerModule, MatRadioModule, FormsModule
  ],
  template: `
    <h2 mat-dialog-title><mat-icon>receipt_long</mat-icon> Lorry Receipt</h2>

    <mat-dialog-content class="receipt-content">
      <!-- Receipt display -->
      <div class="receipt-card" id="lr-receipt-print">
        <div class="receipt-header">
          <div class="receipt-title">1UNIQ TRANS — LORRY RECEIPT</div>
          <div class="receipt-subtitle">
            <span>LR No: <strong>{{ booking.loadingReciept }}</strong></span>
            <span>Date: {{ booking.bookingDate | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <div class="receipt-body">
          <div class="receipt-row">
            <div class="r-field"><span class="r-label">Payment Mode</span>
              <span class="r-value pm-badge" [class]="pmClass">{{ booking.billType }}</span>
            </div>
            <div class="r-field"><span class="r-label">Destination</span><span class="r-value">{{ booking.destinationBranchCode }}</span></div>
          </div>

          <mat-divider></mat-divider>

          <div class="section-title-r">CONSIGNOR (FROM)</div>
          <div class="receipt-row">
            <div class="r-field"><span class="r-label">Name</span><span class="r-value">{{ booking.consignorName }}</span></div>
            <div class="r-field"><span class="r-label">Mobile</span><span class="r-value">{{ booking.consignorMobile }}</span></div>
            <div class="r-field"><span class="r-label">GST</span><span class="r-value">{{ booking.consignorGST || '—' }}</span></div>
          </div>
          <div class="receipt-row">
            <div class="r-field full"><span class="r-label">Address</span><span class="r-value">{{ booking.consignorAddress }}</span></div>
          </div>

          <mat-divider></mat-divider>

          <div class="section-title-r">CONSIGNEE (TO)</div>
          <div class="receipt-row">
            <div class="r-field"><span class="r-label">Name</span><span class="r-value">{{ booking.consigneeName }}</span></div>
            <div class="r-field"><span class="r-label">Mobile</span><span class="r-value">{{ booking.consigneeMobile }}</span></div>
            <div class="r-field"><span class="r-label">GST</span><span class="r-value">{{ booking.consigneeGST || '—' }}</span></div>
          </div>
          <div class="receipt-row">
            <div class="r-field full"><span class="r-label">Address</span><span class="r-value">{{ booking.consigneeAddress }}</span></div>
          </div>

          <mat-divider></mat-divider>

          <div class="section-title-r">CHARGES</div>
          <div class="charges-grid">
            <div class="charge-row"><span>Freight</span><span>₹{{ booking.freight }}</span></div>
            <div class="charge-row"><span>Loading</span><span>₹{{ booking.loading }}</span></div>
            <div class="charge-row"><span>LR Charge</span><span>₹{{ booking.loadingCharge }}</span></div>
            <div class="charge-row"><span>SGST (2.5%)</span><span>₹{{ booking.sgst }}</span></div>
            <div class="charge-row"><span>CGST (2.5%)</span><span>₹{{ booking.cgst }}</span></div>
            <div class="charge-row"><span>IGST (5%)</span><span>₹{{ booking.igst }}</span></div>
            <div class="charge-row total"><span>Grand Total</span><span>₹{{ (booking.freight||0) + (booking.loading||0) + (booking.loadingCharge||0) + (booking.sgst||0) + (booking.cgst||0) + (booking.igst||0) }}</span></div>
          </div>

          <mat-divider></mat-divider>

          <div class="receipt-row receipt-row-mt">
            <div class="r-field"><span class="r-label">Invoice No.</span><span class="r-value">{{ booking.invoiceNumber || '—' }}</span></div>
            <div class="r-field"><span class="r-label">Invoice Value</span><span class="r-value">{{ booking.invoiceValue || '—' }}</span></div>
            <div class="r-field"><span class="r-label">E-Waybill</span><span class="r-value">{{ booking.eWayBillNumber || '—' }}</span></div>
          </div>
        </div>
      </div>

      <!-- Action selection -->
      <div class="action-row">
        <mat-radio-group [(ngModel)]="action" class="radio-group">
          <mat-radio-button value="print">🖨️ Print</mat-radio-button>
          <mat-radio-button value="download">⬇️ Download PDF</mat-radio-button>
        </mat-radio-group>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="execute()">
        <mat-icon>{{ action === 'print' ? 'print' : 'download' }}</mat-icon>
        {{ action === 'print' ? 'Print Receipt' : 'Download PDF' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display:flex; align-items:center; gap:8px; font-size:15px; }
    .receipt-content { max-width: 620px; }
    .receipt-card {
      border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;
      font-family:'Poppins',sans-serif; font-size:11px;
    }
    .receipt-header {
      background:#12233a; color:#fff; padding:10px 14px;
      .receipt-title { font-size:14px; font-weight:800; letter-spacing:.05em; }
      .receipt-subtitle { display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px; margin-top:3px; font-size:10px; color:rgba(255,255,255,.75); }
    }
    .receipt-body { padding:12px 14px; display:flex; flex-direction:column; gap:8px; }
    .receipt-row { display:flex; flex-wrap:wrap; gap:12px; }
    .receipt-row-mt { margin-top:6px; }
    .r-field { display:flex; flex-direction:column; min-width:100px; flex:1;
      &.full { flex-basis:100%; } }
    .r-label { font-size:9px; font-weight:700; color:#5c6780; text-transform:uppercase; margin-bottom:2px; }
    .r-value { font-size:11px; font-weight:600; color:#1a2744; word-break:break-word; }
    .section-title-r { font-size:10px; font-weight:800; color:#0b5ed7; text-transform:uppercase; letter-spacing:.05em; margin:3px 0 2px; }
    .charges-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; }
    .charge-row { display:flex; justify-content:space-between; font-size:10px; padding:2px 5px; background:#f8fafc; border-radius:4px;
      &.total { background:#0b5ed7; color:#fff; font-weight:700; } }
    .pm-badge { display:inline-block; padding:2px 7px; border-radius:10px; font-size:9px; font-weight:700; }
    .paid { background:#d1fae5; color:#065f46; }
    .to-pay { background:#fef3c7; color:#92400e; }
    .tbb { background:#e0e7ff; color:#3730a3; }
    .action-row { margin-top:12px; padding:8px 10px; background:#f0f4fa; border-radius:6px; }
    .radio-group { display:flex; gap:14px; flex-wrap:wrap; }
    @media (max-width: 520px) {
      .charges-grid { grid-template-columns:repeat(2,1fr); }
      .receipt-header { padding:8px 10px;
        .receipt-title { font-size:12px; }
      }
      .receipt-body { padding:8px 10px; }
      .r-field { min-width:80px; }
    }
  `]
})
export class LrReceiptDialogComponent {
  action: 'print' | 'download' = 'print';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { booking: any },
    private exportSvc: ExportService,
  ) {}

  get booking() { return this.data.booking; }

  get pmClass(): string {
    const m: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return m[this.booking.billType] || '';
  }

  execute(): void {
    this.exportSvc.generateLRReceipt(this.booking, this.action);
  }
}
