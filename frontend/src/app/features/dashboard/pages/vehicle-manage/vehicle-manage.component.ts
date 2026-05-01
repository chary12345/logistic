import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';

@Component({
  selector: 'app-vehicle-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>fire_truck</mat-icon> Vehicle Management</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="vehicle-form">
        <div class="form-grid">
          <mat-form-field>
            <mat-label>Truck Number</mat-label>
            <input matInput formControlName="truckNumber" class="text-uppercase">
            <mat-hint>e.g. MH12AB1234</mat-hint>
            <mat-error *ngIf="form.get('truckNumber')?.hasError('required') && form.get('truckNumber')?.touched">Required</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Vehicle Name</mat-label>
            <input matInput formControlName="vehicleName">
            <mat-error *ngIf="form.get('vehicleName')?.hasError('required') && form.get('vehicleName')?.touched">Required</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Capacity (Tons)</mat-label>
            <input matInput type="number" formControlName="capacity" min="0">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Owner Name</mat-label>
            <input matInput formControlName="ownerName">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Vehicle Type</mat-label>
            <mat-select formControlName="vehicleType" placeholder="Select Vehicle Type" [ngClass]="{'placeholder-grey': !form.get('vehicleType')?.value}">
              <mat-option value="" style="display: none;">Select Vehicle Type</mat-option>
              <mat-option value="Open">Open</mat-option>
              <mat-option value="Container">Container</mat-option>
              <mat-option value="Trailer">Trailer</mat-option>
              <mat-option value="Mini Truck">Mini Truck</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>RC Number</mat-label>
            <input matInput formControlName="rcNumber">
          </mat-form-field>
          <div class="toggle-row">
            <label>Active Status</label>
            <mat-slide-toggle formControlName="isActive" color="primary">Active</mat-slide-toggle>
          </div>
        </div>
        <div class="submit-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!loading">fire_truck</mat-icon>
            {{ loading ? 'Saving...' : 'Save Vehicle' }}
          </button>
          <button mat-stroked-button type="button" (click)="reset()"><mat-icon>clear</mat-icon> Reset</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .toggle-row { display: flex; flex-direction: column; gap: 6px; justify-content: center;
      label { font-size: 11px; color: #5c6780; font-weight: 600; } }
    :host ::ng-deep .placeholder-grey .mat-mdc-select-value-text {
      color: grey !important;
    }
  `]
})
export class VehicleManageComponent implements OnDestroy {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  form = this.fb.group({
    truckNumber: ['', Validators.required],
    vehicleName: ['', Validators.required],
    capacity: [null],
    ownerName: [''],
    vehicleType: [''],
    rcNumber: [''],
    isActive: [true],
  });

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private vehSvc: VehicleService,
    private snack: SnackbarService,
  ) { }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.vehSvc.associate({ ...this.form.value, branchCode: this.auth.branchCode, companyCode: this.auth.companyCode } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.loading = false; this.snack.success('Vehicle saved!'); this.reset(); },
        error: e => { this.loading = false; this.snack.error(e?.error?.message || 'Failed to save vehicle.'); }
      });
  }

  reset(): void {
    this.formDirective?.resetForm({ isActive: true, vehicleType: '' });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
