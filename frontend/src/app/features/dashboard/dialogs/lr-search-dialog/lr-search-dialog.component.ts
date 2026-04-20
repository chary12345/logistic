import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { BookingService } from '../../../../core/services/booking.service';
import { ExportService } from '../../../../core/services/export.service';
import { BookingDTO } from '../../../../shared/models/models';
import { MatDialog } from '@angular/material/dialog';
import { LrReceiptDialogComponent } from '../lr-receipt-dialog/lr-receipt-dialog.component';

@Component({
  selector: 'app-lr-search-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTableModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>search</mat-icon> LR Search: <strong>{{ data.lr }}</strong>
    </h2>
    <mat-dialog-content>
      <div *ngIf="loading" class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
      <div *ngIf="error" class="error-msg"><mat-icon>error</mat-icon> {{ error }}</div>
      <div *ngIf="booking && !loading" class="booking-detail">
        <div class="detail-grid">
          <div class="detail-row"><span class="label">LR Number</span><span class="value">{{ booking.loadingReciept }}</span></div>
          <div class="detail-row"><span class="label">Status</span>
            <span class="value">
              <span class="payment-badge" [class]="getStatusClass(booking.consignStatus)">{{ booking.consignStatus }}</span>
            </span>
          </div>
          <div class="detail-row"><span class="label">Payment Mode</span>
            <span class="value">
              <span class="payment-badge" [class]="getPaymentClass(booking.billType)">{{ booking.billType }}</span>
            </span>
          </div>
          <div class="detail-row"><span class="label">Booking Date</span><span class="value">{{ booking.bookingDate | date:'dd/MM/yyyy HH:mm' }}</span></div>
          <div class="detail-row"><span class="label">Destination</span><span class="value">{{ booking.destinationBranchCode }}</span></div>
          <div class="detail-row"><span class="label">Grand Total</span><span class="value fw-700">₹{{ (booking.freight||0) + (booking.loading||0) + (booking.loadingCharge||0) + (booking.sgst||0) + (booking.cgst||0) + (booking.igst||0) }}</span></div>
        </div>
        <mat-divider></mat-divider>
        <div class="detail-grid detail-grid-mt">
          <div class="detail-row"><span class="label">Consignor</span><span class="value">{{ booking.consignorName }} · {{ booking.consignorMobile }}</span></div>
          <div class="detail-row"><span class="label">Consignee</span><span class="value">{{ booking.consigneeName }} · {{ booking.consigneeMobile }}</span></div>
          <div class="detail-row"><span class="label">Invoice No.</span><span class="value">{{ booking.invoiceNumber || '—' }}</span></div>
          <div class="detail-row"><span class="label">E-Waybill</span><span class="value">{{ booking.eWayBillNumber || '—' }}</span></div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button *ngIf="booking" (click)="openReceipt()">
        <mat-icon>receipt</mat-icon> View Receipt
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:15px; }
    .center-spinner { display:flex; justify-content:center; padding:32px; }
    .error-msg { color:#dc2626; display:flex; align-items:center; gap:8px; padding:16px; font-size:12px; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .detail-grid-mt { margin-top:10px; }
    .detail-row { display:flex; flex-direction:column; }
    .label { font-size:10px; color:#5c6780; font-weight:600; text-transform:uppercase; margin-bottom:2px; }
    .value { font-size:12px; color:#1a2744; font-weight:500; word-break:break-word; }
    .fw-700 { font-weight:700; color:#0b5ed7; }
    .payment-badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:700; }
    .paid { background:#d1fae5; color:#065f46; }
    .to-pay { background:#fef3c7; color:#92400e; }
    .tbb { background:#e0e7ff; color:#3730a3; }
    .booked { background:#dbeafe; color:#1e40af; }
    .dispatched { background:#fce7f3; color:#9d174d; }
    @media (max-width: 520px) {
      .detail-grid { grid-template-columns:1fr; }
    }
  `]
})
export class LrSearchDialogComponent implements OnInit {
  booking: BookingDTO | null = null;
  loading = true;
  error   = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { lr: string },
    private bookingSvc: BookingService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.bookingSvc.searchByLR(this.data.lr).subscribe({
      next: (b) => { this.booking = b; this.loading = false; },
      error: () => { this.error = 'LR not found or an error occurred.'; this.loading = false; }
    });
  }

  getPaymentClass(mode?: string): string {
    if (!mode) return '';
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[mode] || '';
  }

  getStatusClass(status?: string): string {
    if (!status) return '';
    const map: Record<string, string> = { 'BOOKED': 'booked', 'DISPATCHED': 'dispatched' };
    return map[status] || '';
  }

  openReceipt(): void {
    this.dialog.open(LrReceiptDialogComponent, {
      data: { booking: this.booking },
      width: '700px',
      maxWidth: '95vw',
    });
  }
}
