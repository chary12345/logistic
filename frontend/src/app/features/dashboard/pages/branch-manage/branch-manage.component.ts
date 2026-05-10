import { Component, OnDestroy, ViewChild, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  AbstractControl, AsyncValidatorFn, FormGroupDirective, FormControl
} from '@angular/forms';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, of, debounceTime, switchMap, map, catchError, first } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { BranchDTO, BranchMap } from '../../../../shared/models/models';
import { Country, State, City } from 'country-state-city';

@Component({
  selector: 'app-branch-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatRadioModule, MatDialogModule, MatCheckboxModule, MatChipsModule,
    MatDividerModule, MatTabsModule
  ],
  templateUrl: './branch-manage.component.html',
  styleUrls: ['./branch-manage.component.scss']
})
export class BranchManageComponent implements OnInit, OnDestroy {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  @ViewChildren(FormGroupDirective) formDirectives!: QueryList<FormGroupDirective>;

  mode: 'add' | 'edit' = 'add';
  loadedBranchSnapshot: any = null;
  branches: BranchMap[] = [];
  branchEditSearch = '';
  loadingBranches = false;
  loading = false;
  private destroy$ = new Subject<void>();

  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  countrySearch = '';
  stateSearch = '';
  citySearch = '';

  form = this.fb.group({
    branchCode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{2,10}$/)], [this.branchCodeValidator()]],
    branchName: ['', Validators.required],
    country: ['IN', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    branchType: ['', Validators.required],
    addressStreet: [''],
    phone: ['', Validators.pattern(/^\d{10}$/)],
    phone2: ['', Validators.pattern(/^\d{10}$/)],
    email: ['', [Validators.required, Validators.email]],
    gstin: [''],
    contactPerson: [''],
    postalCode: [''],
    isBranchActive: [true]
  });

  selectedBranch = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.countries = Country.getAllCountries();
    this.loadStates('IN');
    this.cities = [];
  }

  get filteredCountries(): any[] {
    const q = this.countrySearch.toLowerCase().trim();
    if (!q) return this.countries;
    return this.countries.filter(c => c.name.toLowerCase().includes(q));
  }

  get filteredStates(): any[] {
    const q = this.stateSearch.toLowerCase().trim();
    if (!q) return this.states;
    return this.states.filter(s => s.name.toLowerCase().includes(q));
  }

  get filteredCities(): any[] {
    const q = this.citySearch.toLowerCase().trim();
    if (!q) return this.cities;
    return this.cities.filter(cy => cy.name.toLowerCase().includes(q));
  }

  get filteredBranches(): BranchMap[] {
    const q = this.branchEditSearch.toLowerCase().trim();
    if (!q) return this.branches;
    return this.branches.filter(b => 
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
    if (!this.loadedBranchSnapshot) return false;
    return this.normalizeForComparison(this.form.getRawValue()) !== this.normalizeForComparison(this.loadedBranchSnapshot);
  }

  loadStates(countryCode: string): void {
    this.states = State.getStatesOfCountry(countryCode);
  }

  loadCities(countryCode: string, stateCode: string): void {
    this.cities = City.getCitiesOfState(countryCode, stateCode);
  }

  onCountryChange(countryCode: string): void {
    this.loadStates(countryCode);
    this.form.patchValue({ state: '', city: '' });
    this.cities = [];
    this.countrySearch = '';
    this.stateSearch = '';
    this.citySearch = '';
  }

  onStateChange(stateCode: string): void {
    const countryCode = this.form.get('country')?.value || 'IN';
    this.loadCities(countryCode, stateCode);
    this.form.patchValue({ city: '' });
    this.stateSearch = '';
    this.citySearch = '';
  }

  onTabChange(index: number): void {
    this.setMode(index === 0 ? 'add' : 'edit');
  }

  setMode(m: 'add' | 'edit'): void {
    this.mode = m;
    this.formDirectives?.forEach(fd => {
      fd.resetForm({
        branchType: '',
        country: 'IN',
        state: '',
        city: '',
        isBranchActive: true
      });
    });
    this.form.reset({
      branchType: '',
      country: 'IN',
      state: '',
      city: '',
      isBranchActive: true
    });
    this.selectedBranch = '';
    this.loadedBranchSnapshot = null;
    this.loadStates('IN');
    this.cities = [];
    this.countrySearch = '';
    this.stateSearch = '';
    this.citySearch = '';
    this.branchEditSearch = '';
    if (m === 'edit') {
      this.loadBranches();
      this.form.get('isBranchActive')?.disable();
    }
    if (m === 'add') {
      this.form.get('branchCode')?.enable();
      this.form.get('branchCode')?.setAsyncValidators([this.branchCodeValidator()]);
      this.form.get('isBranchActive')?.enable();
    }
  }

  loadBranches(): void {
    this.loadingBranches = true;
    this.branchSvc.getByCompanyCode(this.auth.companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          this.branches = r.data || [];
          this.loadingBranches = false;
        },
        error: () => this.loadingBranches = false
      });
  }

  branchTypeIcon(type?: string): string {
    switch ((type || '').toLowerCase()) {
      case 'hub': return 'hub';
      case 'booking office': return 'storefront';
      default: return 'account_balance';
    }
  }

  loadBranchData(code: string): void {
    this.branchSvc.getByCode(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (b: any) => {
          const countryVal = b.branchAddress?.country || 'India';
          const stateVal = b.branchAddress?.state || '';
          const cityVal = b.branchAddress?.city || '';

          // Find country ISO code from name or code
          let countryCode = 'IN';
          const foundCountry = this.countries.find(
            c => c.name.toLowerCase() === countryVal.toLowerCase() || c.isoCode.toLowerCase() === countryVal.toLowerCase()
          );
          if (foundCountry) {
            countryCode = foundCountry.isoCode;
          }

          // Load states for this country
          this.loadStates(countryCode);

          // Find state ISO code from name or code
          let stateCode = '';
          const foundState = this.states.find(
            s => s.name.toLowerCase() === stateVal.toLowerCase() || s.isoCode.toLowerCase() === stateVal.toLowerCase()
          );
          if (foundState) {
            stateCode = foundState.isoCode;
          }

          // Load cities for this state
          if (stateCode) {
            this.loadCities(countryCode, stateCode);
          }

          this.form.patchValue({
            branchCode: b.branchCode,
            branchName: b.branchName,
            branchType: b.branchType || 'Branch',
            country: countryCode,
            state: stateCode,
            city: cityVal,
            addressStreet: b.branchAddress?.areaOrStreetline || '',
            postalCode: b.branchAddress?.postalCode || '',
            phone: b.branchPhone || '',
            phone2: b.branchPhoneAlt || '',
            email: b.branchEmail || '',
            gstin: b.gstIn || '',
            contactPerson: b.contactPersonName || '',
            isBranchActive: b.branchActive ?? true
          });
          this.form.get('branchCode')?.disable();
          this.form.get('branchCode')?.clearAsyncValidators();
          this.form.get('isBranchActive')?.enable();
          
          this.loadedBranchSnapshot = this.form.getRawValue();
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
        map(r => (r.status === 'available' || r.status === '') ? null : { taken: true }),
        catchError(() => of(null)),
        first()
      );
    };
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    
    const val = this.form.getRawValue();

    // Change Detection
    if (this.mode === 'edit' && this.loadedBranchSnapshot) {
      const isUnchanged = this.normalizeForComparison(val) === this.normalizeForComparison(this.loadedBranchSnapshot);
      if (isUnchanged) {
        this.snack.info('No changes detected. Update was not required.');
        return;
      }
    }

    this.loading = true;

    // Resolve names from codes
    const selectedCountryObj = this.countries.find(c => c.isoCode === val.country);
    const selectedStateObj = this.states.find(s => s.isoCode === val.state);

    const dto: any = {
      branchCode: val.branchCode,
      branchName: val.branchName,
      branchActive: val.isBranchActive ?? true,
      isBranchActive: val.isBranchActive ?? true,
      branchType: val.branchType || 'Branch',
      branchOpperations: 'Branch',
      branchPhone: val.phone || '',
      branchPhoneAlt: val.phone2 || '',
      branchEmail: val.email || '',
      branchPan: '',
      gstIn: val.gstin || '',
      contactPersonName: val.contactPerson || '',
      companyCode: this.auth.companyCode,
      branchCreatedBy: this.auth.userFullName || this.auth.companyCode,
      branchAddress: {
        flatOrApartmentNumber: '',
        areaOrStreetline: val.addressStreet || '',
        landMark: '',
        city: val.city || '',
        state: selectedStateObj ? selectedStateObj.name : (val.state || ''),
        postalCode: val.postalCode || '',
        country: selectedCountryObj ? selectedCountryObj.name : (val.country || 'India')
      }
    };

    const obs$ = this.mode === 'add'
      ? this.branchSvc.create(dto)
      : this.branchSvc.update(val.branchCode!, dto) as any;

    (obs$ as any).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loading = false;
        this.snack.success(`Branch ${this.mode === 'add' ? 'created' : 'updated'} successfully!`);
        if (this.mode === 'add' && val.email) {
          setTimeout(() => this.snack.success(`Branch setup email sent to ${val.email}`), 600);
        } else if (this.mode === 'edit' && val.email) {
          setTimeout(() => this.snack.success(`Branch update email sent to ${val.email}`), 600);
        }
        this.reset();
        if (this.mode === 'edit') this.loadBranches();
      },
      error: (e: any) => { this.loading = false; this.snack.error(e?.error?.message || 'Operation failed.'); }
    });
  }

  reset(): void {
    this.formDirectives?.forEach(fd => {
      fd.resetForm({
        branchType: '',
        country: 'IN',
        state: '',
        city: '',
        isBranchActive: true
      });
    });
    this.form.reset({
      branchType: '',
      country: 'IN',
      state: '',
      city: '',
      isBranchActive: true
    });
    this.selectedBranch = '';
    this.loadedBranchSnapshot = null;
    if (this.mode === 'edit') {
      this.form.get('isBranchActive')?.disable();
    }
    this.loadStates('IN');
    this.cities = [];
    this.countrySearch = '';
    this.stateSearch = '';
    this.citySearch = '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
