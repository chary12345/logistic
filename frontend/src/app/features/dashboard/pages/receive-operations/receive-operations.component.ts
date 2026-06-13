import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { OperationService } from '../../../../core/services/operation.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking, DispatchedResponseDTO, LoadingSheetInfo } from '../../../../shared/models/models';
import { LrSearchDialogComponent } from '../../dialogs/lr-search-dialog/lr-search-dialog.component';
import { calcBookingGrandTotal, calcOtherCharges } from '../../../../shared/utils/booking-report.util';
import { formatAppDate } from '../../../../shared/utils/date.util';

@Component({
  selector: 'app-receive-operations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatRadioModule,
    AgGridAngular,
  ],
  templateUrl: './receive-operations.component.html',
  styleUrls: ['./receive-operations.component.scss']
})
export class ReceiveOperationsComponent implements OnDestroy {
  private gridApi!: GridApi;
  private destroy$ = new Subject<void>();

  searchForm = this.fb.group({ searchType: ['lsId'], searchValue: [''] });

  rowData: Booking[] = [];
  selectedRows: Booking[] = [];
  loading = false;
  loadingSheet: LoadingSheetInfo | null = null;

  columnDefs: ColDef[] = [
    { headerName: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50, pinned: 'left', sortable: false, filter: false, resizable: false, suppressMovable: true },
    { 
      headerName: 'LR No', 
      field: 'loadingReciept', 
      minWidth: 130, 
      pinned: 'left', 
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
    { headerName: 'Status', field: 'consignStatus', minWidth: 110, sortable: true, filter: true,
      cellClass: (p) => 'status-cell ' + (p.value === 'DISPATCHED' ? 'dispatched' : p.value === 'RECEIVED' ? 'received' : '') },
    { headerName: 'Consignor', field: 'consignorName', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignor Mobile', field: 'consignorMobile', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignee Mobile', field: 'consigneeMobile', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Destination', field: 'destinationBranchCode', minWidth: 110, sortable: true, filter: true },
    { headerName: 'Bill Type', field: 'billType', minWidth: 100, sortable: true, filter: true,
      cellClass: (p) => 'payment-cell ' + this.getPaymentClass(p.value) },
    { headerName: 'Freight', field: 'freight', minWidth: 90, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => '₹' + (p.value ?? 0).toLocaleString() },
    { headerName: 'Other Charges', minWidth: 110, sortable: true, filter: 'agNumberColumnFilter',
      valueGetter: p => calcOtherCharges(p.data), valueFormatter: p => '₹' + (p.value || 0).toFixed(2) },
    { headerName: 'Total', minWidth: 110, sortable: true,
      valueGetter: p => calcBookingGrandTotal(p.data),
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
    { headerName: 'Booking Date', field: 'bookingDate', minWidth: 120, sortable: true,
      valueFormatter: p => formatAppDate(p.value) },
    { headerName: 'Dispatch Date', field: 'dispatchDate', minWidth: 120, sortable: true,
      valueFormatter: p => formatAppDate(p.value) },
  ];

  defaultColDef: ColDef = { resizable: true, flex: 1, minWidth: 70, sortable: true, autoHeaderHeight: true, wrapHeaderText: true };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private opSvc: OperationService,
    private snack: SnackbarService,
    private dialog: MatDialog,
  ) {}

  openLRDetails(lr: string): void {
    this.dialog.open(LrSearchDialogComponent, {
      width: '500px',
      data: { lr, hideEdit: true }
    });
  }

  onGridReady(params: GridReadyEvent): void { this.gridApi = params.api; this.gridApi.sizeColumnsToFit(); }
  onGridSizeChanged(params: GridSizeChangedEvent): void { params.api.sizeColumnsToFit(); }
  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedRows = event.api.getSelectedRows().filter((b: Booking) => b.consignStatus === 'DISPATCHED');
  }

  search(): void {
    const val = this.searchForm.value.searchValue?.trim();
    if (!val) { this.snack.warning('Enter LS Number or Vehicle Number'); return; }

    this.loading = true;
    this.rowData = [];
    this.selectedRows = [];
    this.loadingSheet = null;

    const type = this.searchForm.value.searchType;
    const lsId = type === 'lsId' ? Number(val) : undefined;
    const vehicleNo = type === 'vehicleNo' ? val : undefined;

    this.opSvc.getDispatchedList(lsId, vehicleNo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: DispatchedResponseDTO) => {
          this.loading = false;
          this.loadingSheet = res.loadingSheet || null;
          this.rowData = res.bookings || [];
          if (!this.rowData.length) this.snack.info('No dispatched records found.');
        },
        error: () => { this.loading = false; this.snack.error('Failed to fetch dispatched list.'); }
      });
  }

  receiveSelected(): void {
    if (!this.selectedRows.length) { this.snack.warning('Select at least one dispatched LR to receive.'); return; }
    if (!this.loadingSheet?.loadingSheetNumber) { this.snack.error('Loading sheet information not available.'); return; }

    this.loading = true;
    const request = {
      lsId: this.loadingSheet.loadingSheetNumber,
      lrIds: this.selectedRows.map(b => b.loadingReciept!),
    };

    this.opSvc.receiveSelectedLrs(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.success(`${request.lrIds.length} LR(s) received successfully.`);
          this.selectedRows = [];
          this.search();
        },
        error: () => { this.loading = false; this.snack.error('Failed to receive LRs.'); }
      });
  }

  reset(): void {
    this.searchForm.reset({ searchType: 'lsId', searchValue: '' });
    this.rowData = [];
    this.selectedRows = [];
    this.loadingSheet = null;
  }

  getPaymentClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m || ''] || '';
  }

  isRowSelectable = (params: any): boolean => params.data?.consignStatus === 'DISPATCHED';

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
