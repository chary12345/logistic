import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { OperationService } from '../../../../core/services/operation.service';
import { RegionService } from '../../../../core/services/region.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking, BranchOption, BookingSummaryRow, VehicleDTO } from '../../../../shared/models/models';
import { DispatchDetailsDialogComponent } from '../../dialogs/dispatch-details-dialog/dispatch-details-dialog.component';

@Component({
  selector: 'app-dispatch-operations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatDialogModule,
    AgGridAngular,
  ],
  templateUrl: './dispatch-operations.component.html',
  styleUrls: ['./dispatch-operations.component.scss']
})
export class DispatchOperationsComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private datePipe = new DatePipe('en-US');

  filterForm = this.fb.group({
    region: [''], subRegion: [''], branchCode: [''],
  });

  regions: string[] = [];
  subRegions: string[] = [];
  branchOptions: BranchOption[] = [];
  vehicles: VehicleDTO[] = [];

  rowData: Booking[] = [];
  selectedRows: Booking[] = [];
  loading = false;

  // Booking summary
  summaryRows: BookingSummaryRow[] = [];

  columnDefs: ColDef[] = [
    { headerName: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50,
      pinned: 'left', sortable: false, filter: false, resizable: false, suppressMovable: true },
    { headerName: 'Loading Receipt', field: 'loadingReciept', minWidth: 130, pinned: 'left',
      sortable: true, filter: true },
    { headerName: 'Consignor Name', field: 'consignorName', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignor Mobile', field: 'consignorMobile', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignee Name', field: 'consigneeName', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignee Mobile', field: 'consigneeMobile', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Article Type', field: 'bookingtype', minWidth: 100, sortable: true, filter: true,
      valueFormatter: p => p.value || '—' },
    { headerName: 'Freight', field: 'freight', minWidth: 90, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'SGST', field: 'sgst', minWidth: 70, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'CGST', field: 'cgst', minWidth: 70, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'IGST', field: 'igst', minWidth: 70, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'Loading', field: 'loading', minWidth: 80, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'Loading Charges', field: 'loadingCharge', minWidth: 120, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'Consign Status', field: 'consignStatus', minWidth: 120, sortable: true, filter: true,
      cellClass: (p) => 'status-cell ' + (p.value === 'BOOKED' ? 'booked' : '') },
    { headerName: 'Booking Date', field: 'bookingDate', minWidth: 120, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'M/dd/yyyy') || '' },
  ];

  defaultColDef: ColDef = {
    resizable: true, flex: 1, minWidth: 70,
    sortable: true,
    autoHeaderHeight: true,
    wrapHeaderText: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private opSvc: OperationService,
    private regionSvc: RegionService,
    private vehSvc: VehicleService,
    private snack: SnackbarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.regionSvc.getRegions(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.regions = r, error: () => { } });

    this.vehSvc.getActive(this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: v => this.vehicles = v, error: () => { } });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent): void {
    params.api.sizeColumnsToFit();
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedRows = event.api.getSelectedRows();
  }

  onRegion(v: string): void {
    this.subRegions = []; this.branchOptions = [];
    this.filterForm.patchValue({ subRegion: '', branchCode: '' });
    if (!v) return;
    this.regionSvc.getSubRegions(v).pipe(takeUntil(this.destroy$)).subscribe({ next: s => this.subRegions = s, error: () => { } });
  }

  onSubRegion(v: string): void {
    this.branchOptions = []; this.filterForm.patchValue({ branchCode: '' });
    const r = this.filterForm.value.region;
    if (!v || !r) return;
    this.regionSvc.getBranches(r, v).pipe(takeUntil(this.destroy$)).subscribe({
      next: (branches: string[]) => {
        // Backend returns "BranchName-BranchCode" format — parse into { label, code }
        this.branchOptions = branches.map(b => {
          const idx = b.lastIndexOf('-');
          return idx > -1
            ? { label: b.substring(0, idx).trim(), code: b.substring(idx + 1).trim() }
            : { label: b, code: b };
        });
      },
      error: () => { }
    });
  }

  fetchBookings(): void {
    this.loading = true; this.selectedRows = []; this.summaryRows = [];
    const v = this.filterForm.value;
    this.opSvc.getBookingsWithFilter({
      region: v.region || undefined,
      subregion: v.subRegion || undefined,
      branchCode: v.branchCode || undefined,
      status: 'BOOKED',
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: b => {
          this.loading = false;
          this.rowData = b;
          this.computeSummary(b);
        },
        error: () => { this.loading = false; this.snack.error('Failed to load bookings.'); }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({ region: '', subRegion: '', branchCode: '' });
    this.subRegions = []; this.branchOptions = [];
    this.rowData = []; this.selectedRows = []; this.summaryRows = [];
  }

  computeSummary(bookings: Booking[]): void {
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

  calcTotal(b: Booking): number {
    if (!b) return 0;
    return (b.freight||0) + (b.loading||0) + (b.loadingCharge||0) + (b.sgst||0) + (b.cgst||0) + (b.igst||0);
  }

  openDispatch(): void {
    if (!this.selectedRows.length) { this.snack.warning('Select at least one booking to dispatch.'); return; }
    this.dialog.open(DispatchDetailsDialogComponent, {
      data: { selected: this.selectedRows, vehicles: this.vehicles, branchCode: this.auth.branchCode, companyCode: this.auth.companyCode },
      width: '560px', maxWidth: '95vw', disableClose: true,
    }).afterClosed().subscribe(success => {
      if (success) { this.selectedRows = []; this.fetchBookings(); }
    });
  }

  getPaymentClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m || ''] || '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
