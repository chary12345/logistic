import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { BookingService } from '../../../../core/services/booking.service';
import { ExportService } from '../../../../core/services/export.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking, BookingSummaryRow } from '../../../../shared/models/models';

@Component({
  selector: 'app-receive-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatDatepickerModule, AgGridAngular],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>inbox</mat-icon> Receive Report</h2>
      <form [formGroup]="form" class="filter-row" (ngSubmit)="generate()">
        <mat-form-field>
          <mat-label>From Date</mat-label>
          <input matInput [matDatepicker]="fromPicker" formControlName="fromDate" placeholder="DD/MM/YYYY">
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker [touchUi]="isMobile"></mat-datepicker>
        </mat-form-field>
        <mat-form-field>
          <mat-label>To Date</mat-label>
          <input matInput [matDatepicker]="toPicker" formControlName="toDate" placeholder="DD/MM/YYYY">
          <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker [touchUi]="isMobile"></mat-datepicker>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="loading">
          <mat-icon>search</mat-icon> Generate
        </button>
      </form>
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

      <!-- Summary Stats -->
      <div class="summary-stats" *ngIf="rowData.length">
        <div class="stat-card">
          <div class="stat-label">Total Received</div>
          <div class="stat-value">{{ totals.count }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Grand Total</div>
          <div class="stat-value">₹{{ totals.grandTotal | number:'1.0-0' }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">PAID</div>
          <div class="stat-value">₹{{ totals.paid | number:'1.0-0' }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">TO PAY</div>
          <div class="stat-value">₹{{ totals.toPay | number:'1.0-0' }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">TBB</div>
          <div class="stat-value">₹{{ totals.tbb | number:'1.0-0' }}</div>
        </div>
      </div>

      <div class="action-bar" *ngIf="rowData.length">
        <button mat-stroked-button (click)="downloadPDF('download')">
          <mat-icon>picture_as_pdf</mat-icon> PDF
        </button>
        <button mat-stroked-button (click)="downloadPDF('print')">
          <mat-icon>print</mat-icon> Print
        </button>
        <button mat-stroked-button color="primary" (click)="exportExcel()">
          <mat-icon>table_view</mat-icon> Excel
        </button>
      </div>
      <ag-grid-angular
        *ngIf="rowData.length"
        class="ag-theme-alpine"
        [style.height]="'460px'"
        [rowData]="rowData"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="true"
        [paginationPageSize]="20"
        [paginationPageSizeSelector]="[10, 20, 50, 100]"
        [animateRows]="true"
        [suppressCellFocus]="true"
        (gridReady)="onGridReady($event)"
        (gridSizeChanged)="onGridSizeChanged($event)">
      </ag-grid-angular>

      <!-- Booking Summary Table -->
      <div class="summary-section" *ngIf="summaryRows.length > 0">
        <h3 class="summary-title">RECEIVE SUMMARY</h3>
        <div class="summary-table-wrapper">
          <table class="summary-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Total Freight</th>
                <th>GST (SGST+CGST+IGST)</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of summaryRows" [class.total-row]="row.type === 'Total'">
                <td>{{ row.type }}</td>
                <td>{{ row.totalFreight | number:'1.2-2' }}</td>
                <td>{{ row.gst | number:'1.2-2' }}</td>
                <td>{{ row.grandTotal | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="!loading && rowData.length === 0" class="empty-state">
        <mat-icon>inbox</mat-icon><p>No receive records found.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .payment-cell {
      &.paid { color: #065f46; font-weight: 700; }
      &.to-pay { color: #92400e; font-weight: 700; }
      &.tbb { color: #3730a3; font-weight: 700; }
    }
    .summary-section { margin-top: 20px; }
    .summary-title { text-align: center; color: #d32f2f; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; }
    .summary-table-wrapper { overflow-x: auto; }
    .summary-table {
      width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; border: 1px solid #ccc;
      th, td { padding: 8px 14px; text-align: center; border: 1px solid #ccc; }
      th { background: #12233a; color: #cfe8ff; font-weight: 600; font-size: 11px; letter-spacing: 0.03em; white-space: nowrap; }
      td { color: #1a2744; }
      .total-row { background: #e8f5e9; font-weight: 700; td { color: #2e7d32; } }
    }
    @media (max-width: 768px) { .summary-table { font-size: 11px; th, td { padding: 6px 8px; } } }
    @media (max-width: 520px) { .summary-title { font-size: 13px; } .summary-table { font-size: 10px; th, td { padding: 5px 6px; } } }
  `]
})
export class ReceiveReportComponent implements OnDestroy {
  private gridApi!: GridApi;
  private datePipe = new DatePipe('en-US');

  form = this.fb.group({ fromDate: ['', Validators.required], toDate: ['', Validators.required] });

  columnDefs: ColDef[] = [
    { headerName: 'LR No', field: 'loadingReciept', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Received Date', field: 'recieveDate', minWidth: 140, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy HH:mm') || '' },
    { headerName: 'Consignor', field: 'consignorName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Destination', field: 'destinationBranchCode', minWidth: 110, sortable: true, filter: true },
    { headerName: 'Bill Type', field: 'billType', minWidth: 100, sortable: true,
      cellClass: (p) => 'payment-cell ' + this.getPaymentClass(p.value) },
    { headerName: 'Total', minWidth: 110, sortable: true,
      valueGetter: p => this.calcGrandTotal(p.data),
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
  ];

  defaultColDef: ColDef = { resizable: true, flex: 1, minWidth: 80 };

  rowData: Booking[] = [];
  summaryRows: BookingSummaryRow[] = [];
  totals = { count: 0, grandTotal: 0, paid: 0, toPay: 0, tbb: 0 };
  loading = false;
  isMobile = window.innerWidth <= 768;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public exportSvc: ExportService,
    private bookingSvc: BookingService,
    private auth: AuthService,
    private snack: SnackbarService,
  ) {}

  onGridReady(params: GridReadyEvent): void { this.gridApi = params.api; this.gridApi.sizeColumnsToFit(); }
  onGridSizeChanged(params: GridSizeChangedEvent): void { params.api.sizeColumnsToFit(); }

  getPaymentClass(mode?: string): string {
    const m: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return m[mode || ''] || '';
  }

  calcGrandTotal(b: Booking): number {
    if (!b) return 0;
    return (b.freight || 0) + (b.loading || 0) + (b.loadingCharge || 0) + (b.sgst || 0) + (b.cgst || 0) + (b.igst || 0);
  }

  private toISO(d: any, eod = false): string {
    const dt = d instanceof Date ? new Date(d.getTime()) : new Date(d);
    if (eod) dt.setHours(23, 59, 59, 999);
    return dt.toISOString().slice(0, -1);
  }

  generate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.rowData = [];
    const { fromDate, toDate } = this.form.value;
    this.fetchAll(this.toISO(fromDate!), this.toISO(toDate!, true));
  }

  private fetchAll(fromDate: string, toDate: string, lastId?: string): void {
    this.bookingSvc.getReport(fromDate, toDate, 'RECEIVED', lastId, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = res.content || [];
          this.rowData = [...this.rowData, ...items];
          const isLast = res.last ?? true;
          if (!isLast && items.length) {
            const nextLastId = items[items.length - 1].loadingReciept || '';
            this.fetchAll(fromDate, toDate, nextLastId);
          } else {
            this.loading = false;
            this.calcTotals(this.rowData);
          }
        },
        error: () => { this.loading = false; this.snack.error('Failed to load receive report.'); }
      });
  }

  private calcTotals(data: Booking[]): void {
    const init = { count: 0, grandTotal: 0, paid: 0, toPay: 0, tbb: 0 };
    this.totals = data.reduce((acc, b) => {
      acc.count++;
      const gt = this.calcGrandTotal(b);
      acc.grandTotal += gt;
      if (b.billType === 'PAID') acc.paid += gt;
      if (b.billType === 'TO PAY') acc.toPay += gt;
      if (b.billType === 'TBB') acc.tbb += gt;
      return acc;
    }, { ...init });
    this.computeSummary(data);
  }

  private computeSummary(bookings: Booking[]): void {
    if (!bookings.length) { this.summaryRows = []; return; }
    const calc = (list: Booking[]) => {
      const totalFreight = list.reduce((s, b) => s + (b.freight || 0), 0);
      const gst = list.reduce((s, b) => s + (b.sgst || 0) + (b.cgst || 0) + (b.igst || 0), 0);
      return { totalFreight, gst, grandTotal: totalFreight + gst };
    };
    const auto = bookings.filter(b => b.bookingtype !== 'Manual');
    const manual = bookings.filter(b => b.bookingtype === 'Manual');
    const all = calc(bookings);
    this.summaryRows = [
      { type: 'Auto', ...calc(auto) },
      { type: 'Manual', ...calc(manual) },
      { type: 'Total', ...all },
    ];
  }

  exportExcel(): void {
    this.exportSvc.exportExcel(this.rowData.map(b => ({
      'LR No': b.loadingReciept, 'Received Date': b.recieveDate, 'Consignor': b.consignorName,
      'Consignee': b.consigneeName, 'Destination': b.destinationBranchCode, 'Bill Type': b.billType,
      'Total': this.calcGrandTotal(b),
    })), 'receive-report.xlsx');
  }

  downloadPDF(action: 'download' | 'print'): void {
    const headers = ['LR No', 'Received Date', 'Consignor', 'Consignee', 'Destination', 'Bill Type', 'Total'];
    const rows = this.rowData.map(b => [b.loadingReciept, b.recieveDate, b.consignorName, b.consigneeName,
      b.destinationBranchCode, b.billType, this.calcGrandTotal(b)]);
    this.exportSvc.exportPDF('Receive Report', headers, rows as any, action, 'receive-report.pdf');
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
