import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { Subject, takeUntil, startWith } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { OperationService } from '../../../../core/services/operation.service';
import { RegionService } from '../../../../core/services/region.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { BranchService } from '../../../../core/services/branch.service';
import { BookingService } from '../../../../core/services/booking.service';
import {
  Booking, BranchOption, BookingSummaryRow, VehicleDTO,
  DispatchedResponseDTO, LoadingSheetInfo
} from '../../../../shared/models/models';
import { DispatchDetailsDialogComponent } from '../../dialogs/dispatch-details-dialog/dispatch-details-dialog.component';
import { LrSearchDialogComponent } from '../../dialogs/lr-search-dialog/lr-search-dialog.component';
import { DispatchSuccessDialogComponent } from '../../dialogs/dispatch-success-dialog/dispatch-success-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { calcOtherCharges, calcBookingGrandTotal } from '../../../../shared/utils/booking-report.util';
import { formatAppDate } from '../../../../shared/utils/date.util';

import { ExportService } from '../../../../core/services/export.service';

@Component({
  selector: 'app-dispatch-operations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressBarModule,
    MatProgressSpinnerModule, MatDialogModule, MatTabsModule,
    MatCheckboxModule, MatTooltipModule,
    AgGridAngular,
  ],
  templateUrl: './dispatch-operations.component.html',
  styleUrls: ['./dispatch-operations.component.scss']
})
export class DispatchOperationsComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private destroy$ = new Subject<void>();

  // ── Dispatch Tab ─────────────────────────────────────────────────────────
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
  summaryRows: BookingSummaryRow[] = [];

  columnDefs: ColDef[] = [
    { headerName: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50,
      pinned: 'left', sortable: false, filter: false, resizable: false, suppressMovable: true },
    {
      headerName: 'Loading Receipt', field: 'loadingReciept', minWidth: 130, pinned: 'left',
      sortable: true, filter: true,
      cellRenderer: (p: any) => {
        if (!p.value) return '';
        return `<a class="lr-link" style="color:#0b5ed7;font-weight:600;text-decoration:underline;cursor:pointer;">${p.value}</a>`;
      },
      onCellClicked: (params: any) => { if (params.value) this.openLRDetails(params.value); }
    },
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
    { headerName: 'Other Charges', minWidth: 100, sortable: true, filter: 'agNumberColumnFilter',
      valueGetter: p => calcOtherCharges(p.data), valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'Total', minWidth: 90, sortable: true, filter: 'agNumberColumnFilter',
      valueGetter: p => calcBookingGrandTotal(p.data), valueFormatter: p => (p.value ?? 0).toLocaleString() },
    { headerName: 'Consign Status', field: 'consignStatus', minWidth: 120, sortable: true, filter: true,
      cellClass: (p) => 'status-cell ' + (p.value === 'BOOKED' ? 'booked' : '') },
    { headerName: 'Booking Date', field: 'bookingDate', minWidth: 120, sortable: true,
      valueFormatter: p => formatAppDate(p.value) },
  ];

  defaultColDef: ColDef = {
    resizable: true, flex: 1, minWidth: 70,
    sortable: true, autoHeaderHeight: true, wrapHeaderText: true,
  };

  // ── Edit Tab ─────────────────────────────────────────────────────────────
  lsSearchText = '';
  lsSearchLoading = false;
  editResults: DispatchedResponseDTO[] = [];   // search results list
  activeEditEntry: DispatchedResponseDTO | null = null;
  editSelectedRow: Booking | null = null;      // single LR selected in Edit tab

  // Edit LR dialog form (inline)
  showEditLrDialog = false;
  editLrForm = this.fb.group({
    unloadingBranch: ['', Validators.required],
    vehicleNumber:   [''],
  });
  editLrTarget: Booking | null = null;
  editLrLoading = false;
  destinationSuggestions: string[] = [];
  filteredDestinations: string[] = [];
  destinationFilterCtrl = new FormControl('');

  // Add LR dialog (inline)
  showAddLrDialog = false;
  addLrSearchText = '';
  addLrSearchLoading = false;
  addLrResult: Booking | null = null;
  addLrError = '';

  cancelLsLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private opSvc: OperationService,
    private regionSvc: RegionService,
    private vehSvc: VehicleService,
    private branchSvc: BranchService,
    private bookSvc: BookingService,
    private snack: SnackbarService,
    private dialog: MatDialog,
    private exportSvc: ExportService,
  ) {}

  ngOnInit(): void {
    this.regionSvc.getRegions(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.regions = r || [], error: () => {} });

    this.vehSvc.getActive(this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: v => this.vehicles = v, error: () => {} });

    // Destination branch filter for Edit LR dialog
    this.destinationFilterCtrl.valueChanges
      .pipe(startWith(''), takeUntil(this.destroy$))
      .subscribe(val => this.filterDestinations(val || ''));

    this.loadBranchDestinations();
  }

  // ── Dispatch tab methods ─────────────────────────────────────────────────

  openLRDetails(lr: string): void {
    this.dialog.open(LrSearchDialogComponent, { width: '500px', data: { lr, hideEdit: true } });
  }

  onGridReady(params: GridReadyEvent): void { this.gridApi = params.api; this.gridApi.sizeColumnsToFit(); }
  onGridSizeChanged(params: GridSizeChangedEvent): void { params.api.sizeColumnsToFit(); }
  onSelectionChanged(event: SelectionChangedEvent): void { this.selectedRows = event.api.getSelectedRows(); }

  onRegion(regionName: string): void {
    this.subRegions = []; this.branchOptions = [];
    this.filterForm.patchValue({ subRegion: '', branchCode: '' });
    this.filterForm.get('branchCode')?.enable();
    if (!regionName) return;
    this.regionSvc.getSubRegions(regionName).pipe(takeUntil(this.destroy$))
      .subscribe({ next: c => this.subRegions = c ? ['All', ...c] : ['All'], error: () => {} });
  }

  onSubRegion(subRegionName: string): void {
    this.branchOptions = []; this.filterForm.patchValue({ branchCode: '' });
    const regionName = this.filterForm.getRawValue().region;
    
    if (subRegionName === 'All') {
      this.filterForm.get('branchCode')?.disable();
      return;
    } else {
      this.filterForm.get('branchCode')?.enable();
    }
    
    if (!subRegionName || !regionName) return;
    this.regionSvc.getBranches(regionName, subRegionName).pipe(takeUntil(this.destroy$)).subscribe({
      next: (branches: string[]) => {
        this.branchOptions = branches.map(b => {
          const idx = b.lastIndexOf('-');
          return idx > -1
            ? { label: b.substring(0, idx).trim(), code: b.substring(idx + 1).trim() }
            : { label: b, code: b };
        }).filter(b => b.code !== this.auth.branchCode);
      },
      error: () => {}
    });
  }

  fetchBookings(): void {
    this.loading = true; this.selectedRows = []; this.summaryRows = [];
    const rawV = this.filterForm.getRawValue();
    const reqSubregion = rawV.subRegion === 'All' ? undefined : (rawV.subRegion || undefined);
    const reqBranchCode = rawV.subRegion === 'All' ? undefined : (rawV.branchCode || undefined);
    this.opSvc.getBookingsWithFilter({
      region: rawV.region || undefined,
      subregion: reqSubregion,
      fromBranchCode: this.auth.branchCode,
      ToBranchCode: reqBranchCode,
      status: 'BOOKED',
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: b => { this.loading = false; this.rowData = b; this.computeSummary(b); },
      error: () => { this.loading = false; this.snack.error('Failed to load bookings.'); }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({ region: '', subRegion: '', branchCode: '' });
    this.filterForm.get('branchCode')?.enable();
    this.subRegions = []; this.branchOptions = [];
    this.rowData = []; this.selectedRows = []; this.summaryRows = [];
  }

  computeSummary(bookings: Booking[]): void {
    if (!bookings.length) { this.summaryRows = []; return; }
    const calc = (list: Booking[]) => ({
      totalFreight: list.reduce((s, b) => s + (b.freight || 0), 0),
      totalOtherCharges: list.reduce((s, b) => s + calcOtherCharges(b), 0),
      gst: list.reduce((s, b) => s + (b.sgst || 0) + (b.cgst || 0) + (b.igst || 0), 0),
      grandTotal: list.reduce((s, b) => s + calcBookingGrandTotal(b), 0),
    });
    const auto = bookings.filter(b => b.bookingtype !== 'Manual');
    const manual = bookings.filter(b => b.bookingtype === 'Manual');
    this.summaryRows = [
      { type: 'Auto', ...calc(auto) },
      { type: 'Manual', ...calc(manual) },
      { type: 'Total', ...calc(bookings) },
    ];
  }

  openDispatch(): void {
    if (!this.selectedRows.length) { this.snack.warning('Select at least one booking to dispatch.'); return; }
    
    // Save the selected rows because they contain fully loaded details (charges etc)
    const dispatchedBookings = [...this.selectedRows];

    this.dialog.open(DispatchDetailsDialogComponent, {
      data: { selected: this.selectedRows, vehicles: this.vehicles, branchCode: this.auth.branchCode, companyCode: this.auth.companyCode },
      width: '560px', maxWidth: '95vw', disableClose: true,
    }).afterClosed().subscribe(res => {
      if (res) {
        this.selectedRows = [];
        this.fetchBookings();
        if (res.loadingSheet) {
          // Attach full branch names for UI and PDF
          const lrDestBranch = dispatchedBookings[0]?.destinationBranchCode || this.auth.branchName;
          res.loadingSheet.fromBranch = this.getFullBranchName(lrDestBranch);
          res.loadingSheet.destinationBranch = this.getFullBranchName(res.loadingSheet.destinationBranch);
          
          // Use the saved rows rather than raw response to guarantee full charge mappings
          res.loadingSheet.bookings = this._formatBookingsForPdf({
            loadingSheet: res.loadingSheet,
            bookings: dispatchedBookings
          } as any);
          this.dialog.open(DispatchSuccessDialogComponent, {
            data: res.loadingSheet,
            width: '460px', maxWidth: '95vw', disableClose: true,
          });
        }
      }
    });
  }

  getPaymentClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m || ''] || '';
  }

  // ── Edit Tab methods ─────────────────────────────────────────────────────

  /** Search an LS by number */
  searchLS(): void {
    if (!this.lsSearchText) { this.snack.warning('Enter a valid LS number.'); return; }
    const num = parseInt(this.lsSearchText.toString().trim(), 10);
    if (!num || isNaN(num)) { this.snack.warning('Enter a valid LS number.'); return; }

    this.lsSearchLoading = true;
    this.editResults = [];
    this.activeEditEntry = null;
    this.editSelectedRow = null;

    this.opSvc.searchLSByNumber(num)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.lsSearchLoading = false;
          if (res.loadingSheet?.status === 'CANCELLED') {
             res.bookings = [];
          }
          this.editResults = [res];
        },
        error: () => { this.lsSearchLoading = false; this.snack.error('LS not found.'); }
      });
  }

  clearLsSearch(): void {
    this.lsSearchText = '';
    this.editResults = [];
    this.activeEditEntry = null;
    this.editSelectedRow = null;
  }

  editSelectLS(entry: DispatchedResponseDTO): void {
    this.activeEditEntry = this.activeEditEntry === entry ? null : entry;
    this.editSelectedRow = null;
  }

  onEditLrSelect(booking: Booking): void {
    this.editSelectedRow = this.editSelectedRow === booking ? null : booking;
  }

  getLsStatus(ls?: LoadingSheetInfo): string { return ls?.status || 'DISPATCHED'; }

  getLrCount(entry: DispatchedResponseDTO): number { return (entry.bookings || []).length; }

  trackByLsId(_i: number, e: DispatchedResponseDTO): number {
    return e.loadingSheet?.loadingSheetNumber ?? _i;
  }

  // ── Cancel LS ────────────────────────────────────────────────────────────
  cancelLS(entry: DispatchedResponseDTO): void {
    const lsId = entry.loadingSheet?.loadingSheetNumber;
    if (!lsId) return;
    
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Loading Sheet',
        message: `Are you sure you want to cancel LS <b>#${lsId}</b>?<br><br>All associated LRs will revert to BOOKED status.`,
        confirmText: 'Cancel LS',
        confirmColor: 'warn',
        icon: 'cancel'
      }
    }).afterClosed().subscribe(res => {
      if (!res) return;
      this.cancelLsLoading = true;
      this.opSvc.cancelLS(lsId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cancelLsLoading = false;
            this.snack.success(`LS #${lsId} cancelled. LRs moved back to Dispatch.`);
            // Update local status so UI shows CANCELLED
            if (entry.loadingSheet) entry.loadingSheet.status = 'CANCELLED';
            entry.bookings = [];
            this.activeEditEntry = null;
            this.editSelectedRow = null;
          },
          error: () => { this.cancelLsLoading = false; this.snack.error('Failed to cancel LS.'); }
        });
    });
  }

  // ── Print / Download LS ──────────────────────────────────────────────────
  getFromBranch(entry: DispatchedResponseDTO): string {
    const code = entry.bookings?.[0]?.destinationBranchCode || entry.loadingSheet?.fromBranch || this.auth.branchName;
    return this.getFullBranchName(code);
  }

  getUnloadingBranch(b: Booking): string {
    return (b as any)['unloadingBranch'] || '';
  }

  private _formatBookingsForPdf(entry: DispatchedResponseDTO): Booking[] {
    return (entry.bookings || []).map(b => ({
      ...b,
      formattedFrom: this.getFullBranchName(b.destinationBranchCode),
      formattedTo: this.getFullBranchName((b as any)['unloadingBranch'] || entry.loadingSheet?.destinationBranch)
    }));
  }

  printLS(entry: DispatchedResponseDTO): void {
    if (entry.loadingSheet) {
      entry.loadingSheet.fromBranch = this.getFromBranch(entry);
      entry.loadingSheet.destinationBranch = this.getFullBranchName(entry.loadingSheet.destinationBranch);
      this.exportSvc.generateLSReceipt(entry.loadingSheet, this._formatBookingsForPdf(entry), 'print');
    }
  }

  downloadLS(entry: DispatchedResponseDTO): void {
    if (entry.loadingSheet) {
      entry.loadingSheet.fromBranch = this.getFromBranch(entry);
      entry.loadingSheet.destinationBranch = this.getFullBranchName(entry.loadingSheet.destinationBranch);
      this.exportSvc.generateLSReceipt(entry.loadingSheet, this._formatBookingsForPdf(entry), 'download');
    }
  }

  getGrandTotal(b: Booking): number {
    return calcBookingGrandTotal(b);
  }

  // ── Edit LR dialog ───────────────────────────────────────────────────────
  openEditLr(booking: Booking): void {
    this.editLrTarget = booking;
    const destCode = (booking as any)['unloadingBranch'] || this.activeEditEntry?.loadingSheet?.destinationBranch || '';
    const matchingDest = this.destinationSuggestions.find(d => d.includes(`(${destCode})`) || d.startsWith(destCode)) || destCode;
    const currentVehicle = this.activeEditEntry?.loadingSheet?.vehicleNumber || '';

    this.editLrForm.patchValue({
      unloadingBranch: matchingDest,
      vehicleNumber: currentVehicle,
    });
    this.destinationFilterCtrl.setValue('');
    this.showEditLrDialog = true;
  }

  closeEditLrDialog(): void { this.showEditLrDialog = false; this.editLrTarget = null; }

  submitEditLr(): void {
    if (this.editLrForm.invalid) { this.editLrForm.markAllAsTouched(); return; }
    const lsId = this.activeEditEntry?.loadingSheet?.loadingSheetNumber;
    const lrId = this.editLrTarget?.loadingReciept;
    if (!lsId || !lrId) return;

    const f = this.editLrForm.value;
    const unBranchVal = f.unloadingBranch!;
    const match = unBranchVal.match(/\(([^)]+)\)$/);
    const codeToSave = match ? match[1] : unBranchVal;

    this.editLrLoading = true;
    this.opSvc.editLrInLS(lsId, lrId, {
      unloadingBranch: codeToSave,
      vehicleNumber: f.vehicleNumber || '',
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editLrLoading = false;
          // Update local data
          if (this.editLrTarget) {
            (this.editLrTarget as any)['unloadingBranch'] = codeToSave;
          }
          if (this.activeEditEntry?.loadingSheet && f.vehicleNumber) {
            this.activeEditEntry.loadingSheet.vehicleNumber = f.vehicleNumber;
          }
          this.snack.success('LR updated successfully.');
          this.closeEditLrDialog();
          this.editSelectedRow = null;
        },
        error: () => { this.editLrLoading = false; this.snack.error('Failed to update LR.'); }
      });
  }

  // ── Remove LR ────────────────────────────────────────────────────────────
  removeLr(booking: Booking): void {
    const lsId = this.activeEditEntry?.loadingSheet?.loadingSheetNumber;
    const lrId = booking.loadingReciept;
    if (!lsId || !lrId) return;
    
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove LR',
        message: `Remove LR <b>${lrId}</b> from LS #${lsId}?<br><br>It will return to the Dispatch list.`,
        confirmText: 'Remove',
        confirmColor: 'warn',
        icon: 'delete'
      }
    }).afterClosed().subscribe(res => {
      if (!res) return;
      this.opSvc.removeLrFromLS(lsId, lrId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.activeEditEntry?.bookings) {
              this.activeEditEntry.bookings = this.activeEditEntry.bookings.filter(b => b.loadingReciept !== lrId);
            }
            this.editSelectedRow = null;
            this.snack.success(`LR ${lrId} removed and returned to Dispatch.`);
          },
          error: () => this.snack.error('Failed to remove LR.')
        });
    });
  }

  // ── Add LR dialog ────────────────────────────────────────────────────────
  openAddLrDialog(): void {
    this.addLrSearchText = '';
    this.addLrResult = null;
    this.addLrError = '';
    this.showAddLrDialog = true;
  }

  closeAddLrDialog(): void { this.showAddLrDialog = false; }

  searchAddLr(): void {
    const lr = this.addLrSearchText.trim();
    if (!lr) { this.snack.warning('Enter an LR number.'); return; }

    this.addLrSearchLoading = true;
    this.addLrResult = null;
    this.addLrError = '';

    // Use bookingService to search LR directly
    this.bookSvc.searchByLR(lr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking: any) => {
          this.addLrSearchLoading = false;
          if (booking && booking.consignStatus === 'BOOKED') {
            this.addLrResult = booking as Booking;
          } else if (booking) {
            this.addLrError = `LR is in ${booking.consignStatus} state — only BOOKED LRs can be added.`;
          } else {
            this.addLrError = 'LR not found.';
          }
        },
        error: () => { this.addLrSearchLoading = false; this.addLrError = 'LR not found.'; }
      });
  }

  addLrLoading = false;

  confirmAddLr(): void {
    const lsId = this.activeEditEntry?.loadingSheet?.loadingSheetNumber;
    const lrId = this.addLrResult?.loadingReciept;
    if (!lsId || !lrId) return;

    this.addLrLoading = true;
    this.opSvc.addLrToLS(lsId, lrId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addLrLoading = false;
          if (this.activeEditEntry?.bookings && this.addLrResult) {
            this.addLrResult.consignStatus = 'DISPATCHED';
            const exists = this.activeEditEntry.bookings.some(b => b.loadingReciept === lrId);
            if (!exists) {
              this.activeEditEntry.bookings = [...this.activeEditEntry.bookings, this.addLrResult];
            }
          }
          if (this.activeEditEntry?.loadingSheet && this.activeEditEntry.loadingSheet.status === 'CANCELLED') {
            this.activeEditEntry.loadingSheet.status = 'DISPATCHED';
          }
          this.snack.success(`LR ${lrId} added to LS #${lsId}.`);
          this.closeAddLrDialog();
        },
        error: (e) => {
          this.addLrLoading = false;
          this.snack.error(e?.error?.message || 'Failed to add LR.');
        }
      });
  }

  // ── Branch destinations (for Edit LR form) ───────────────────────────────
  private loadBranchDestinations(): void {
    this.branchSvc.getByCompanyCode(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
            this.destinationSuggestions = res.data
              .filter(b => b.branchCode !== this.auth.branchCode)
              .map(b => `${b.branchName} (${b.branchCode})`);
            this.filterDestinations('');
          }
        },
        error: () => {}
      });
  }

  private filterDestinations(val: string): void {
    const s = val.toLowerCase();
    this.filteredDestinations = this.destinationSuggestions.filter(d => d.toLowerCase().includes(s));
  }

  getBranchName(codeOrName: string | undefined): string {
    if (!codeOrName) return '--';
    const dest = this.destinationSuggestions.find(d => d.includes(`(${codeOrName})`) || d.startsWith(codeOrName));
    if (dest) {
      const match = dest.match(/^(.*?)\s*\(/);
      if (match) return match[1].trim();
    }
    return codeOrName;
  }

  toTitleCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }

  getFullBranchName(codeOrName: string | undefined): string {
    if (!codeOrName) return '--';
    if (/.*\(.*\)$/.test(codeOrName)) return codeOrName; // Already formatted
    const dest = this.destinationSuggestions.find(d => d.includes(`(${codeOrName})`) || d.startsWith(codeOrName));
    return dest ? dest : codeOrName;
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
