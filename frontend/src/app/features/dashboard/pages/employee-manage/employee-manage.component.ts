import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, of, debounceTime, switchMap, map, catchError, first } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { BranchMap } from '../../../../shared/models/models';
import { passwordStrengthValidator, PASSWORD_REQUIREMENTS_TEXT, PASSWORD_REQUIREMENTS_SHORT } from '../../../../shared/validators/password.validator';
import * as CryptoJS from 'crypto-js';

const AES_KEY = '1234567890123456';
const AES_IV  = 'abcdefghijklmnop';

@Component({
  selector: 'app-employee-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
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
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <div matSuffix style="display: flex; gap: 4px; align-items: center;">
              <button mat-icon-button type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="'Toggle password visibility'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <button mat-icon-button type="button"
                      [matTooltip]="PASSWORD_REQUIREMENTS_TEXT"
                      matTooltipPosition="above"
                      [attr.aria-label]="'Password requirements'">
                <mat-icon color="primary">info</mat-icon>
              </button>
            </div>
            <mat-hint>{{ PASSWORD_REQUIREMENTS_SHORT }}</mat-hint>
            <mat-error *ngIf="form.get('password')?.hasError('required') && form.get('password')?.touched">Required</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('weakPassword')">
              Password must meet validation
            </mat-error>
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
            <input matInput type="number" formControlName="phone">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>
        </div>
        <div class="submit-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
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
    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      position: relative;
    }
  `]
})
export class EmployeeManageComponent implements OnDestroy {
  PASSWORD_REQUIREMENTS_TEXT = PASSWORD_REQUIREMENTS_TEXT;
  PASSWORD_REQUIREMENTS_SHORT = PASSWORD_REQUIREMENTS_SHORT;
  hidePassword = true;

  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  form = this.fb.group({
    branchCode: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required, [this.usernameValidator()]],
    password: ['', [Validators.required, passwordStrengthValidator]],
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

  private encryptPassword(plain: string): string {
    const key = CryptoJS.enc.Utf8.parse(AES_KEY);
    const iv  = CryptoJS.enc.Utf8.parse(AES_IV);
    return CryptoJS.AES.encrypt(plain, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    }).toString();
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
      password: this.encryptPassword(v.password || ''),
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
