import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, of, debounceTime, switchMap, map, catchError, first } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { BranchDTO, BranchMap } from '../../../../shared/models/models';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh','Andaman & Nicobar','Lakshadweep','Dadra & Nagar Haveli'];

@Component({
  selector: 'app-branch-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatRadioModule],
  templateUrl: './branch-manage.component.html',
  styleUrls: ['./branch-manage.component.scss']
})
export class BranchManageComponent implements OnDestroy {
  mode: 'add' | 'edit' = 'add';
  branches: BranchMap[] = [];
  loadingBranches = false;
  loading = false;
  states = STATES;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    branchCode:    ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{2,10}$/)], [this.branchCodeValidator()]],
    branchName:    ['', Validators.required],
    state:         ['', Validators.required],
    city:          ['', Validators.required],
    branchType:    ['Branch', Validators.required],
    addressStreet: [''],
    phone:         ['', Validators.pattern(/^\d{10}$/)],
    phone2:        [''],
    email:         ['', Validators.email],
    gstin:         [''],
    contactPerson: [''],
    postalCode:    [''],
  });

  selectedBranch = '';

  constructor(
    private fb:        FormBuilder,
    private auth:      AuthService,
    private branchSvc: BranchService,
    private snack:     SnackbarService,
  ) {}

  setMode(m: 'add' | 'edit'): void {
    this.mode = m;
    this.form.reset({ branchType: 'Branch' });
    if (m === 'edit' && !this.branches.length) this.loadBranches();
    if (m === 'add') {
      this.form.get('branchCode')?.enable();
      this.form.get('branchCode')?.setAsyncValidators([this.branchCodeValidator()]);
    }
  }

  loadBranches(): void {
    this.loadingBranches = true;
    this.branchSvc.getByCompanyCode(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => { this.branches = r.data || []; this.loadingBranches = false; },
                   error: () => this.loadingBranches = false });
  }

  loadBranchData(code: string): void {
    this.branchSvc.getByCode(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: b => {
          this.form.patchValue(b);
          this.form.get('branchCode')?.disable();
          this.form.get('branchCode')?.clearAsyncValidators();
        },
        error: () => this.snack.error('Failed to load branch data.')
      });
  }

  private branchCodeValidator(): AsyncValidatorFn {
    return (ctrl: AbstractControl) => {
      if (!ctrl.value) return of(null);
      return of(ctrl.value).pipe(
        debounceTime(400),
        switchMap(v => this.branchSvc.validateBranchCode(v)),
        map(r => r.status === 'available' ? null : { taken: true }),
        catchError(() => of(null)),
        first()
      );
    };
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const raw = this.form.getRawValue() as BranchDTO;
    raw.companyCode = this.auth.companyCode;

    const obs$ = this.mode === 'add'
      ? this.branchSvc.create(raw)
      : this.branchSvc.update(this.form.getRawValue().branchCode!, raw) as any;

    (obs$ as any).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loading = false;
        this.snack.success(`Branch ${this.mode === 'add' ? 'created' : 'updated'} successfully!`);
        this.form.reset({ branchType: 'Branch' });
      },
      error: (e: any) => { this.loading = false; this.snack.error(e?.error?.message || 'Operation failed.'); }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
