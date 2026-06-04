import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { StatementService } from '../../../../core/services/statement.service';
import { ExportService } from '../../../../core/services/export.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { StatementDto } from '../../../../shared/models/models';
import { LrSearchDialogComponent } from '../../dialogs/lr-search-dialog/lr-search-dialog.component';

@Component({
  selector: 'app-statements',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatDatepickerModule,
    AgGridAngular,
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>account_balance_wallet</mat-icon> Statements</h2>
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
        <mat-form-field>
          <mat-label>Payment Mode</mat-label>
          <mat-select formControlName="paymentMode">
            <mat-option value="">All</mat-option>
            <mat-option value="PAID">PAID</mat-option>
            <mat-option value="TO PAY">TO PAY</mat-option>
            <mat-option value="TBB">TBB</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="loading">
          <mat-icon>search</mat-icon> Generate
        </button>
      </form>
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      <div class="summary-stats" *ngIf="rowData.length">
        <div class="stat-card"><div class="stat-label">Records</div><div class="stat-value">{{ rowData.length }}</div></div>
        <div class="stat-card success"><div class="stat-label">Freight Total</div><div class="stat-value">₹{{ freightTotal | number:'1.0-0' }}</div></div>
        <div class="stat-card warning"><div class="stat-label">Other Charges</div><div class="stat-value">₹{{ otherChargesTotal | number:'1.0-0' }}</div></div>
      </div>
      <div class="action-bar" *ngIf="rowData.length">
        <button mat-stroked-button (click)="exportPDF('download')"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
        <button mat-stroked-button (click)="exportPDF('print')"><mat-icon>print</mat-icon> Print</button>
        <button mat-stroked-button color="primary" (click)="exportExcel()"><mat-icon>table_view</mat-icon> Excel</button>
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
      <div class="summary-section" *ngIf="summaryData.length > 0">
        <h3 class="summary-title">SUMMARY</h3>
        <div class="summary-table-wrapper">
          <table class="summary-table">
            <thead>
              <tr>
                <th>Payment Mode</th>
                <th>Count</th>
                <th>Freight</th>
                <th>Other Charges</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of summaryData">
                <td [class]="'payment-mode ' + this.getModeClass(row.paymentMode)">{{ row.paymentMode }}</td>
                <td>{{ row.count }}</td>
                <td>₹{{ row.freight | number:'1.2-2' }}</td>
                <td>₹{{ row.otherCharges | number:'1.2-2' }}</td>
                <td>₹{{ row.total | number:'1.2-2' }}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td><strong>{{ rowData.length }}</strong></td>
                <td><strong>₹{{ freightTotal | number:'1.2-2' }}</strong></td>
                <td><strong>₹{{ otherChargesTotal | number:'1.2-2' }}</strong></td>
                <td><strong>₹{{ totalAmount | number:'1.2-2' }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div *ngIf="!loading && rowData.length === 0" class="empty-state">
        <mat-icon>account_balance_wallet</mat-icon><p>No statements found. Choose a date range to view.</p>
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
      .payment-mode {
        &.paid { color: #065f46; font-weight: 600; }
        &.to-pay { color: #92400e; font-weight: 600; }
        &.tbb { color: #3730a3; font-weight: 600; }
      }
      .total-row {
        background: #e8f5e9;
        font-weight: 700;
        td {
          color: #2e7d32;
        }
      }
    }
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
export class StatementsComponent implements OnDestroy {
  private gridApi!: GridApi;

  form = this.fb.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    paymentMode: [''],
  });

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
    { headerName: 'Date', field: 'bookingDate', minWidth: 110, sortable: true,
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '' },
    { headerName: 'Consignor', field: 'consignorName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Payment', field: 'billType', minWidth: 100, sortable: true,
      cellClass: (p) => 'payment-cell ' + this.pmClass(p.value) },
    { headerName: 'Freight', field: 'freight', minWidth: 100, sortable: true,
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2) },
    { headerName: 'Other Charges', field: 'otherCharges', minWidth: 110, sortable: true,
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2) },
    { headerName: 'Total', field: 'total', minWidth: 110, sortable: true,
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
  ];

  defaultColDef: ColDef = { resizable: true, flex: 1, minWidth: 80 };

  rowData: StatementDto[] = [];
  loading = false;
  isMobile = window.innerWidth <= 768;
  totalAmount = 0;
  freightTotal = 0;
  otherChargesTotal = 0;
  summaryData: Array<{ paymentMode: string; count: number; freight: number; otherCharges: number; total: number }> = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private stmtSvc: StatementService,
    public exportSvc: ExportService,
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

  private formatDate(dateVal: any, endOfDay = false): string {
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (endOfDay) { d.setHours(23, 59, 59, 999); }
    return d.toISOString().slice(0, -1);
  }

  generate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.rowData = [];
    const v = this.form.value;
    this.stmtSvc.getStatements(this.auth.branchCode, this.formatDate(v.fromDate!), this.formatDate(v.toDate!, true), v.paymentMode || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: d => {
          this.loading = false; this.rowData = d;
          this.totalAmount = d.reduce((s, r) => s + (r.total || 0), 0);
          this.freightTotal = d.reduce((s, r) => s + (r.freight || 0), 0);
          this.otherChargesTotal = d.reduce((s, r) => s + (r.otherCharges || 0), 0);
          this.calculateSummary();
        },
        error: () => { this.loading = false; this.snack.error('Failed to load statements.'); }
      });
  }

  private calculateSummary(): void {
    const summary: Record<string, { count: number; freight: number; otherCharges: number; total: number }> = {};
    this.rowData.forEach(row => {
      const mode = row.billType || 'UNKNOWN';
      if (!summary[mode]) {
        summary[mode] = { count: 0, freight: 0, otherCharges: 0, total: 0 };
      }
      summary[mode].count++;
      summary[mode].freight += row.freight || 0;
      summary[mode].otherCharges += row.otherCharges || 0;
      summary[mode].total += row.total || 0;
    });
    this.summaryData = Object.entries(summary)
      .map(([mode, data]) => ({ paymentMode: mode, ...data }))
      .sort((a, b) => a.paymentMode.localeCompare(b.paymentMode));
  }

  pmClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m || ''] || '';
  }

  getModeClass(m: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m] || '';
  }

  exportPDF(action: 'download' | 'print'): void {
    const headers = ['LR No', 'Date', 'Consignor', 'Consignee', 'Payment', 'Freight', 'Other Charges', 'Total'];
    const rows = this.rowData.map(r => [r.loadingReciept, r.bookingDate, r.consignorName, r.consigneeName, r.billType, r.freight, r.otherCharges, r.total]);
    this.exportSvc.exportPDF('Statement Report', headers, rows as any, action, 'statement.pdf');
  }

  exportExcel(): void {
    this.exportSvc.exportExcel(this.rowData.map(r => ({
      'LR': r.loadingReciept, 'Date': r.bookingDate, 'Consignor': r.consignorName, 'Consignee': r.consigneeName,
      'Payment': r.billType, 'Freight': r.freight, 'Other Charges': r.otherCharges, 'Total': r.total
    })), 'statement.xlsx');
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
