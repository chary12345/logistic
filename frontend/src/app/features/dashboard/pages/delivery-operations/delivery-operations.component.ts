import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { OperationService } from '../../../../core/services/operation.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking } from '../../../../shared/models/models';
import { LrSearchDialogComponent } from '../../dialogs/lr-search-dialog/lr-search-dialog.component';
import { calcBookingGrandTotal, calcOtherCharges } from '../../../../shared/utils/booking-report.util';

@Component({
  selector: 'app-delivery-operations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule,
    AgGridAngular,
  ],
  templateUrl: './delivery-operations.component.html',
  styleUrls: ['./delivery-operations.component.scss']
})
export class DeliveryOperationsComponent implements OnDestroy {
  private gridApi!: GridApi;
  private datePipe = new DatePipe('en-US');
  private destroy$ = new Subject<void>();

  searchForm = this.fb.group({ lrNumber: [''] });

  rowData: Booking[] = [];
  selectedRows: Booking[] = [];
  loading = false;
  searched = false; // tracks whether a search has been performed

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
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy HH:mm') || '' },
    { headerName: 'Received Date', field: 'recieveDate', minWidth: 130, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy HH:mm') || '' },
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
  onSelectionChanged(event: SelectionChangedEvent): void { this.selectedRows = event.api.getSelectedRows(); }

  search(): void {
    const branchCode = this.auth.branchCode;
    if (!branchCode) { this.snack.error('Branch code not available.'); return; }

    const lrNumber = this.searchForm.value.lrNumber?.trim() || undefined;

    this.loading = true;
    this.searched = true;
    this.rowData = [];
    this.selectedRows = [];

    this.opSvc.getReceivedLrs(branchCode, lrNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.loading = false;
          this.rowData = bookings || [];
          if (!this.rowData.length) {
            const msg = lrNumber
              ? `No RECEIVED consignment found for LR: ${lrNumber}`
              : 'No received consignments pending delivery.';
            this.snack.info(msg);
          }
        },
        error: () => { this.loading = false; this.snack.error('Failed to fetch delivery data.'); }
      });
  }

  reset(): void {
    this.searchForm.reset({ lrNumber: '' });
    this.rowData = [];
    this.selectedRows = [];
    this.searched = false;
  }

  deliverSelected(): void {
    if (!this.selectedRows.length) { this.snack.warning('Select at least one LR to deliver.'); return; }

    this.loading = true;
    const lrIds = this.selectedRows.map(b => b.loadingReciept!);

    this.opSvc.deliverLrs(lrIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.success(`${lrIds.length} LR(s) delivered successfully.`);
          this.selectedRows = [];
          this.search();
        },
        error: () => { this.loading = false; this.snack.error('Failed to deliver LRs.'); }
      });
  }

  getPaymentClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m || ''] || '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
