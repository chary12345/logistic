import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { calcBookingGrandTotal, mapReportContent, calcOtherCharges } from '../../../../shared/utils/booking-report.util';
import { formatAppDate } from '../../../../shared/utils/date.util';
import { LrSearchDialogComponent } from '../../dialogs/lr-search-dialog/lr-search-dialog.component';

@Component({
  selector: 'app-booking-report',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatDatepickerModule,
    AgGridAngular,
  ],
  templateUrl: './booking-report.component.html',
  styleUrls: ['./booking-report.component.scss']
})
export class BookingReportComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;

  form = this.fb.group({
    fromDate: ['', Validators.required],
    toDate:   ['', Validators.required],
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
    { headerName: 'Date', field: 'bookingDate', minWidth: 130, sortable: true,
      valueFormatter: p => formatAppDate(p.value) },
    { headerName: 'Consignor / Party', field: 'consignorName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Destination', field: 'destinationBranchCode', minWidth: 110, sortable: true, filter: true },
    { headerName: 'Payment', field: 'billType', minWidth: 100, sortable: true,
      cellClass: (p) => 'payment-cell ' + this.getPaymentClass(p.value) },
    { headerName: 'Other Charges', minWidth: 110, sortable: true, filter: 'agNumberColumnFilter',
      valueGetter: p => calcOtherCharges(p.data), valueFormatter: p => '₹' + (p.value || 0).toFixed(2) },
    { headerName: 'Total', minWidth: 110, sortable: true,
      valueGetter: p => calcBookingGrandTotal(p.data),
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
    { headerName: 'Status', field: 'consignStatus', minWidth: 100, sortable: true },
  ];

  defaultColDef: ColDef = {
    resizable: true,
    flex: 1,
    minWidth: 80,
  };

  rowData: Booking[] = [];
  loading    = false;
  hasMore    = false;
  lastId     = '';
  isMobile   = window.innerWidth <= 768;
  activeRange: string | null = null;

  totals = { count: 0, grandTotal: 0, paid: 0, toPay: 0, tbb: 0 };
  summaryRows: BookingSummaryRow[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb:         FormBuilder,
    private bookingSvc: BookingService,
    private exportSvc:  ExportService,
    private auth:       AuthService,
    private snack:      SnackbarService,
    private dialog:     MatDialog,
  ) {}

  openLRDetails(lr: string): void {
    this.dialog.open(LrSearchDialogComponent, {
      width: '500px',
      data: { lr, hideEdit: true }
    });
  }

  ngOnInit(): void {}

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent): void {
    params.api.sizeColumnsToFit();
  }

  private toISOLocal(dateVal: any, endOfDay = false): string {
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (endOfDay) { d.setHours(23, 59, 59, 999); }
    return d.toISOString().slice(0, -1);
  }

  generate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.lastId = '';
    this.rowData = [];
    this.loading = true;

    const { fromDate, toDate } = this.form.value;
    this.fetchAll(this.toISOLocal(fromDate!), this.toISOLocal(toDate!, true));
  }

  applyQuickRange(range: string): void {
    this.activeRange = range;
    const toDate = new Date();
    const fromDate = new Date();

    if (range === '1W') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (range === '1M') {
      fromDate.setMonth(fromDate.getMonth() - 1);
    } // 1D is just today, which is the default for new Date()

    this.form.patchValue({ fromDate: fromDate as any, toDate: toDate as any });
    this.generate();
  }

  private fetchAll(fromDate: string, toDate: string, lastId?: string): void {
    this.bookingSvc.getReport(fromDate, toDate, 'BOOKED', lastId, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = mapReportContent(res.content);
          this.rowData = [...this.rowData, ...items];
          const isLast = res.last ?? true;
          if (!isLast && items.length) {
            const nextLastId = res.lastId || items[items.length - 1]?.loadingReciept || '';
            this.fetchAll(fromDate, toDate, nextLastId);
          } else {
            this.loading = false;
            this.calcTotals(this.rowData);
          }
        },
        error: () => { this.loading = false; this.snack.error('Failed to load report.'); }
      });
  }

  private calcTotals(data: Booking[]): void {
    const init = { count: 0, grandTotal: 0, paid: 0, toPay: 0, tbb: 0 };
    this.totals = data.reduce((acc: typeof init, b: Booking) => {
      acc.count++;
      const gt = calcBookingGrandTotal(b);
      acc.grandTotal += gt;
      if (b.billType === 'PAID')    acc.paid  += gt;
      if (b.billType === 'TO PAY')  acc.toPay += gt;
      if (b.billType === 'TBB')     acc.tbb   += gt;
      return acc;
    }, { ...init });
    this.computeSummary(data);
  }

  private computeSummary(bookings: Booking[]): void {
    if (!bookings.length) { this.summaryRows = []; return; }

    const calc = (list: Booking[]) => {
      const totalFreight = list.reduce((s, b) => s + (b.freight || 0), 0);
      const totalOtherCharges = list.reduce((s, b) => s + calcOtherCharges(b), 0);
      const gst = list.reduce((s, b) => s + (b.sgst || 0) + (b.cgst || 0) + (b.igst || 0), 0);
      const grandTotal = list.reduce((s, b) => s + calcBookingGrandTotal(b), 0);
      return { totalFreight, totalOtherCharges, gst, grandTotal };
    };

    const isManual = (b: Booking) => b.bookingtype === 'Manual' || (b.loadingReciept && b.loadingReciept.includes('_M'));
    const auto = bookings.filter(b => !isManual(b));
    const manual = bookings.filter(b => isManual(b));
    const all = calc(bookings);

    this.summaryRows = [
      { type: 'Auto', ...calc(auto) },
      { type: 'Manual', ...calc(manual) },
      { type: 'Total', ...all },
    ];
  }

  downloadPDF(action: 'download'|'print' = 'download'): void {
    const headers = ['LR No','Date','Consignor','Consignee','Destination','Payment','Total','Status'];
    const rows = this.rowData.map(b => [
      b.loadingReciept, formatAppDate(b.bookingDate), b.consignorName, b.consigneeName,
      b.destinationBranchCode, b.billType, calcBookingGrandTotal(b), b.consignStatus
    ]);
    this.exportSvc.exportPDF('Booking Report', headers, rows as any, action, 'booking-report.pdf');
  }

  downloadExcel(): void {
    this.exportSvc.exportExcel(
      this.rowData.map(b => ({
        'LR No': b.loadingReciept, 'Date': formatAppDate(b.bookingDate), 'Consignor': b.consignorName,
        'Consignee': b.consigneeName, 'Destination': b.destinationBranchCode,
        'Payment': b.billType, 'Total': calcBookingGrandTotal(b), 'Status': b.consignStatus,
      })),
      'booking-report.xlsx'
    );
  }

  getPaymentClass(mode?: string): string {
    const m: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return m[mode || ''] || '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
