import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PartyService } from '../../../../core/services/party.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Country, State, City } from 'country-state-city';

@Component({
  selector: 'app-party-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>groups</mat-icon> Party Management</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="party-form">
        <div class="form-grid">
          <mat-form-field>
            <mat-label>Party Name</mat-label>
            <input matInput formControlName="partyName" placeholder="e.g. RAJASTHAN ROYALS">
            <mat-error *ngIf="form.get('partyName')?.hasError('required') && form.get('partyName')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Display Name</mat-label>
            <input matInput formControlName="displayName" placeholder="e.g. RAJASTHAN ROYALS">
            <mat-error *ngIf="form.get('displayName')?.hasError('required') && form.get('displayName')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Party Code</mat-label>
            <input matInput formControlName="partyCode" placeholder="e.g. RR" class="text-uppercase">
            <mat-error *ngIf="form.get('partyCode')?.hasError('required') && form.get('partyCode')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Party Type</mat-label>
            <mat-select formControlName="partyType" placeholder="Select Party Type" [ngClass]="{'placeholder-grey': !form.get('partyType')?.value}">
              <mat-option value="" style="display: none;">Select Party Type</mat-option>
              <mat-option value="BOOKING">Booking</mat-option>
              <mat-option value="DELIVERY">Delivery</mat-option>
              <mat-option value="BOTH">Both</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('partyType')?.hasError('required') && form.get('partyType')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Contact Person</mat-label>
            <input matInput formControlName="contactPerson" placeholder="e.g. Raj">
            <mat-error *ngIf="form.get('contactPerson')?.hasError('required') && form.get('contactPerson')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Mobile Number</mat-label>
            <input matInput type="number" formControlName="mobileNumber1" placeholder="e.g. 8999999999">
            <mat-error *ngIf="form.get('mobileNumber1')?.hasError('required') && form.get('mobileNumber1')?.touched">Required</mat-error>
            <mat-error *ngIf="form.get('mobileNumber1')?.hasError('pattern') && form.get('mobileNumber1')?.touched">Valid 10-digit number required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>GST Number</mat-label>
            <input matInput formControlName="gstNumber" placeholder="e.g. 07AAAAA0000A1Z5" class="text-uppercase">
            <mat-error *ngIf="form.get('gstNumber')?.hasError('required') && form.get('gstNumber')?.touched">Required</mat-error>
            <mat-error *ngIf="form.get('gstNumber')?.hasError('pattern') && form.get('gstNumber')?.touched">Invalid GST format</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Address</mat-label>
            <input matInput formControlName="address" placeholder="e.g. Hyderabad">
            <mat-error *ngIf="form.get('address')?.hasError('required') && form.get('address')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Country</mat-label>
            <mat-select formControlName="country" (selectionChange)="onCountryChange($event.value)" placeholder="Select Country">

              <div class="select-search-box">
                <mat-icon class="search-icon">search</mat-icon>
                <input class="search-input" [value]="countrySearch" (input)="countrySearch = $any($event.target).value" placeholder="Search country..." (keydown)="$event.stopPropagation()">
              </div>
              <mat-option *ngFor="let c of filteredCountries" [value]="c.isoCode">{{ c.name }}</mat-option>
              <mat-option *ngIf="filteredCountries.length === 0" disabled>No countries found</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('country')?.hasError('required') && form.get('country')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>State</mat-label>
            <mat-select formControlName="state" (selectionChange)="onStateChange($event.value)" placeholder="Select State">

              <div class="select-search-box">
                <mat-icon class="search-icon">search</mat-icon>
                <input class="search-input" [value]="stateSearch" (input)="stateSearch = $any($event.target).value" placeholder="Search state..." (keydown)="$event.stopPropagation()">
              </div>
              <mat-option value="" style="display: none;">Select State</mat-option>
              <mat-option *ngFor="let s of filteredStates" [value]="s.isoCode">{{ s.name }}</mat-option>
              <mat-option *ngIf="filteredStates.length === 0" disabled>No states found</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('state')?.hasError('required') && form.get('state')?.touched">Required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>City</mat-label>
            <mat-select formControlName="city" placeholder="Select City">

              <div class="select-search-box">
                <mat-icon class="search-icon">search</mat-icon>
                <input class="search-input" [value]="citySearch" (input)="citySearch = $any($event.target).value" placeholder="Search city..." (keydown)="$event.stopPropagation()">
              </div>
              <mat-option value="" style="display: none;">Select City</mat-option>
              <mat-option *ngFor="let cy of filteredCities" [value]="cy.name">{{ cy.name }}</mat-option>
              <mat-option *ngIf="filteredCities.length === 0" disabled>No cities found</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('city')?.hasError('required') && form.get('city')?.touched">Required</mat-error>
          </mat-form-field>
        </div>

        <div class="submit-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!loading">groups</mat-icon>
            {{ loading ? 'Saving...' : 'Save Party' }}
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
  `]
})
export class PartyManageComponent implements OnInit, OnDestroy {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  countrySearch = '';
  stateSearch = '';
  citySearch = '';

  form = this.fb.group({
    partyName: ['', Validators.required],
    displayName: ['', Validators.required],
    partyCode: ['', Validators.required],
    partyType: ['', Validators.required],
    contactPerson: ['', Validators.required],
    mobileNumber1: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    gstNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/)]],
    address: ['', Validators.required],
    country: ['IN', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required]
  });

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private partySvc: PartyService,
    private snack: SnackbarService,
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

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;


    const selectedCountryObj = this.countries.find(c => c.isoCode === this.form.value.country);
    const selectedStateObj = this.states.find(s => s.isoCode === this.form.value.state);

    const payload = {
      companyCode: this.auth.companyCode,
      branchCode: this.auth.branchCode,
      partyName: this.form.value.partyName,
      displayName: this.form.value.displayName,
      partyCode: this.form.value.partyCode?.toUpperCase(),
      partyType: this.form.value.partyType,
      contactPerson: this.form.value.contactPerson,
      mobileNumber1: this.form.value.mobileNumber1,
      gstNumber: this.form.value.gstNumber?.toUpperCase(),
      address: this.form.value.address,
      country: selectedCountryObj ? selectedCountryObj.name : this.form.value.country,
      state: selectedStateObj ? selectedStateObj.name : this.form.value.state,
      city: this.form.value.city
    };

    this.partySvc.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.snack.success(res?.message || 'Party created successfully!');
          this.reset();
        },
        error: (err) => {
          this.loading = false;
          this.snack.error(err?.error?.message || 'Failed to create party.');
        }
      });
  }

  reset(): void {
    this.formDirective?.resetForm({
      country: 'IN',
      state: '',
      city: ''
    });
    this.loadStates('IN');
    this.cities = [];
    this.countrySearch = '';
    this.stateSearch = '';
    this.citySearch = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
