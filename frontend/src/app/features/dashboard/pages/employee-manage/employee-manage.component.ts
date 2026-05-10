import { Component, OnDestroy, ViewChild, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, FormGroupDirective, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil, of, debounceTime, switchMap, map, catchError, first } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { BranchMap } from '../../../../shared/models/models';
import { passwordStrengthValidator, PASSWORD_REQUIREMENTS_TEXT, PASSWORD_REQUIREMENTS_SHORT } from '../../../../shared/validators/password.validator';
import * as CryptoJS from 'crypto-js';

const AES_KEY = '1234567890123456';
const AES_IV = 'abcdefghijklmnop';

@Component({
  selector: 'app-employee-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatDialogModule, MatCheckboxModule, MatChipsModule, MatDividerModule, MatTabsModule
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>group</mat-icon> Employee Management</h2>

      <!-- Tabs for Add | Edit -->
      <mat-tab-group (selectedIndexChange)="onTabChange($event)" [selectedIndex]="mode === 'add' ? 0 : 1" class="employee-tabs" mat-stretch-tabs="false">
        
        <!-- ADD TAB -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">person_add</mat-icon> Add</ng-template>
          <div class="tab-content">
            <ng-container *ngTemplateOutlet="employeeFormTemplate"></ng-container>
          </div>
        </mat-tab>

        <!-- EDIT TAB -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">edit</mat-icon> Edit</ng-template>
          <div class="tab-content">
            <div class="edit-select-row">
              <mat-form-field>
                <mat-label>Select Employee to Edit</mat-label>
                <mat-select [(ngModel)]="selectedEmployee" (selectionChange)="loadEmployeeData($event.value)" placeholder="Select Employee" [ngClass]="{'placeholder-grey': !selectedEmployee}">
                  <!-- Sticky Search Box -->
                  <div class="select-search-box">
                    <mat-icon class="search-icon">search</mat-icon>
                    <input class="search-input" [value]="employeeEditSearch" (input)="employeeEditSearch = $any($event.target).value" placeholder="Search name or username..." (keydown)="$event.stopPropagation()">
                  </div>
                  <mat-option value="" style="display: none;">Select Employee</mat-option>
                  <mat-option *ngFor="let emp of filteredEmployees" [value]="emp.userId" [ngClass]="{'deactivated-branch-option': emp.employeeActive === false}">
                    <div class="option-content">
                      <mat-icon class="option-icon">{{ emp.role === 'Admin' ? 'admin_panel_settings' : 'person' }}</mat-icon>
                      <span>{{ emp.firstName }} {{ emp.lastName }} ({{ emp.userName }})</span>
                      <span class="deactivated-lbl" *ngIf="emp.employeeActive === false">(Inactive)</span>
                    </div>
                  </mat-option>
                  <mat-option *ngIf="filteredEmployees.length === 0" disabled>No matching employees found</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-spinner *ngIf="loadingEmployees" diameter="24"></mat-spinner>
            </div>
            <ng-container *ngTemplateOutlet="employeeFormTemplate"></ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- FORM TEMPLATE (Shared for Add & Edit) -->
      <ng-template #employeeFormTemplate>
        <form [formGroup]="form" (ngSubmit)="submit()" class="employee-form">
          <div class="form-grid">
            <mat-form-field>
              <mat-label>Branch</mat-label>
              <mat-select formControlName="branchCode" placeholder="Select Branch" [ngClass]="{'placeholder-grey': !form.get('branchCode')?.value}">
                <!-- Sticky Search Box -->
                <div class="select-search-box">
                  <mat-icon class="search-icon">search</mat-icon>
                  <input class="search-input" [value]="branchListSearch" (input)="branchListSearch = $any($event.target).value" placeholder="Search branch name or code..." (keydown)="$event.stopPropagation()">
                </div>
                <mat-option value="" style="display: none;">Select Branch</mat-option>
                <mat-option *ngFor="let b of filteredBranches" [value]="b.branchCode" [disabled]="b.branchActive === false" [ngClass]="{'deactivated-branch-option': b.branchActive === false}">
                  {{ b.branchName }} ({{b.branchCode}})
                  <span class="deactivated-lbl" *ngIf="b.branchActive === false">(Deactivated)</span>
                </mat-option>
                <mat-option *ngIf="filteredBranches.length === 0" disabled>No branches found</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('branchCode')?.hasError('required')">Required</mat-error>
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
              <mat-hint *ngIf="mode === 'add'">Must be unique</mat-hint>
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
              <mat-error *ngIf="form.get('phone')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="form.get('phone')?.hasError('pattern')">Valid 10-digit number required</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput formControlName="email">
              <mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>
            </div>

          <!-- Reduced size Status Toggle placed above update button -->
          <div class="status-toggle-container" *ngIf="mode === 'edit'" style="margin-bottom: 12px;">
            <mat-checkbox formControlName="isEmployeeActive" color="primary">
              Active Employee
            </mat-checkbox>
          </div>
          <div class="submit-row">
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="loading || form.invalid">
              <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
              <mat-icon *ngIf="!loading">{{ mode === 'add' ? 'person_add' : 'save' }}</mat-icon>
              {{ loading ? 'Saving...' : (mode === 'add' ? 'Create Employee' : 'Update Employee') }}
            </button>
            <button mat-stroked-button type="button" (click)="reset()"><mat-icon>clear</mat-icon> Reset</button>
          </div>
        </form>
      </ng-template>
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

    :host ::ng-deep .employee-tabs .mat-mdc-tab-header-pagination {
      display: none !important;
    }

    .select-search-box {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 10;
      border-bottom: 1px solid #e2e8f0;

      .search-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
        color: #64748b;
        margin-right: 8px;
      }

      .search-input {
        border: none;
        outline: none;
        font-size: 14px;
        flex: 1;
        font-family: 'Poppins', sans-serif;
        color: #1e293b;
      }
    }

    .edit-select-row {
      display: flex;
      align-items: center;
      gap: var(--sp-md);
      margin-bottom: var(--sp-md);
      flex-wrap: wrap;

      mat-form-field {
        min-width: 240px;
        flex: 1;
        max-width: 360px;
      }

      @media (max-width: 520px) {
        mat-form-field {
          min-width: unset;
          max-width: none;
          width: 100%;
        }
      }
    }

    .employee-form {
      margin-top: var(--sp-sm);
    }

    :host ::ng-deep {
      .employee-tabs {
        margin-bottom: var(--sp-md);

        --mat-tab-header-divider-color: transparent !important;
        --mdc-tab-divider-color: transparent !important;

        .mat-mdc-tab-header,
        .mat-mdc-tab-header *,
        .mat-mdc-tab-labels,
        .mat-mdc-tab-labels * {
          border-bottom: none !important;
          box-shadow: none !important;
        }

        .mat-mdc-tab-header {
          max-width: fit-content;
        }

        .mat-mdc-tab-divider {
          display: none !important;
        }
        
        .mat-mdc-tab-body-wrapper {
          border-top: none !important;
        }

        .mat-mdc-tab-labels {
          justify-content: flex-start;
          gap: 4px;
        }

        .mat-mdc-tab {
          position: relative !important;
          background-color: #f8fafc;
          border-radius: 6px 6px 0 0;
          min-width: 120px;
          padding: 0 16px;
          height: 48px;
          transition: background-color 0.2s, color 0.2s;
          
          border-top: 1px solid #e2e8f0 !important;
          border-left: 1px solid #e2e8f0 !important;
          border-right: 1px solid #e2e8f0 !important;
          border-bottom: none !important; 
          box-shadow: none !important;

          &:hover {
            background-color: #f1f5f9;
          }
        }

        .mat-mdc-tab:nth-of-type(1).mdc-tab--active {
          background-color: #eff6ff !important; 
          color: var(--primary) !important;

          .mdc-tab-indicator__content--underline {
            border-color: var(--primary) !important;
          }
        }

        .mat-mdc-tab:nth-of-type(2).mdc-tab--active {
          background-color: #fffbeb !important; 
          color: #d97706 !important; 

          .mdc-tab-indicator__content--underline {
            border-color: #d97706 !important;
          }
        }

        .mdc-tab-indicator__content--underline {
          border-top-width: 3px !important;
          border-bottom-width: 0 !important;
          border-left-width: 0 !important;
          border-right-width: 0 !important;
        }

        .tab-icon {
          margin-right: 6px;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        .tab-content {
          padding-top: 24px;
        }
      }
    }

    .compact-toggle {
      grid-column: span 1 !important; 
      display: flex;
      align-items: center; 
      margin: -12px 0 0 0 !important; 
      padding: 0 0 0 4px !important; 
      background-color: transparent !important;
      border: none !important;
      height: 32px;
    }

    .submit-row {
      padding-top: 20px !important;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .option-icon {
        color: #64748b;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .form-grid {
      gap: 12px 20px !important;
    }

    .deactivated-lbl {
      color: #b91c1c;
      font-size: 11px;
      margin-left: 8px;
      font-weight: 600;
      background: rgba(185, 28, 28, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .deactivated-branch-option {
      background-color: #fff5f5;
      color: #b91c1c !important;
      font-style: italic;

      .mat-mdc-option-text {
        color: #b91c1c !important;
      }
    }
  `]
})
export class EmployeeManageComponent implements OnInit, OnDestroy {
  PASSWORD_REQUIREMENTS_TEXT = PASSWORD_REQUIREMENTS_TEXT;
  PASSWORD_REQUIREMENTS_SHORT = PASSWORD_REQUIREMENTS_SHORT;
  hidePassword = true;

  mode: 'add' | 'edit' = 'add';
  branches: BranchMap[] = [];
  employees: any[] = [];
  loadingEmployees = false;
  selectedEmployee = '';
  loadedEmployeeSnapshot: any = null;
  employeeEditSearch = '';
  branchListSearch = '';

  get filteredEmployees(): any[] {
    const q = this.employeeEditSearch.toLowerCase().trim();
    if (!q) return this.employees;
    return this.employees.filter((e: any) =>
      (e.firstName || '').toLowerCase().includes(q) ||
      (e.lastName || '').toLowerCase().includes(q) ||
      (e.userName || '').toLowerCase().includes(q)
    );
  }

  get filteredBranches(): any[] {
    const q = this.branchListSearch.toLowerCase().trim();
    if (!q) return this.branches;
    return this.branches.filter((b: any) =>
      (b.branchName || '').toLowerCase().includes(q) ||
      (b.branchCode || '').toLowerCase().includes(q)
    );
  }

  private normalizeForComparison(obj: any): string {
    if (!obj) return '';
    const normalized: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      // Stringify and trim values for comparison
      normalized[key] = (val === null || val === undefined) ? '' : String(val).trim();
    });
    return JSON.stringify(normalized);
  }

  get isFormChanged(): boolean {
    if (this.mode === 'add') return true;
    if (!this.loadedEmployeeSnapshot) return false;
    return this.normalizeForComparison(this.form.getRawValue()) !== this.normalizeForComparison(this.loadedEmployeeSnapshot);
  }

  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  @ViewChildren(FormGroupDirective) formDirectives!: QueryList<FormGroupDirective>;

  form = this.fb.group({
    branchCode: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required, [this.usernameValidator()]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    role: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    isEmployeeActive: [true]
  });

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private empSvc: EmployeeService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.branchSvc.getByCompanyCode(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.branches = r.data || [], error: () => { } });
  }

  onTabChange(index: number): void {
    this.setMode(index === 0 ? 'add' : 'edit');
  }

  setMode(m: 'add' | 'edit'): void {
    this.mode = m;
    this.formDirectives?.forEach(fd => {
      fd.resetForm({ role: '', isEmployeeActive: true });
    });
    this.form.reset({ role: '', isEmployeeActive: true });
    this.selectedEmployee = '';
    this.loadedEmployeeSnapshot = null;
    this.employeeEditSearch = '';
    this.branchListSearch = '';

    if (m === 'edit') {
      this.loadEmployees();
      this.form.get('isEmployeeActive')?.disable();
    }

    if (m === 'add') {
      this.form.get('username')?.enable();
      this.form.get('username')?.setAsyncValidators([this.usernameValidator()]);
      this.form.get('password')?.enable();
      this.form.get('password')?.setValidators([Validators.required, passwordStrengthValidator]);
      this.form.get('isEmployeeActive')?.enable();
    } else if (m === 'edit') {
      this.form.get('username')?.enable();
      this.form.get('username')?.setAsyncValidators([this.usernameValidator()]);

      this.form.get('password')?.disable();
      this.form.get('password')?.clearValidators();
    }

    this.form.get('username')?.updateValueAndValidity();
    this.form.get('password')?.updateValueAndValidity();
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.empSvc.getByCompanyCode(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.employees = r.data || [];
          this.loadingEmployees = false;
        },
        error: () => this.loadingEmployees = false
      });
  }

  loadEmployeeData(userId: string): void {
    this.empSvc.getByUserId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (emp: any) => {
          // Find valid matching branch
          const rawCode = (emp.branchCode || '').toString().trim().toLowerCase();
          const match = this.branches.find(b => (b.branchCode || '').toString().trim().toLowerCase() === rawCode);
          const validBranchCode = match ? match.branchCode : '';

          this.form.patchValue({
            branchCode: validBranchCode,
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            username: emp.userName || '',
            password: '••••••••',
            role: emp.role || '',
            phone: emp.phone || '',
            email: emp.email || '',
            isEmployeeActive: emp.employeeActive ?? true
          });
          this.form.get('username')?.enable();
          this.form.get('username')?.setAsyncValidators([this.usernameValidator()]);
          this.form.get('isEmployeeActive')?.enable();
          
          this.loadedEmployeeSnapshot = this.form.getRawValue();
        },
        error: () => this.snack.error('Failed to load employee details.')
      });
  }

  private usernameValidator(): AsyncValidatorFn {
    return (ctrl: AbstractControl) => {
      if (!ctrl.value) return of(null);

      // Skip if editing same value
      if (this.mode === 'edit' && this.loadedEmployeeSnapshot && ctrl.value === this.loadedEmployeeSnapshot.username) {
        return of(null);
      }

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
    const iv = CryptoJS.enc.Utf8.parse(AES_IV);
    return CryptoJS.AES.encrypt(plain, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const val = this.form.getRawValue();

    // Change Detection
    if (this.mode === 'edit' && this.loadedEmployeeSnapshot) {
      const isUnchanged = this.normalizeForComparison(val) === this.normalizeForComparison(this.loadedEmployeeSnapshot);
      if (isUnchanged) {
        this.snack.info('No changes detected. Update was not required.');
        return;
      }
    }

    this.loading = true;
    const plainPwd = val.password || '';

    const payload: any = {
      firstName: val.firstName,
      lastName: val.lastName,
      userName: val.username,
      username: val.username,
      role: val.role,
      phone: val.phone,
      email: val.email,
      isEmployeeActive: val.isEmployeeActive ?? true,
      employeeActive: val.isEmployeeActive ?? true,
      companyDetails: {
        companyCode: this.auth.companyCode,
        companyBranch: {
          branchCode: val.branchCode || this.auth.branchCode
        }
      }
    };

    // Encrypt password on initial creation only
    if (plainPwd && this.mode === 'add') {
      payload.password = this.encryptPassword(plainPwd);
      payload.plainPassword = plainPwd;
    }

    // CC admin email on creation
    if (this.mode === 'add') {
      payload.adminEmail = this.auth.currentUser?.email || '';
    }

    const obs$: any = this.mode === 'add'
      ? this.empSvc.create(payload)
      : this.empSvc.update(this.selectedEmployee, payload);

    obs$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loading = false;
        this.snack.success(`Employee ${this.mode === 'add' ? 'created' : 'updated'} successfully!`);
        if (this.mode === 'add' && val.email) {
          setTimeout(() => this.snack.success(`Welcome email sent to ${val.email}`), 600);
        } else if (this.mode === 'edit' && val.email) {
          setTimeout(() => this.snack.success(`Profile update email sent to ${val.email}`), 600);
        }
        this.reset();
        if (this.mode === 'edit') {
          this.loadEmployees();
        }
      },
      error: (e: any) => { this.loading = false; this.snack.error(e?.error?.message || `Failed to ${this.mode === 'add' ? 'create' : 'update'} employee.`); }
    });
  }

  reset(): void {
    this.formDirectives?.forEach(fd => {
      fd.resetForm({ role: '', isEmployeeActive: true });
    });
    this.form.reset({ role: '', isEmployeeActive: true });
    this.selectedEmployee = '';
    this.loadedEmployeeSnapshot = null;
    if (this.mode === 'edit') {
      this.form.get('isEmployeeActive')?.disable();
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
