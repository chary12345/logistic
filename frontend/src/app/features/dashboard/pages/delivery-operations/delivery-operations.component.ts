import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { OperationService } from '../../../../core/services/operation.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking } from '../../../../shared/models/models';

@Component({
  selector: 'app-delivery-operations',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    AgGridAngular,
  ],
  templateUrl: './delivery-operations.component.html',
  styleUrls: ['./delivery-operations.component.scss']
})
export class DeliveryOperationsComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private datePipe = new DatePipe('en-US');
  private destroy$ = new Subject<void>();

  rowData: Booking[] = [];
  selectedRows: Booking[] = [];
  loading = false;

  columnDefs: ColDef[] = [
    { headerName: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50, pinned: 'left', sortable: false, filter: false, resizable: false, suppressMovable: true },
    { headerName: 'LR No', field: 'loadingReciept', minWidth: 130, pinned: 'left', sortable: true, filter: true },
    { headerName: 'Consignor', field: 'consignorName', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignor Mobile', field: 'consignorMobile', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignee', field: 'consigneeName', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Consignee Mobile', field: 'consigneeMobile', minWidth: 130, sortable: true, filter: true },
    { headerName: 'Destination', field: 'destinationBranchCode', minWidth: 110, sortable: true, filter: true },
    { headerName: 'Bill Type', field: 'billType', minWidth: 100, sortable: true, filter: true,
      cellClass: (p) => 'payment-cell ' + this.getPaymentClass(p.value) },
    { headerName: 'Freight', field: 'freight', minWidth: 90, sortable: true, filter: 'agNumberColumnFilter',
      valueFormatter: p => '₹' + (p.value ?? 0).toLocaleString() },
    { headerName: 'Total', minWidth: 110, sortable: true,
      valueGetter: p => this.calcTotal(p.data),
      valueFormatter: p => '₹' + (p.value || 0).toFixed(2),
      cellStyle: { fontWeight: '700' } },
    { headerName: 'Booking Date', field: 'bookingDate', minWidth: 120, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy HH:mm') || '' },
    { headerName: 'Received Date', field: 'recieveDate', minWidth: 130, sortable: true,
      valueFormatter: p => this.datePipe.transform(p.value, 'dd/MM/yy HH:mm') || '' },
  ];

  defaultColDef: ColDef = { resizable: true, flex: 1, minWidth: 70, sortable: true, autoHeaderHeight: true, wrapHeaderText: true };

  constructor(
    private auth: AuthService,
    private opSvc: OperationService,
    private snack: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.fetchReceivedLrs();
  }

  onGridReady(params: GridReadyEvent): void { this.gridApi = params.api; this.gridApi.sizeColumnsToFit(); }
  onGridSizeChanged(params: GridSizeChangedEvent): void { params.api.sizeColumnsToFit(); }
  onSelectionChanged(event: SelectionChangedEvent): void { this.selectedRows = event.api.getSelectedRows(); }

  fetchReceivedLrs(): void {
    const branchCode = this.auth.branchCode;
    if (!branchCode) { this.snack.error('Branch code not available.'); return; }

    this.loading = true;
    this.selectedRows = [];
    this.opSvc.getReceivedLrs(branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.loading = false;
          this.rowData = bookings || [];
          if (!this.rowData.length) this.snack.info('No received consignments pending delivery.');
        },
        error: () => { this.loading = false; this.snack.error('Failed to fetch received LRs.'); }
      });
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
          this.fetchReceivedLrs();
        },
        error: () => { this.loading = false; this.snack.error('Failed to deliver LRs.'); }
      });
  }

  calcTotal(b: Booking): number {
    if (!b) return 0;
    return (b.freight || 0) + (b.loading || 0) + (b.loadingCharge || 0) + (b.sgst || 0) + (b.cgst || 0) + (b.igst || 0);
  }

  getPaymentClass(m?: string): string {
    const map: Record<string, string> = { 'PAID': 'paid', 'TO PAY': 'to-pay', 'TBB': 'tbb' };
    return map[m || ''] || '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
