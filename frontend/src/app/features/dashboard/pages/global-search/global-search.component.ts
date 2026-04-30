import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { Subject, takeUntil } from 'rxjs';
import { BookingService } from '../../../../core/services/booking.service';
import { RegionService } from '../../../../core/services/region.service';
import { ExportService } from '../../../../core/services/export.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking, BookingSummaryRow } from '../../../../shared/models/models';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatDatepickerModule,
    AgGridAngular,
  ],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private datePipe = new DatePipe('en-US');

  form = this.fb.group({
    fromDate:  ['', Validators.required],
    toDate:    ['', Validators.required],
    region:    [''],
    subRegion: [''],
    branchCode:[''],
  });

  regions:    string[] = [];
  subRegions: string[] = [];
  branches:   string[] = [];
  rowData: Booking[] = [];
  loading = false;
  isMobile = window.innerWidth <= 768;

  columnDefs: ColDef[] = [
    { headerName: 'LR No', field: 'loadingReciept', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Date', field: 'bookingDate', minWidth: 110, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy') || '' },
    { headerName: 'Consignor / Party', field: 'consignorName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 120, sortable: true, filter: true },
    { headerName: 'Destination', field: 'destinationBranchCode', minWidth: 110, sortable: true, filter: true },
    { headerName: 'Payment', field: 'billType', minWidth: 100, sortable: true,
      cellClass: (p) => 'payment-cell ' + this.getPaymentClass(p.value) },
    { headerName: 'Total', minWidth: 110, sortable: true,
      valueGetter: p => this.calcTotal(p.data),
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
    { headerName: 'Status', field: 'consignStatus', minWidth: 100, sortable: true },
  ];

  defaultColDef: ColDef = { resizable: true, flex: 1, minWidth: 80 };

  totals = { count: 0, grandTotal: 0 };
  summaryRows: BookingSummaryRow[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bookingSvc: BookingService,
    private regionSvc: RegionService,
    public exportSvc: ExportService,
    private auth: AuthService,
    private snack: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.regionSvc.getRegions(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.regions = r, error: () => {} });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent): void {
    params.api.sizeColumnsToFit();
  }

  onRegion(v: string): void {
    this.subRegions = []; this.branches = []; this.form.patchValue({ subRegion: '', branchCode: '' });
    if (!v) return;
    this.regionSvc.getSubRegions(v).pipe(takeUntil(this.destroy$)).subscribe({ next: s => this.subRegions = s, error: () => {} });
  }

  onSubRegion(v: string): void {
    this.branches = []; this.form.patchValue({ branchCode: '' });
    const region = this.form.value.region;
    if (!v || !region) return;
    this.regionSvc.getBranches(region, v).pipe(takeUntil(this.destroy$)).subscribe({ next: b => this.branches = b, error: () => {} });
  }

  private toISOLocal(dateVal: any, endOfDay = false): string {
    const d = dateVal instanceof Date ? new Date(dateVal.getTime()) : new Date(dateVal);
    if (endOfDay) { d.setHours(23, 59, 59, 999); }
    return d.toISOString().slice(0, -1);
  }

  search(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.rowData = [];
    const v = this.form.value;
    this.bookingSvc.globalSearch({
      fromDate:   this.toISOLocal(v.fromDate!),
      toDate:     this.toISOLocal(v.toDate!, true),
      region:     v.region || undefined,
      subRegion:  v.subRegion || undefined,
      branchCode: v.branchCode || undefined,
      companyCode: this.auth.companyCode,
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.loading = false;
          const items = r.content || [];
          this.rowData = items;
          this.totals = { count: items.length, grandTotal: items.reduce((s,b) => s + this.calcTotal(b), 0) };
          this.computeSummary(items);
        },
        error: () => { this.loading = false; this.snack.error('Global search failed.'); }
      });
  }

  calcTotal(b: Booking): number {
    if (!b) return 0;
    return (b.freight||0) + (b.loading||0) + (b.loadingCharge||0) + (b.sgst||0) + (b.cgst||0) + (b.igst||0);
  }

  getPaymentClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m||''] || '';
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

  downloadExcel(): void {
    this.exportSvc.exportExcel(this.rowData.map(b => ({
      'LR':b.loadingReciept,'Date':b.bookingDate,'Consignor':b.consignorName,'Consignee':b.consigneeName,
      'Destination':b.destinationBranchCode,'Payment':b.billType,'Total':this.calcTotal(b),'Status':b.consignStatus
    })), 'global-search.xlsx');
  }

  downloadPDF(action: 'download'|'print'): void {
    const headers = ['LR','Date','Consignor','Consignee','Dest','Mode','Total','Status'];
    const rows = this.rowData.map(b => [
      b.loadingReciept, b.bookingDate, b.consignorName, b.consigneeName,
      b.destinationBranchCode, b.billType, this.calcTotal(b), b.consignStatus
    ]);
    this.exportSvc.exportPDF('Global Search', headers, rows as any, action, 'global-search.pdf');
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
