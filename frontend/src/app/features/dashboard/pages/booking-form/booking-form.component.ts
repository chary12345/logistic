import {
  Component, OnInit, OnDestroy, HostListener, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl, ValidationErrors, FormGroupDirective
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, debounceTime, takeUntil, map, startWith } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { ContactService } from '../../../../core/services/contact.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { PaymentModeService, PaymentMode } from '../../../../core/services/payment-mode.service';
import { PartyService, Party } from '../../../../core/services/party.service';
import { LrReceiptDialogComponent } from '../../dialogs/lr-receipt-dialog/lr-receipt-dialog.component';
import { BookingConfirmationDialogComponent } from '../../dialogs/booking-confirmation-dialog/booking-confirmation-dialog.component';
import { EwaybillDialogComponent } from '../../dialogs/ewaybill-dialog/ewaybill-dialog.component';
import { ArticleDetailDto, BookingDTO, BranchMap, Contact } from '../../../../shared/models/models';
import { CHARGE_FIELD_CONFIG, sumChargeLineItems } from '../../../../shared/utils/booking-report.util';

const ARTICLE_TYPES: string[] = [];

const ARTICLE_OPTIONS = ['Article', 'Weight', 'Fix'];

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule,
    MatTooltipModule, MatDividerModule, MatAutocompleteModule,
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit, OnDestroy {

  @ViewChild(FormGroupDirective) private formDirective!: FormGroupDirective;

  form!: FormGroup;
  paymentMode: PaymentMode = 'TO PAY';
  loading = false;
  loadingBooking = false;
  isEditMode = false;
  editLR = '';
  saidToContainsList: string[] = [];
  consignorSuggestions: Contact[] = [];
  consigneeSuggestions: Contact[] = [];
  destinationSuggestions: BranchMap[] = [];
  filteredDestinations: BranchMap[] = [];
  loadedBookingSnapshot: any = null;
  filteredSaidToContains: string[] = [];
  filteredArticleTypes: string[] = [];
  articleTypes: string[] = [];
  filteredArticleOptions: string[] = ARTICLE_OPTIONS;
  nextLR = '';
  hasValidConsignorGST = false;
  hasValidConsigneeGST = false;
  partiesList: Party[] = [];
  partySuggestions: Party[] = [];
  selectedParty: any = null;
  ewayBillList: string[] = [];
  readonly chargeFields = CHARGE_FIELD_CONFIG;

  private destroy$ = new Subject<void>();

  get articles(): FormArray { return this.form.get('articles') as FormArray; }
  get showPaidVia(): boolean { return this.paymentMode === 'PAID'; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bookingSvc: BookingService,
    private contactSvc: ContactService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
    private dialog: MatDialog,
    private paymentModeSvc: PaymentModeService,
    private partySvc: PartyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadSaidToContains();
    this.loadArticleTypes();
    this.loadBranchDestinations();
    this.watchCharges();

    this.form.get('deliveryDestination')?.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterDestinations(value || '');
    });

    this.paymentModeSvc.getPaymentMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.paymentMode = mode;
        this.updatePartyNameValidation(mode);
      });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['lr']) {
        this.isEditMode = true;
        this.editLR = params['lr'];
        this.loadBookingForEdit(params['lr']);
      } else {
        this.isEditMode = false;
        this.editLR = '';
        this.loadNextLR();
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      deliveryDestination: ['', Validators.required],
      partyName: [''],
      consignorName: ['', Validators.required],
      consignorMobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      consignorGST: ['', this.gstValidator.bind(this)],
      consignorAddress: ['', Validators.required],
      consigneeName: ['', Validators.required],
      consigneeMobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      consigneeGST: ['', this.gstValidator.bind(this)],
      consigneeAddress: ['', Validators.required],
      invoiceNo: [''],
      invoiceValue: [null],
      ewayBill: [''],
      ewayBillList: [[]],
      remarks: [''],
      paidVia: ['CASH'],
      lrCharge: [0, [Validators.min(0)]],
      hamali: [0, [Validators.min(0)]],
      loading: [0, [Validators.min(0)]],
      loadingCharge: [0, [Validators.min(0)]],
      stationary: [0, [Validators.min(0)]],
      otherCharges: [0, [Validators.min(0)]],
      otherTransportCharges: [0, [Validators.min(0)]],
      miscellaneous: [0, [Validators.min(0)]],
      crossingAmount: [0, [Validators.min(0)]],
      podCharges: [0, [Validators.min(0)]],
      doorDelivery: [0, [Validators.min(0)]],
      doorPickup: [0, [Validators.min(0)]],
      ddc: [0, [Validators.min(0)]],
      dcc: [0, [Validators.min(0)]],
      demurrage: [0, [Validators.min(0)]],
      unloading: [0, [Validators.min(0)]],
      localVehicle: [0, [Validators.min(0)]],
      crossingHire: [0, [Validators.min(0)]],
      freight: [{ value: 0, disabled: true }],
      sgst: [{ value: 0, disabled: true }],
      cgst: [{ value: 0, disabled: true }],
      igst: [{ value: 0, disabled: true }],
      grandTotal: [{ value: 0, disabled: true }],
      articles: this.fb.array([this.makeArticleRow()]),
    });

    this.form.get('consignorGST')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hasValidConsignorGST = !this.form.get('consignorGST')?.hasError('invalidGST') && !!this.form.get('consignorGST')?.value;
        this.recalcCharges();
      });

    this.form.get('consigneeGST')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hasValidConsigneeGST = !this.form.get('consigneeGST')?.hasError('invalidGST') && !!this.form.get('consigneeGST')?.value;
        this.recalcCharges();
      });
  }

  /**
   * Validates GST number format.
   * Valid GST format: 2 digits + 5 uppercase letters + 4 digits + 1 uppercase letter + 1 alphanumeric + Z + 1 alphanumeric
   * Example: 18AABCU9603R1Z5
   */
  gstValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // No validation error if empty - GST is optional
    }
    return GST_REGEX.test(control.value) ? null : { invalidGST: true };
  }

  private loadBookingForEdit(lr: string): void {
    this.loadingBooking = true;
    this.bookingSvc.searchByLR(lr).pipe(takeUntil(this.destroy$)).subscribe({
      next: (booking: any) => {
        this.loadingBooking = false;
        if (!booking) { this.snack.error('Booking not found.'); return; }
        this.filterSaidToContains('');
        this.filterArticleTypes('');

        if (booking.billType) {
          this.paymentMode = booking.billType as PaymentMode;
          this.updatePartyNameValidation(this.paymentMode);
          if (this.paymentMode === 'TBB') {
            this.selectedParty = { partyName: booking.partyName || booking.consignorName || '' };
          }
        }

        const destCode = booking.destinationBranchCode;
        const matchingDest = this.destinationSuggestions.find(d => d.branchCode === destCode);
        const destStr = matchingDest ? `${matchingDest.branchName} (${matchingDest.branchCode})` : destCode;

        this.form.patchValue({
          deliveryDestination: destStr,
          partyName: booking.partyName || booking.consignorName || '',
          consignorName: booking.consignorName,
          consignorMobile: booking.consignorMobile,
          consignorGST: booking.consignorGST || '',
          consignorAddress: booking.consignorAddress,
          consigneeName: booking.consigneeName,
          consigneeMobile: booking.consigneeMobile,
          consigneeGST: booking.consigneeGST || '',
          consigneeAddress: booking.consigneeAddress,
          invoiceNo: booking.invoiceNumber,
          invoiceValue: booking.invoiceValue,
          ewayBill: booking.eWayBillNumber || '',
          remarks: booking.remarks || '',
          paidVia: booking.paidVia || 'CASH',
          lrCharge: booking.lrCharge ?? 0,
          hamali: booking.hamali ?? 0,
          loading: booking.loading ?? 0,
          loadingCharge: booking.loadingCharge ?? 0,
          stationary: booking.stationary ?? 0,
          otherCharges: booking.otherCharges ?? 0,
          otherTransportCharges: booking.otherTransportCharges ?? 0,
          miscellaneous: booking.miscellaneous ?? 0,
          crossingAmount: booking.crossingAmount ?? 0,
          podCharges: booking.podCharges ?? 0,
          doorDelivery: booking.doorDelivery ?? 0,
          doorPickup: booking.doorPickup ?? 0,
          ddc: booking.ddc ?? 0,
          dcc: booking.dcc ?? 0,
          demurrage: booking.demurrage ?? 0,
          unloading: booking.unloading ?? 0,
          localVehicle: booking.localVehicle ?? 0,
          crossingHire: booking.crossingHire ?? 0,
        });

        if (booking.eWayBillNumbers) {
          this.ewayBillList = Array.isArray(booking.eWayBillNumbers) ? booking.eWayBillNumbers : [];
        } else if (booking.eWayBillNumber && booking.eWayBillNumber.includes(',')) {
          this.ewayBillList = booking.eWayBillNumber.split(',').map((s: string) => s.trim());
        } else if (booking.eWayBillNumber) {
          this.ewayBillList = [booking.eWayBillNumber];
        } else {
          this.ewayBillList = [];
        }
        this.form.patchValue({ ewayBillList: this.ewayBillList });

        while (this.articles.length > 0) this.articles.removeAt(0);
        const articleDetails = booking.articleDetails || [];
        if (articleDetails.length > 0) {
          articleDetails.forEach((a: any) => {
            const qty = +(a.artQty) || 1;
            const amt = +(a.artAmt) || 0;
            this.articles.push(this.fb.group({
              article: [a.article || 'Article'],
              artQuantity: [qty, [Validators.min(0)]],
              artType: [(a.artType && a.artType !== '') ? a.artType : null],
              saidToContain: [a.saidToContain || null],
              artAmount: [amt, [Validators.min(0)]],
              total: [{ value: qty * amt, disabled: true }],
            }));
          });
        } else {
          this.articles.push(this.makeArticleRow());
        }

        this.recalcCharges();
        this.loadedBookingSnapshot = this.normalizeForComparison(this.form.getRawValue());
        this.snack.info(`Editing LR: ${lr}`);
      },
      error: () => {
        this.loadingBooking = false;
        this.snack.error('Failed to load booking for editing.');
      }
    });
  }

  makeArticleRow(): FormGroup {
    return this.fb.group({
      article: ['Article'],
      artQuantity: [null, [Validators.min(0)]],
      artType: [null],
      saidToContain: [null],
      artAmount: [null, [Validators.min(0)]],
      total: [{ value: 0, disabled: true }],
    });
  }

  addArticle(): void { this.articles.push(this.makeArticleRow()); }
  removeArticle(i: number): void { if (this.articles.length > 1) this.articles.removeAt(i); }

  onArticleChange(i: number): void {
    const row = this.articles.at(i);
    const qty = +row.get('artQuantity')?.value || 0;
    const amt = +row.get('artAmount')?.value || 0;
    row.patchValue({ total: qty * amt }, { emitEvent: false });
    this.recalcCharges();
  }

  private watchCharges(): void {
    const fields = this.chargeFields.map(f => f.key);
    fields.forEach(f => {
      this.form.get(f)?.valueChanges
        .pipe(debounceTime(250), takeUntil(this.destroy$))
        .subscribe(() => this.recalcCharges());
    });
  }

  recalcCharges(): void {
    const freight = this.articles.controls.reduce((sum, row) => {
      return sum + (+row.get('artQuantity')?.value || 0) * (+row.get('artAmount')?.value || 0);
    }, 0);

    const raw = this.form.getRawValue();
    const lineSubtotal = sumChargeLineItems({
      freight,
      lrCharge: +raw.lrCharge || 0,
      hamali: +raw.hamali || 0,
      loading: +raw.loading || 0,
      loadingCharge: +raw.loadingCharge || 0,
      stationary: +raw.stationary || 0,
      otherCharges: +raw.otherCharges || 0,
      otherTransportCharges: +raw.otherTransportCharges || 0,
      miscellaneous: +raw.miscellaneous || 0,
      crossingAmount: +raw.crossingAmount || 0,
      podCharges: +raw.podCharges || 0,
      doorDelivery: +raw.doorDelivery || 0,
      doorPickup: +raw.doorPickup || 0,
      ddc: +raw.ddc || 0,
      dcc: +raw.dcc || 0,
      demurrage: +raw.demurrage || 0,
      unloading: +raw.unloading || 0,
      localVehicle: +raw.localVehicle || 0,
      crossingHire: +raw.crossingHire || 0,
    });

    const hasValidConsignorGST = !!this.form.get('consignorGST')?.value && !this.form.get('consignorGST')?.hasError('invalidGST');
    const hasValidConsigneeGST = !!this.form.get('consigneeGST')?.value && !this.form.get('consigneeGST')?.hasError('invalidGST');
    const hasValidGST = hasValidConsignorGST || hasValidConsigneeGST;

    let sgst = 0;
    let cgst = 0;
    let igst = 0;
    let grandTotal = lineSubtotal;

    if (hasValidGST) {
      sgst = lineSubtotal * 0.025;
      cgst = lineSubtotal * 0.025;
      grandTotal = lineSubtotal + sgst + cgst;
    }

    this.form.patchValue({
      freight,
      sgst: +sgst.toFixed(2),
      cgst: +cgst.toFixed(2),
      igst: +igst.toFixed(2),
      grandTotal: +grandTotal.toFixed(2),
    }, { emitEvent: false });
  }

  setPaymentMode(mode: PaymentMode): void {
    if (this.paymentMode === mode) return;
    this.paymentMode = mode;
    this.paymentModeSvc.setPaymentMode(mode);
    this.updatePartyNameValidation(mode);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'F7') { e.preventDefault(); this.setPaymentMode('PAID'); }
    else if (e.key === 'F8') { e.preventDefault(); this.setPaymentMode('TO PAY'); }
    else if (e.key === 'F9') { e.preventDefault(); this.setPaymentMode('TBB'); }
    else if (e.key === 'Enter') {
      this.handleEnterKey(e);
    }
  }

  private handleEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (tagName === 'textarea' || target.closest('button')) {
      return;
    }

    if (tagName === 'mat-select' &&
      (target.getAttribute('aria-expanded') === 'true' || document.querySelector('.mat-mdc-select-panel'))) {
      return;
    }

    if (tagName === 'input' &&
      target.getAttribute('aria-expanded') === 'true' &&
      target.getAttribute('aria-activedescendant')) {
      return;
    }

    const selectors = [
      'input:not([type="hidden"]):not([disabled])',
      'mat-select',
      'textarea:not([disabled])',
      '[tabindex="0"]:not([disabled])'
    ];

    const form = target.closest('form');
    if (!form) return;

    const elements = Array.from(form.querySelectorAll(selectors.join(',')))
      .filter((el: any) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      }) as HTMLElement[];

    const currentIndex = elements.indexOf(target);

    if (currentIndex > -1 && currentIndex < elements.length - 1) {
      event.preventDefault();
      const nextElement = elements[currentIndex + 1];

      target.blur();
      if (nextElement.tagName.toLowerCase() === 'mat-select') {
        const trigger = nextElement.querySelector('.mat-mdc-select-trigger') as HTMLElement;
        if (trigger) trigger.focus();
        else nextElement.focus();
      } else {
        nextElement.focus();
      }
    }
  }

  updatePartyNameValidation(mode: PaymentMode): void {
    const partyNameCtrl = this.form?.get('partyName');
    if (!partyNameCtrl) return;
    if (mode === 'TBB') {
      partyNameCtrl.setValidators([Validators.required, this.partySelectedValidator.bind(this)]);
      this.loadParties();
    } else {
      partyNameCtrl.clearValidators();
      partyNameCtrl.setValue('', { emitEvent: false });
      partyNameCtrl.setErrors(null);
      partyNameCtrl.markAsUntouched();
      partyNameCtrl.markAsPristine();
      this.selectedParty = null;
      this.partySuggestions = [];
    }
    partyNameCtrl.updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  partySelectedValidator(control: AbstractControl): ValidationErrors | null {
    if (this.paymentMode !== 'TBB') return null;
    if (!control.value) return { required: true };
    if (!this.selectedParty || this.selectedParty.partyName !== control.value) {
      return { partyNotSelected: true };
    }
    return null;
  }

  loadParties(): void {
    const cc = this.auth.companyCode;
    if (!cc) return;
    this.partySvc.getPartiesByCompanyCode(cc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
          this.partiesList = list || [];
          if (this.form.get('partyName')?.value) {
            this.searchParties(this.form.get('partyName')?.value);
          }
        },
        error: () => {
          this.partiesList = [];
        }
      });
  }

  searchParties(q: string): void {
    if (!q) {
      this.partySuggestions = [];
      this.selectedParty = null;
      this.form.get('partyName')?.setErrors({ required: true });
      return;
    }

    const search = q.toLowerCase().trim();
    this.partySuggestions = this.partiesList.filter(p =>
      (p.partyName || '').toLowerCase().includes(search) ||
      (p.partyCode || '').toLowerCase().includes(search)
    );

    const exactMatch = this.partiesList.find(p => (p.partyName || '').toLowerCase() === search);
    if (exactMatch) {
      this.selectedParty = exactMatch;
      this.form.get('partyName')?.setErrors(null);
    } else if (this.selectedParty && this.selectedParty.partyName.toLowerCase() === search) {
      this.form.get('partyName')?.setErrors(null);
    } else {
      this.selectedParty = null;
      this.form.get('partyName')?.setErrors({ partyNotSelected: true });
    }
  }

  fillParty(p: Party): void {
    this.selectedParty = p;
    this.form.patchValue({
      partyName: p.partyName,
      consignorName: p.partyName,
      consignorMobile: p.mobileNumber1 || '',
      consignorGST: '',
      consignorAddress: p.city || '',
    });
    this.partySuggestions = [];
    this.form.get('partyName')?.setErrors(null);
    this.form.get('partyName')?.markAsTouched();
    this.hasValidConsignorGST = !this.form.get('consignorGST')?.hasError('invalidGST') && !!this.form.get('consignorGST')?.value;
    this.recalcCharges();
  }

  private loadSaidToContains(): void {
    const cc = this.auth.companyCode;
    if (!cc) return;

    const defaults = ['Cartons', 'Boxes', 'Bags', 'Bundles', 'Rolls', 'Cases', 'Crates', 'Pallets', 'Pieces', 'Drums'];

    this.bookingSvc.getSaidToContains(cc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
          const dbValues = (list || []).filter(v => v && v.trim());
          const combined = Array.from(new Set([...dbValues, ...defaults])).sort();
          this.saidToContainsList = combined;
          this.filterSaidToContains('');
        },
        error: () => {
          this.saidToContainsList = defaults.sort();
          this.filterSaidToContains('');
        }
      });
  }

  filterSaidToContains(val: any): void {
    const search = (typeof val === 'string' ? val : val?.value || '').toLowerCase().trim();
    this.filteredSaidToContains = this.saidToContainsList.filter(s =>
      (s || '').toLowerCase().includes(search)
    );
  }

  private loadArticleTypes(): void {
    const cc = this.auth.companyCode;
    if (!cc) return;
    this.bookingSvc.fetchArticleTypeList(cc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
          this.articleTypes = (list || []).map(t => {
            if (!t) return '';
            return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
          });
          this.filterArticleTypes('');
        },
        error: () => {
          this.articleTypes = [];
          this.filterArticleTypes('');
        }
      });
  }

  filterArticleTypes(val: any): void {
    const search = (typeof val === 'string' ? val : val?.value || '').toLowerCase().trim();
    this.filteredArticleTypes = this.articleTypes.filter(t =>
      (t || '').toLowerCase().includes(search)
    );
  }

  filterArticleOptions(val: any): void {
    const search = (typeof val === 'string' ? val : val?.value || '').toLowerCase().trim();
    this.filteredArticleOptions = ARTICLE_OPTIONS.filter(a =>
      a.toLowerCase().includes(search)
    );
  }

  private normalizeForComparison(data: any): string {
    if (!data) return '';
    const cloned = JSON.parse(JSON.stringify(data));
    const walk = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(item => walk(item));
        return;
      }
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'object') {
            walk(obj[key]);
          } else {
            const val = obj[key];
            obj[key] = (val === null || val === undefined) ? '' : String(val).trim();
          }
        });
      }
    };
    walk(cloned);
    return JSON.stringify(cloned);
  }

  get isFormChanged(): boolean {
    if (!this.isEditMode) return true;
    if (!this.loadedBookingSnapshot) return false;
    return this.normalizeForComparison(this.form.getRawValue()) !== this.loadedBookingSnapshot;
  }

  private loadNextLR(): void {
    const bc = this.auth.branchCode;
    if (!bc) return;
    this.branchSvc.getNextLR(bc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: lr => this.nextLR = lr, error: () => { } });
  }

  private loadBranchDestinations(): void {
    const companyCode = this.auth.companyCode;
    const myBranch = this.auth.branchCode;
    if (!companyCode) return;

    this.branchSvc.getByCompanyCode(companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
            this.destinationSuggestions = res.data
              .filter(b => b.branchCode !== myBranch); // Filter out my branch
            this.filterDestinations('');
          }
        },
        error: () => { }
      });
  }

  private filterDestinations(val: string): void {
    const search = (val || '').toLowerCase().trim();
    this.filteredDestinations = this.destinationSuggestions.filter(d =>
      (d.branchName || '').toLowerCase().includes(search) ||
      (d.branchCode || '').toLowerCase().includes(search)
    );
  }

  searchConsignor(q: string): void {
    if (!q || q.length < 2) { this.consignorSuggestions = []; return; }
    this.contactSvc.search('consignor', q, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.consignorSuggestions = r, error: () => { } });
  }

  fillConsignor(c: Contact): void {
    this.form.patchValue({
      consignorName: c.name, consignorMobile: c.mobile,
      consignorGST: c.gst, consignorAddress: c.address,
    });
    this.hasValidConsignorGST = !this.form.get('consignorGST')?.hasError('invalidGST') && !!this.form.get('consignorGST')?.value;
    this.recalcCharges();
    this.consignorSuggestions = [];
  }

  searchConsignee(q: string): void {
    if (!q || q.length < 2) { this.consigneeSuggestions = []; return; }
    this.contactSvc.search('consignee', q, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.consigneeSuggestions = r, error: () => { } });
  }

  fillConsignee(c: Contact): void {
    this.form.patchValue({
      consigneeName: c.name, consigneeMobile: c.mobile,
      consigneeGST: c.gst, consigneeAddress: c.address,
    });
    this.hasValidConsigneeGST = !this.form.get('consigneeGST')?.hasError('invalidGST') && !!this.form.get('consigneeGST')?.value;
    this.recalcCharges();
    this.consigneeSuggestions = [];
  }

  resetForm(): void {
    if (this.formDirective) {
      this.formDirective.resetForm({
        deliveryDestination: '',
        partyName: '',
        consignorName: '',
        consignorMobile: '',
        consignorGST: '',
        consignorAddress: '',
        consigneeName: '',
        consigneeMobile: '',
        consigneeGST: '',
        consigneeAddress: '',
        invoiceNo: '',
        invoiceValue: null,
        ewayBill: '',
        ewayBillList: [],
        remarks: '',
        paidVia: 'CASH',
        ...this.defaultChargeValues(),
      });
    } else {
      this.form.reset({
        deliveryDestination: '',
        partyName: '',
        consignorName: '',
        consignorMobile: '',
        consignorGST: '',
        consignorAddress: '',
        consigneeName: '',
        consigneeMobile: '',
        consigneeGST: '',
        consigneeAddress: '',
        invoiceNo: '',
        invoiceValue: null,
        ewayBill: '',
        ewayBillList: [],
        remarks: '',
        paidVia: 'CASH',
        ...this.defaultChargeValues(),
      });
      this.form.markAsUntouched();
      this.form.markAsPristine();
    }

    while (this.articles.length > 1) this.articles.removeAt(1);
    this.articles.at(0).reset({ article: 'Article', artQuantity: null, artType: null, saidToContain: null, artAmount: null });
    this.articles.controls.forEach(ctrl => {
      ctrl.markAsUntouched();
      ctrl.markAsPristine();
    });

    this.hasValidConsignorGST = false;
    this.hasValidConsigneeGST = false;
    this.ewayBillList = [];

    this.paymentMode = 'TO PAY';
    this.updatePartyNameValidation('TO PAY');
    this.selectedParty = null;
    this.partySuggestions = [];
    this.isEditMode = false;
    this.editLR = '';
    this.loadNextLR();
    this.consigneeSuggestions = [];
    this.loadedBookingSnapshot = null;

    this.recalcCharges();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { lr: null },
      queryParamsHandling: 'merge'
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.warning('Please fill all required fields.');
      return;
    }

    if (this.isEditMode && !this.isFormChanged) {
      this.snack.info('No changes detected. Update was not required.');
      return;
    }

    this.recalcCharges();
    const raw = this.form.getRawValue();

    this.dialog.open(BookingConfirmationDialogComponent, {
      data: {
        grandTotal: raw.grandTotal,
        isEditMode: this.isEditMode,
        isNoChanges: false // We already handled pristine check above
      },
      width: '420px',
      maxWidth: '95vw',
      disableClose: false,
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.proceedWithBooking(raw);
    });
  }

  private proceedWithBooking(raw: any): void {
    let branchCodeOnly = raw.deliveryDestination;
    if (branchCodeOnly && branchCodeOnly.includes('(') && branchCodeOnly.includes(')')) {
      branchCodeOnly = branchCodeOnly.substring(branchCodeOnly.indexOf('(') + 1, branchCodeOnly.indexOf(')'));
    }

    const articleDetails = raw.articles.map((a: any) => ({
      article: a.article,
      artQty: String(a.artQuantity),
      artType: a.artType,
      saidToContain: a.saidToContain,
      artAmt: String(a.artAmount),
      total: String(+a.artQuantity * +a.artAmount),
      companyCode: this.auth.companyCode,
    }));

    const dto: any = {
      billType: this.paymentMode,
      paidVia: this.showPaidVia ? raw.paidVia : undefined,
      destinationBranchCode: branchCodeOnly,
      partyName: this.paymentMode === 'TBB' ? raw.partyName : undefined,
      consignorName: raw.consignorName,
      consignorMobile: raw.consignorMobile,
      consignorAddress: raw.consignorAddress,
      consigneeName: raw.consigneeName,
      consigneeMobile: raw.consigneeMobile,
      consigneeAddress: raw.consigneeAddress,
      consignorGST: raw.consignorGST,
      consigneeGST: raw.consigneeGST,
      invoiceNumber: raw.invoiceNo,
      invoiceValue: raw.invoiceValue,
      eWayBillNumber: raw.ewayBill,
      eWayBillNumbers: raw.ewayBillList || [],
      remarks: raw.remarks,
      freight: raw.freight,
      lrCharge: raw.lrCharge,
      hamali: raw.hamali,
      loading: raw.loading,
      loadingCharge: raw.loadingCharge,
      stationary: raw.stationary,
      otherCharges: raw.otherCharges,
      otherTransportCharges: raw.otherTransportCharges,
      miscellaneous: raw.miscellaneous,
      crossingAmount: raw.crossingAmount,
      podCharges: raw.podCharges,
      doorDelivery: raw.doorDelivery,
      doorPickup: raw.doorPickup,
      ddc: raw.ddc,
      dcc: raw.dcc,
      demurrage: raw.demurrage,
      unloading: raw.unloading,
      localVehicle: raw.localVehicle,
      crossingHire: raw.crossingHire,
      sgst: raw.sgst,
      cgst: raw.cgst,
      igst: raw.igst,
      companyCode: this.auth.companyCode,
      branchCode: this.auth.branchCode,
      employeeName: `${this.auth.currentUser?.firstName || ''} ${this.auth.currentUser?.lastName || ''}`.trim(),
      articleDetails,
    };

    this.loading = true;

    const onError = (e: any) => {
      this.loading = false;
      this.snack.error(e?.error?.message || 'Error saving booking. Please try again.');
    };

    if (this.isEditMode) {
      this.bookingSvc.update(this.editLR, dto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: saved => this.handleBookingSaveSuccess(saved, raw),
          error: onError,
        });
    } else {
      this.bookingSvc.create(dto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: saved => this.handleBookingSaveSuccess(saved, raw),
          error: onError,
        });
    }
  }

  private handleBookingSaveSuccess(saved: any, raw: any): void {
    this.loading = false;

    // Create returns BookingResponseDTO; update returns Booking entity.
    let bookingData: any;
    if (!this.isEditMode && saved.booking) {
      bookingData = {
        ...saved.booking,
        articleDetails: saved.articles || [],
        ...saved.charges
      };
    } else {
      bookingData = {
        ...saved,
        lrCharge: raw.lrCharge,
        hamali: raw.hamali,
        loading: raw.loading,
        loadingCharge: raw.loadingCharge,
        stationary: raw.stationary,
        otherCharges: raw.otherCharges,
        otherTransportCharges: raw.otherTransportCharges,
        miscellaneous: raw.miscellaneous,
        crossingAmount: raw.crossingAmount,
        podCharges: raw.podCharges,
        doorDelivery: raw.doorDelivery,
        doorPickup: raw.doorPickup,
        ddc: raw.ddc,
        dcc: raw.dcc,
        demurrage: raw.demurrage,
        unloading: raw.unloading,
        localVehicle: raw.localVehicle,
        crossingHire: raw.crossingHire,
        freight: raw.freight,
        sgst: raw.sgst,
        cgst: raw.cgst,
        igst: raw.igst,
        articleDetails: raw.articles.map((a: any) => ({
          artQty: String(a.artQuantity),
          saidToContain: a.saidToContain,
          article: a.article,
          artType: a.artType,
          artAmt: String(a.artAmount),
          total: String(+a.artQuantity * +a.artAmount)
        }))
      };
    }

    const msg = this.isEditMode
      ? `Booking updated! LR: ${bookingData.loadingReciept || this.editLR}`
      : `Booking created! LR: ${bookingData.loadingReciept}`;
    this.snack.success(msg);

    this.branchSvc.notifyLrUpdated();
    this.loadSaidToContains();

    this.dialog.open(LrReceiptDialogComponent, {
      data: {
        booking: bookingData,
        isEditMode: this.isEditMode
      },
      width: '360px',
      maxWidth: '95vw',
      disableClose: false,
    }).afterClosed().subscribe(() => {
      if (this.isEditMode && this.editLR) {
        this.loadBookingForEdit(this.editLR);
        return;
      }
      this.loadedBookingSnapshot = null;
      this.resetForm();
    });
  }

  openEwayBillDialog(): void {
    const dialogRef = this.dialog.open(EwaybillDialogComponent, {
      width: '450px',
      data: { bills: this.ewayBillList }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ewayBillList = result;
        this.form.patchValue({ ewayBillList: result });
        if (result.length > 0) {
          this.form.patchValue({ ewayBill: result[0] }); // Keep first one in main field for visibility
        }
      }
    });
  }

  private defaultChargeValues(): Record<string, number> {
    const values: Record<string, number> = {};
    this.chargeFields.forEach(f => { values[f.key] = 0; });
    return values;
  }

  /** Prevents [object Object] in autocomplete inputs */
  displayContactName = (val: any): string => {
    return typeof val === 'string' ? val : val?.name || '';
  };

  /** Prevents [object Object] in party autocomplete input */
  displayPartyName = (val: any): string => {
    return typeof val === 'string' ? val : val?.partyName || '';
  };

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
