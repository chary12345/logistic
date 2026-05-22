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
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { BookingService } from '../../../../core/services/booking.service';
import { ExportService } from '../../../../core/services/export.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking, BookingSummaryRow } from '../../../../shared/models/models';
import { calcBookingGrandTotal, mapReportContent } from '../../../../shared/utils/booking-report.util';
import { LrSearchDialogComponent } from '../../dialogs/lr-search-dialog/lr-search-dialog.component';

@Component({
  selector: 'app-dispatch-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatDatepickerModule, AgGridAngular],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>local_shipping</mat-icon> Dispatch Report</h2>
      <!-- Quick date-range chips -->
      <div class="date-range-chips">
        <span class="range-chip" [class.active]="activeRange === '1D'" (click)="applyQuickRange('1D')">
          <mat-icon>today</mat-icon> 1 Day
        </span>
        <span class="range-chip" [class.active]="activeRange === '1W'" (click)="applyQuickRange('1W')">
          <mat-icon>date_range</mat-icon> 1 Week
        </span>
        <span class="range-chip" [class.active]="activeRange === '1M'" (click)="applyQuickRange('1M')">
          <mat-icon>calendar_month</mat-icon> 1 Month
        </span>
      </div>

      <form [formGroup]="form" class="filter-row" (ngSubmit)="generate()">
        <mat-form-field>
          <mat-label>From Date</mat-label>
          <input matInput [matDatepicker]="fromPicker" formControlName="fromDate" placeholder="DD/MM/YYYY" (dateChange)="activeRange = null">
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker [touchUi]="isMobile"></mat-datepicker>
        </mat-form-field>
        <mat-form-field>
          <mat-label>To Date</mat-label>
          <input matInput [matDatepicker]="toPicker" formControlName="toDate" placeholder="DD/MM/YYYY" (dateChange)="activeRange = null">
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
          <div class="stat-label">Total Dispatches</div>
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
        <h3 class="summary-title">BOOKING SUMMARY</h3>
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
        <mat-icon>inbox</mat-icon><p>No dispatch records found.</p>
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

    // Booking Summary
    .summary-section {
      margin-top: 20px;
    }

    .summary-title {
      text-align: center;
      color: #d32f2f;
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .summary-table-wrapper {
      overflow-x: auto;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      background: #fff;
      border: 1px solid #ccc;

      th, td {
        padding: 8px 14px;
        text-align: center;
        border: 1px solid #ccc;
      }

      th {
        background: #12233a;
        color: #cfe8ff;
        font-weight: 600;
        font-size: 11px;
        letter-spacing: 0.03em;
        white-space: nowrap;
      }

      td {
        color: #1a2744;
      }

      .total-row {
        background: #e8f5e9;
        font-weight: 700;

        td {
          color: #2e7d32;
        }
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .summary-table {
        font-size: 11px;

        th, td {
          padding: 6px 8px;
        }
      }
    }

    @media (max-width: 520px) {
      .summary-title {
        font-size: 13px;
      }

      .summary-table {
        font-size: 10px;

        th, td {
          padding: 5px 6px;
        }
      }
    }
  `]
})
export class DispatchReportComponent implements OnDestroy {
  private gridApi!: GridApi;
  private datePipe = new DatePipe('en-US');

  form = this.fb.group({ fromDate: ['', Validators.required], toDate: ['', Validators.required] });

  columnDefs: ColDef[] = [
    { 
      headerName: 'LR No', 
      field: 'loadingReciept', 
      minWidth: 120, 
      sortable: true, 
      filter: true,
      cellRenderer: (p: any) => {
        if (!p.value) return '';
        return `<a class="lr-link" style="color: #0b5ed7; font-weight: 600; text-decoration: underline; cursor: pointer;">${p.value}</a>`;
      },
      onCellClicked: (params: any) => {
        if (params.value) {
          this.openLRDetails(params.value);
        }
      }
    },
    { headerName: 'Dispatch Date', field: 'dispatchDate', minWidth: 140, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy HH:mm') || '' },
    { headerName: 'Consignor', field: 'consignorName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Destination', field: 'destinationBranchCode', minWidth: 110, sortable: true, filter: true },
    { headerName: 'Bill Type', field: 'billType', minWidth: 100, sortable: true,
      cellClass: (p) => 'payment-cell ' + this.getPaymentClass(p.value) },
    { headerName: 'Total', minWidth: 110, sortable: true,
      valueGetter: p => calcBookingGrandTotal(p.data),
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
  ];

  defaultColDef: ColDef = { resizable: true, flex: 1, minWidth: 80 };

  rowData: Booking[] = [];
  summaryRows: BookingSummaryRow[] = [];
  totals = { count: 0, grandTotal: 0, paid: 0, toPay: 0, tbb: 0 };
  loading = false;
  isMobile = window.innerWidth <= 768;
  activeRange: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public exportSvc: ExportService,
    private bookingSvc: BookingService,
    private auth: AuthService,
    private snack: SnackbarService,
    private dialog: MatDialog,
  ) { }

  openLRDetails(lr: string): void {
    this.dialog.open(LrSearchDialogComponent, {
      width: '500px',
      data: { lr, hideEdit: true }
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent): void {
    params.api.sizeColumnsToFit();
  }

  getPaymentClass(mode?: string): string {
    const m: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return m[mode || ''] || '';
  }

  private toISO(d: any, eod = false): string {
    const dt = d instanceof Date ? new Date(d.getTime()) : new Date(d); if (eod) dt.setHours(23, 59, 59, 999);
    return dt.toISOString().slice(0, -1);
  }

  generate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.rowData = [];
    const { fromDate, toDate } = this.form.value;
    this.bookingSvc.getReport(this.toISO(fromDate!), this.toISO(toDate!, true), 'DISPATCHED', undefined, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.loading = false;
          this.rowData = mapReportContent(r.content);
          this.calcTotals(this.rowData);
        },
        error: () => { this.loading = false; this.snack.error('Failed to load dispatch report.'); }
      });
  }

  private calcTotals(data: Booking[]): void {
    const init = { count: 0, grandTotal: 0, paid: 0, toPay: 0, tbb: 0 };
    this.totals = data.reduce((acc: typeof init, b: Booking) => {
      acc.count++;
      const gt = calcBookingGrandTotal(b);
      acc.grandTotal += gt;
      if (b.billType === 'PAID') acc.paid += gt;
      if (b.billType === 'TO PAY') acc.toPay += gt;
      if (b.billType === 'TBB') acc.tbb += gt;
      return acc;
    }, { ...init });
    this.computeSummary(data);
  }

  applyQuickRange(range: string): void {
    this.activeRange = range;
    const toDate = new Date();
    const fromDate = new Date();

    if (range === '1W') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (range === '1M') {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }

    this.form.patchValue({ fromDate: fromDate as any, toDate: toDate as any });
    this.generate();
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
      'LR No': b.loadingReciept, 'Dispatch Date': b.dispatchDate, 'Consignor': b.consignorName,
      'Consignee': b.consigneeName, 'Destination': b.destinationBranchCode, 'Bill Type': b.billType, 'Total': calcBookingGrandTotal(b)
    })), 'dispatch-report.xlsx');
  }

  downloadPDF(action: 'download' | 'print'): void {
    const headers = ['LR No', 'Dispatch Date', 'Consignor', 'Consignee', 'Destination', 'Bill Type', 'Total'];
    const rows = this.rowData.map(b => [b.loadingReciept, b.dispatchDate, b.consignorName, b.consigneeName, b.destinationBranchCode, b.billType, calcBookingGrandTotal(b)]);
    this.exportSvc.exportPDF('Dispatch Report', headers, rows as any, action, 'dispatch-report.pdf');
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
