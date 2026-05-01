import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, of, debounceTime, switchMap, map, catchError, first } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { BranchMap } from '../../../../shared/models/models';

@Component({
  selector: 'app-employee-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>group</mat-icon> Employee Management</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="employee-form">
        <div class="form-grid">
          <mat-form-field>
            <mat-label>Branch</mat-label>
            <mat-select formControlName="branchCode">
              <mat-option *ngFor="let b of branches" [value]="b.branchCode">{{ b.branchName }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName">
            <mat-error *ngIf="form.get('firstName')?.hasError('required') && form.get('firstName')?.touched">Required</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName">
            <mat-error *ngIf="form.get('lastName')?.hasError('required') && form.get('lastName')?.touched">Required</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Username</mat-label>
            <input matInput formControlName="username">
            <mat-hint>Must be unique</mat-hint>
            <mat-error *ngIf="form.get('username')?.hasError('required') && form.get('username')?.touched">Required</mat-error>
            <mat-error *ngIf="form.get('username')?.hasError('taken')">Username already taken</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-error *ngIf="form.get('password')?.hasError('required') && form.get('password')?.touched">Required</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Min 6 characters</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Role</mat-label>
            <mat-select formControlName="role" placeholder="Select Role" [ngClass]="{'placeholder-grey': !form.get('role')?.value}">
              <mat-option value="" style="display: none;">Select Role</mat-option>
              <mat-option value="Employee">Employee</mat-option>
              <mat-option value="Admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" maxlength="10">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>
        </div>
        <div class="submit-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!loading">person_add</mat-icon>
            {{ loading ? 'Creating...' : 'Create Employee' }}
          </button>
          <button mat-stroked-button type="button" (click)="reset()"><mat-icon>clear</mat-icon> Reset</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    :host ::ng-deep .placeholder-grey .mat-mdc-select-value-text {
      color: grey !important;
    }
  `]
})
export class EmployeeManageComponent implements OnDestroy {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  form = this.fb.group({
    branchCode: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required, [this.usernameValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    phone: [''],
    email: ['', Validators.email],
  });

  branches: BranchMap[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private empSvc: EmployeeService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
  ) {
    this.branchSvc.getByCompanyCode(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.branches = r.data || [], error: () => { } });
  }

  private usernameValidator(): AsyncValidatorFn {
    return (ctrl: AbstractControl) => {
      if (!ctrl.value) return of(null);
      return of(ctrl.value).pipe(
        debounceTime(400),
        switchMap(v => this.empSvc.validateUsername(v, this.auth.companyCode)),
        map(r => (r.status === 'available' || r.status === '') ? null : { taken: true }),
        catchError(() => of(null)),
        first()
      );
    };
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const v = this.form.value;
    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      userName: v.username,
      username: v.username,
      password: v.password,
      role: v.role,
      phone: v.phone,
      email: v.email,
      companyDetails: {
        companyCode: this.auth.companyCode,
        companyBranch: {
          branchCode: v.branchCode || this.auth.branchCode
        }
      }
    };
    this.empSvc.create(payload as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.loading = false; this.snack.success('Employee created!'); this.reset(); },
        error: e => { this.loading = false; this.snack.error(e?.error?.message || 'Failed to create employee.'); }
      });
  }

  reset(): void {
    this.formDirective?.resetForm({ role: '' });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
