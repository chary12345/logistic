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
import { EmployeeDeleteConfirmComponent } from './employee-delete-confirm.component';
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

      <!-- Tabs for Add | Edit | Delete -->
      <mat-tab-group (selectedIndexChange)="onTabChange($event)" [selectedIndex]="mode === 'add' ? 0 : mode === 'edit' ? 1 : 2" class="employee-tabs" mat-stretch-tabs="false">
        
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
                <mat-select [(ngModel)]="selectedEmployee" (selectionChange)="loadEmployeeData($event.value)">
                  <mat-option *ngFor="let emp of employees" [value]="emp.userId">{{ emp.firstName }} {{ emp.lastName }} ({{ emp.userName }})</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-spinner *ngIf="loadingEmployees" diameter="24"></mat-spinner>
            </div>
            <ng-container *ngTemplateOutlet="employeeFormTemplate"></ng-container>
          </div>
        </mat-tab>

        <!-- DELETE TAB -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">delete_outline</mat-icon> Delete</ng-template>
          <div class="tab-content">
            <div *ngIf="loadingEmployees" class="delete-loading">
              <mat-spinner diameter="32"></mat-spinner>
              <p>Loading employees…</p>
            </div>

            <div *ngIf="!loadingEmployees && employees.length === 0" class="empty-state">
              <mat-icon>group</mat-icon>
              <p>No employees found for your company.</p>
            </div>

            <div *ngIf="!loadingEmployees && employees.length > 0" class="delete-section">
              <!-- Searchable Multi-Select Dropdown -->
              <mat-form-field class="small-width-dropdown">
                <mat-label>Select Employees to Delete</mat-label>
                <mat-select multiple [(ngModel)]="selectedDeleteIds">
                  
                  <mat-select-trigger>
                    <span *ngIf="selectedDeleteIds.length > 0">
                      {{ selectedDeleteIds.length }} employee{{ selectedDeleteIds.length > 1 ? 's' : '' }} selected
                    </span>
                  </mat-select-trigger>

                  <!-- Sticky Search Header -->
                  <div class="select-search-header" (keydown)="$event.stopPropagation()">
                    <mat-icon class="search-icon">search</mat-icon>
                    <input type="text" placeholder="Search employees..." 
                           [(ngModel)]="deleteSearchTerm" 
                           (ngModelChange)="filterDeleteOptions()" 
                           class="select-search-input">
                    <button mat-icon-button *ngIf="deleteSearchTerm" (click)="deleteSearchTerm=''; filterDeleteOptions()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>

                  <!-- Select All / Clear All Options -->
                  <div class="select-actions">
                    <mat-checkbox [checked]="allSelected" (change)="toggleSelectAll()">
                      {{ allSelected ? 'Deselect All' : 'Select All' }}
                    </mat-checkbox>
                  </div>

                  <mat-divider></mat-divider>

                  <!-- Employee Options -->
                  <mat-option *ngFor="let emp of filteredEmployees" [value]="emp.userId">
                    <div class="option-content">
                      <mat-icon class="option-icon">{{ emp.role === 'Admin' ? 'admin_panel_settings' : 'person' }}</mat-icon>
                      <span>{{ emp.firstName }} {{ emp.lastName }}</span>
                      <span class="option-code">({{ emp.userName }})</span>
                    </div>
                  </mat-option>

                  <div *ngIf="filteredEmployees.length === 0" class="no-options">
                    No employees match your search.
                  </div>
                </mat-select>
              </mat-form-field>

              <!-- Selected Chips Display -->
              <div class="selected-chips-container" *ngIf="selectedDeleteIds.length > 0">
                <div class="chips-header">
                  <span class="chips-title">Selected Employees ({{ selectedDeleteIds.length }})</span>
                  <button mat-button color="warn" class="clear-all-btn" (click)="clearSelection()">Clear All</button>
                </div>
                
                <mat-chip-set>
                  <mat-chip *ngFor="let id of selectedDeleteIds" [removable]="!deleting" (removed)="removeFromSelection(id)">
                    <mat-icon matChipAvatar>{{ getEmployeeByUserId(id)?.role === 'Admin' ? 'admin_panel_settings' : 'person' }}</mat-icon>
                    {{ getEmployeeByUserId(id)?.firstName }} {{ getEmployeeByUserId(id)?.lastName }}
                    <button matChipRemove *ngIf="!deleting">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip>
                </mat-chip-set>

                <!-- Delete Action Button -->
                <div class="delete-action-row">
                  <button mat-raised-button color="warn" [disabled]="deleting" (click)="confirmDeleteSelected()" class="bulk-delete-btn">
                    <mat-spinner *ngIf="deleting" diameter="20"></mat-spinner>
                    <mat-icon *ngIf="!deleting">delete_forever</mat-icon>
                    {{ deleting ? 'Deleting...' : 'Delete Selected Employees' }}
                  </button>
                  <!-- Danger notice -->
                  <div class="delete-notice">
                    <mat-icon>warning_amber</mat-icon>
                    <span>Deleting employees is permanent and will revoke all access privileges.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- FORM TEMPLATE (Shared for Add & Edit) -->
      <ng-template #employeeFormTemplate>
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

    // Tabbed layout styles matching branch management
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

    .delete-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--sp-md);
      padding: 48px var(--sp-xl);
      color: var(--text-secondary);

      p { margin: 0; font-size: var(--fs-md); }
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

        .mat-mdc-tab:nth-of-type(3).mdc-tab--active {
          background-color: #fef2f2 !important; 
          color: var(--danger) !important;

          .mdc-tab-indicator__content--underline {
            border-color: var(--danger) !important;
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
          padding-top: var(--sp-md);
        }
      }
    }

    .delete-action-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--sp-sm);
      margin-top: var(--sp-md);
    }

    .delete-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fef9ee;
      border: 1px solid #fde68a;
      border-radius: var(--radius-sm);
      padding: 8px var(--sp-md);
      color: var(--warning);
      font-size: var(--fs-sm);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }

    .small-width-dropdown {
      max-width: 400px;
      width: 100%;
    }

    .select-search-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--border);

      .search-icon {
        color: var(--text-secondary);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .select-search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: var(--fs-md);
        background: transparent;
      }
    }

    .select-actions {
      padding: 8px 16px;
      background: #f8fafc;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .option-icon {
        color: var(--text-secondary);
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .option-code {
        color: var(--text-secondary);
        font-size: var(--fs-sm);
        font-family: 'Courier New', monospace;
      }
    }

    .no-options {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary);
      font-style: italic;
    }
  `]
})
export class EmployeeManageComponent implements OnInit, OnDestroy {
  PASSWORD_REQUIREMENTS_TEXT = PASSWORD_REQUIREMENTS_TEXT;
  PASSWORD_REQUIREMENTS_SHORT = PASSWORD_REQUIREMENTS_SHORT;
  hidePassword = true;

  mode: 'add' | 'edit' | 'delete' = 'add';
  branches: BranchMap[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  loadingEmployees = false;
  selectedEmployee = '';
  selectedDeleteIds: string[] = [];
  deleteSearchTerm = '';
  deleting = false;

  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  @ViewChildren(FormGroupDirective) formDirectives!: QueryList<FormGroupDirective>;

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
    this.setMode(index === 0 ? 'add' : index === 1 ? 'edit' : 'delete');
  }

  setMode(m: 'add' | 'edit' | 'delete'): void {
    this.mode = m;
    this.formDirectives?.forEach(fd => {
      fd.resetForm({ role: '' });
    });
    this.form.reset({ role: '' });
    this.selectedEmployee = '';
    this.selectedDeleteIds = [];
    this.deleteSearchTerm = '';

    if (m === 'edit' || m === 'delete') {
      this.loadEmployees();
    }

    if (m === 'add') {
      this.form.get('username')?.enable();
      this.form.get('username')?.setAsyncValidators([this.usernameValidator()]);
      this.form.get('password')?.setValidators([Validators.required, passwordStrengthValidator]);
    } else if (m === 'edit') {
      this.form.get('username')?.disable();
      this.form.get('username')?.clearAsyncValidators();
      this.form.get('password')?.setValidators([passwordStrengthValidator]);
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
          this.filteredEmployees = [...this.employees];
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
          this.form.patchValue({
            branchCode: emp.branchCode || '',
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            username: emp.userName || '',
            password: '', // Leave password blank on load
            role: emp.role || '',
            phone: emp.phone || '',
            email: emp.email || '',
          });
          this.form.get('username')?.disable();
          this.form.get('username')?.clearAsyncValidators();
        },
        error: () => this.snack.error('Failed to load employee details.')
      });
  }

  filterDeleteOptions(): void {
    const term = this.deleteSearchTerm.toLowerCase().trim();
    this.filteredEmployees = term
      ? this.employees.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.userName.toLowerCase().includes(term)
      )
      : [...this.employees];
  }

  getEmployeeByUserId(userId: string): any {
    return this.employees.find(emp => emp.userId === userId);
  }

  removeFromSelection(userId: string): void {
    this.selectedDeleteIds = this.selectedDeleteIds.filter(id => id !== userId);
  }

  get allSelected(): boolean {
    return this.employees.length > 0 &&
      this.selectedDeleteIds.length === this.employees.length;
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedDeleteIds = [];
    } else {
      this.selectedDeleteIds = this.employees.map(emp => emp.userId);
    }
  }

  clearSelection(): void {
    this.selectedDeleteIds = [];
    this.deleteSearchTerm = '';
    this.filteredEmployees = [...this.employees];
  }

  confirmDeleteSelected(): void {
    if (!this.selectedDeleteIds.length) return;

    const dialogRef = this.dialog.open(EmployeeDeleteConfirmComponent, {
      width: '440px',
      maxWidth: '96vw',
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.executeBulkDelete(this.selectedDeleteIds);
      }
    });
  }

  private executeBulkDelete(ids: string[]): void {
    this.deleting = true;
    this.empSvc.deleteMultiple(ids)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.deleting = false;
          if (res.status === 'SUCCESS') {
            this.snack.success(`${res.deletedCount} employee${res.deletedCount > 1 ? 's' : ''} deleted successfully!`);
          } else if (res.status === 'PARTIAL') {
            this.snack.success(`${res.deletedCount} deleted. ${res.failedCount} failed.`);
          } else {
            this.snack.error('Failed to delete employees.');
          }
          this.selectedDeleteIds = [];
          this.loadEmployees();
        },
        error: (e: any) => {
          this.deleting = false;
          this.snack.error(e?.error?.message || 'Delete operation failed.');
        }
      });
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
    const iv = CryptoJS.enc.Utf8.parse(AES_IV);
    return CryptoJS.AES.encrypt(plain, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const v = this.form.getRawValue();
    const plainPwd = v.password || '';

    const payload: any = {
      firstName: v.firstName,
      lastName: v.lastName,
      userName: v.username,
      username: v.username,
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

    if (plainPwd) {
      payload.password = this.encryptPassword(plainPwd);
      payload.plainPassword = plainPwd; // for welcome email
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
        if (this.mode === 'add' && v.email) {
          setTimeout(() => this.snack.success(`Welcome email sent to ${v.email}`), 600);
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
      fd.resetForm({ role: '' });
    });
    this.form.reset({ role: '' });
    this.selectedEmployee = '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
