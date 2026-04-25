import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, startWith } from 'rxjs';
import { BookingService } from '../../../../core/services/booking.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Booking, VehicleDTO } from '../../../../shared/models/models';

@Component({
  selector: 'app-dispatch-details-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title><mat-icon>local_shipping</mat-icon> Dispatch {{ data.selected.length }} Load(s)</h2>
    <mat-dialog-content>
      <div class="dispatch-summary">
        <strong>Selected LRs:</strong>
        <div class="lr-chips">
          <span class="lr-chip" *ngFor="let b of data.selected">{{ b.loadingReciept }}</span>
        </div>
      </div>
      <form [formGroup]="form" class="dispatch-form">
        <mat-form-field>
          <mat-label>Select Vehicle</mat-label>
          <mat-select formControlName="truckNumber" (selectionChange)="onVehicleSelect($event.value)">
            <mat-option *ngFor="let v of data.vehicles" [value]="v.truckNumber">{{ v.truckNumber }} — {{ v.vehicleName }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('truckNumber')?.hasError('required') && form.get('truckNumber')?.touched">Required</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Vehicle Name</mat-label>
          <input matInput formControlName="vehicleName" readonly>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Driver Name</mat-label>
          <input matInput formControlName="driverName">
          <mat-error *ngIf="form.get('driverName')?.hasError('required') && form.get('driverName')?.touched">Required</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Driver Phone</mat-label>
          <input matInput formControlName="driverPhone" maxlength="10">
          <mat-error *ngIf="form.get('driverPhone')?.hasError('required') && form.get('driverPhone')?.touched">Required</mat-error>
        </mat-form-field>
        <mat-form-field class="dest-field">
          <mat-label>Destination Branch</mat-label>
          <mat-select formControlName="destinationBranch">
            <!-- Search box inside select -->
            <div class="dest-search-box" (keydown)="$event.stopPropagation()" (click)="$event.stopPropagation()">
              <mat-icon class="search-icon">search</mat-icon>
              <input [formControl]="destinationFilterCtrl" placeholder="Search for destination branch here.."
                autocomplete="off" class="dest-search-input">
            </div>
            <!-- Options -->
            <mat-option *ngFor="let d of filteredDestinations" [value]="d">
              {{ d }}
            </mat-option>
            <!-- No results -->
            <mat-option *ngIf="filteredDestinations.length === 0" disabled>
              No branches found
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('destinationBranch')?.hasError('required') && form.get('destinationBranch')?.touched">Required</mat-error>
        </mat-form-field>
      </form>
      <div *ngIf="error" class="error-msg">{{ error }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="dispatch()" [disabled]="loading">
        <mat-spinner *ngIf="loading" diameter="16"></mat-spinner>
        {{ loading ? 'Dispatching...' : 'Confirm Dispatch' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display:flex; align-items:center; gap:8px; font-size:15px; }
    .dispatch-summary { background:#f8fafc; border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:11px; }
    .lr-chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; }
    .lr-chip { background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; }
    .dispatch-form { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }
    .dest-field { grid-column: 1 / -1; }
    .error-msg { color:#dc2626; font-size:11px; margin-top:6px; }

    /* Destination search box styling */
    .dest-search-box {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 10;
      border-bottom: 1px solid #e2e8f0;
    }
    .dest-search-box .search-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      color: #94a3b8;
      margin-right: 8px;
    }
    .dest-search-box .dest-search-input {
      border: none;
      outline: none;
      font-size: 14px;
      flex: 1;
      font-family: 'Poppins', sans-serif;
      color: #1e293b;
    }
    .dest-search-box .dest-search-input::placeholder {
      color: #cbd5e1;
    }

    @media (max-width: 520px) {
      .dispatch-form { grid-template-columns:1fr; }
      .dest-field { grid-column: 1; }
    }
  `]
})
export class DispatchDetailsDialogComponent implements OnInit, OnDestroy {
  form = this.fb.group({
    truckNumber:      ['', Validators.required],
    vehicleName:      [''],
    driverName:       ['', Validators.required],
    driverPhone:      ['', Validators.required],
    destinationBranch:['', Validators.required],
  });

  destinationSuggestions: string[] = [];
  filteredDestinations: string[] = [];
  destinationFilterCtrl = new FormControl('');

  loading = false;
  error   = '';
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selected: Booking[]; vehicles: VehicleDTO[]; branchCode: string; companyCode: string },
    private fb: FormBuilder,
    private bookSvc: BookingService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
    private ref: MatDialogRef<DispatchDetailsDialogComponent>
  ) {}

  ngOnInit(): void {
    this.loadBranchDestinations();

    // Set up destination search filter
    this.destinationFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterDestinations(value || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBranchDestinations(): void {
    const companyCode = this.data.companyCode;
    const myBranch = this.data.branchCode;
    if (!companyCode) return;

    this.branchSvc.getByCompanyCode(companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
            this.destinationSuggestions = res.data
              .filter(b => b.branchCode !== myBranch) // Filter out current branch
              .map(b => `${b.branchName} (${b.branchCode})`);
            this.filterDestinations('');
          }
        },
        error: () => {
          this.snack.error('Failed to load branch destinations.');
        }
      });
  }

  private filterDestinations(val: string): void {
    const search = val.toLowerCase();
    this.filteredDestinations = this.destinationSuggestions.filter(d =>
      d.toLowerCase().includes(search)
    );
  }

  onVehicleSelect(truckNumber: string): void {
    const v = this.data.vehicles.find(v => v.truckNumber === truckNumber);
    if (v) this.form.patchValue({ vehicleName: v.vehicleName });
  }

  dispatch(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    const f = this.form.value;
    this.bookSvc.dispatchLoad({
      lrIds:             this.data.selected.map(b => b.loadingReciept!),
      vehicleNumber:     f.truckNumber!,
      vehicleName:       f.vehicleName!,
      driverName:        f.driverName!,
      driverPhone:       f.driverPhone!,
      destinationBranch: f.destinationBranch!,
    }).subscribe({
      next: r => {
        this.loading = false;
        this.snack.success(`${r.bookings?.length || 0} load(s) dispatched successfully!`);
        this.ref.close(true);
      },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Dispatch failed.'; }
    });
  }
}
