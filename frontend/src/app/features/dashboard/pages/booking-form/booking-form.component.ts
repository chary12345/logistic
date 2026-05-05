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
import { ArticleDetailDto, BookingDTO, Contact } from '../../../../shared/models/models';

const ARTICLE_TYPES = [
  'Auto Parts', 'Electronics', 'Garments', 'Furniture', 'Food Items',
  'Chemicals', 'Machinery', 'Textiles', 'Documents', 'Other'
];

const ARTICLE_OPTIONS = ['Article', 'Weight', 'Fix'];

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule,
    MatTooltipModule, MatDividerModule,
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
  destinationSuggestions: string[] = [];
  filteredDestinations: string[] = [];
  destinationFilterCtrl = new FormControl('');
  stcFilterCtrl = new FormControl('');
  filteredSaidToContains: string[] = [];
  typeFilterCtrl = new FormControl('');
  filteredArticleTypes: string[] = ARTICLE_TYPES;
  articleTypes = ARTICLE_TYPES;
  articleFilterCtrl = new FormControl('');
  filteredArticleOptions: string[] = ARTICLE_OPTIONS;
  nextLR = '';
  hasValidConsignorGST = false;
  hasValidConsigneeGST = false;
  partiesList: Party[] = [];
  partySuggestions: Party[] = [];
  selectedParty: any = null;

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
    this.loadBranchDestinations();
    this.watchCharges();

    // Set up autocomplete filter
    this.destinationFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterDestinations(value || '');
    });

    // Set up Said To Contain filter
    this.stcFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterSaidToContains(value || '');
    });

    // Set up Type filter
    this.typeFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterArticleTypes(value || '');
    });

    // Set up Article filter
    this.articleFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterArticleOptions(value || '');
    });

    // Subscribe to payment mode changes from dashboard header
    this.paymentModeSvc.getPaymentMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.paymentMode = mode;
        this.updatePartyNameValidation(mode);
      });

    // Check for edit mode via ?lr= query param
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
      paidVia: ['CASH'],
      loadingCharge: [0, [Validators.min(0)]],
      lrCharge: [0, [Validators.min(0)]],
      // Calculated (readonly)
      freight: [{ value: 0, disabled: true }],
      sgst: [{ value: 0, disabled: true }],
      cgst: [{ value: 0, disabled: true }],
      igst: [{ value: 0, disabled: true }],
      grandTotal: [{ value: 0, disabled: true }],
      articles: this.fb.array([this.makeArticleRow()]),
    });

    // Watch for GST field changes to update validation status
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
        this.stcFilterCtrl.setValue('', { emitEvent: false });
        this.typeFilterCtrl.setValue('', { emitEvent: false });
        this.filterSaidToContains('');
        this.filterArticleTypes('');

        // Set payment mode (backend returns billType)
        if (booking.billType) {
          this.paymentMode = booking.billType as PaymentMode;
          this.updatePartyNameValidation(this.paymentMode);
          if (this.paymentMode === 'TBB') {
            this.selectedParty = { partyName: booking.partyName || booking.consignorName || '' };
          }
        }

        // Find the full destination string that matches the branch code
        const destCode = booking.destinationBranchCode;
        const matchingDest = this.destinationSuggestions.find(d => d.includes(`(${destCode})`));

        // Patch main fields (map backend field names to form controls)
        this.form.patchValue({
          deliveryDestination: matchingDest || destCode,
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
          ewayBill: booking.eWayBillNumber,
          paidVia: booking.paidVia || 'CASH',
          loadingCharge: booking.loading || 0,
          lrCharge: booking.loadingCharge || 0,
        });

        // Rebuild articles (backend uses artQty/artAmt as strings)
        while (this.articles.length > 0) this.articles.removeAt(0);
        const articleDetails = booking.articleDetails || [];
        if (articleDetails.length > 0) {
          articleDetails.forEach((a: any) => {
            const qty = +(a.artQty) || 1;
            const amt = +(a.artAmt) || 0;
            this.articles.push(this.fb.group({
              article: [a.article || null],
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
      article: [null],
      artQuantity: [1, [Validators.min(0)]],
      artType: [null],
      saidToContain: [null],
      artAmount: [0, [Validators.min(0)]],
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
    ['loadingCharge', 'lrCharge'].forEach(f => {
      this.form.get(f)?.valueChanges
        .pipe(debounceTime(250), takeUntil(this.destroy$))
        .subscribe(() => this.recalcCharges());
    });
  }

  recalcCharges(): void {
    const freight = this.articles.controls.reduce((sum, row) => {
      return sum + (+row.get('artQuantity')?.value || 0) * (+row.get('artAmount')?.value || 0);
    }, 0);
    const loading = +this.form.get('loadingCharge')?.value || 0;
    const lr = +this.form.get('lrCharge')?.value || 0;
    const base = freight + loading + lr;

    // Only calculate SGST and CGST if at least one valid GST number is present
    const hasValidConsignorGST = !!this.form.get('consignorGST')?.value && !this.form.get('consignorGST')?.hasError('invalidGST');
    const hasValidConsigneeGST = !!this.form.get('consigneeGST')?.value && !this.form.get('consigneeGST')?.hasError('invalidGST');
    const hasValidGST = hasValidConsignorGST || hasValidConsigneeGST;

    let sgst = 0;
    let cgst = 0;
    let igst = 0;
    let grandTotal = base;

    if (hasValidGST) {
      sgst = base * 0.025; // 2.5%
      cgst = base * 0.025; // 2.5%
      grandTotal = base + sgst + cgst;
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
    this.paymentMode = mode;
    this.paymentModeSvc.setPaymentMode(mode);
    this.updatePartyNameValidation(mode);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'F7') { e.preventDefault(); this.setPaymentMode('PAID'); }
    else if (e.key === 'F8') { e.preventDefault(); this.setPaymentMode('TO PAY'); }
    else if (e.key === 'F9') { e.preventDefault(); this.setPaymentMode('TBB'); }
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
      this.selectedParty = null;
      this.partySuggestions = [];
    }
    partyNameCtrl.updateValueAndValidity({ emitEvent: false });
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

    // Standard default options to show if the database is empty or alongside DB results
    const defaults = ['Cartons', 'Boxes', 'Bags', 'Bundles', 'Rolls', 'Cases', 'Crates', 'Pallets', 'Pieces', 'Drums'];

    this.bookingSvc.getSaidToContains(cc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
          // Merge API results with defaults, remove duplicates and sort
          const combined = Array.from(new Set([...(list || []), ...defaults])).sort();
          this.saidToContainsList = combined;
          this.filterSaidToContains('');
        },
        error: () => {
          this.saidToContainsList = defaults.sort();
          this.filterSaidToContains('');
        }
      });
  }

  private filterSaidToContains(val: string): void {
    const search = (val || '').toLowerCase().trim();
    this.filteredSaidToContains = this.saidToContainsList.filter(s =>
      (s || '').toLowerCase().includes(search)
    );
  }

  private filterArticleTypes(val: string): void {
    const search = (val || '').toLowerCase().trim();
    this.filteredArticleTypes = ARTICLE_TYPES.filter(t =>
      t.toLowerCase().includes(search)
    );
  }

  private filterArticleOptions(val: string): void {
    const search = (val || '').toLowerCase().trim();
    this.filteredArticleOptions = ARTICLE_OPTIONS.filter(a =>
      a.toLowerCase().includes(search)
    );
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
              .filter(b => b.branchCode !== myBranch) // Filter out my branch
              .map(b => `${b.branchName} (${b.branchCode})`);
            this.filterDestinations('');
          }
        },
        error: () => { }
      });
  }

  private filterDestinations(val: string): void {
    const search = val.toLowerCase();
    this.filteredDestinations = this.destinationSuggestions.filter(d =>
      d.toLowerCase().includes(search)
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
    // Update validation status for consignor GST
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
    // Update validation status for consignee GST
    this.hasValidConsigneeGST = !this.form.get('consigneeGST')?.hasError('invalidGST') && !!this.form.get('consigneeGST')?.value;
    this.recalcCharges();
    this.consigneeSuggestions = [];
  }

  resetForm(): void {
    // Reset the FormGroupDirective first to clear Angular Material's 'submitted' state.
    // This is the key fix: without this, mat-form-field continues showing red error
    // outlines because the default ErrorStateMatcher checks (control.invalid && form.submitted).
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
        paidVia: 'CASH',
        loadingCharge: 0,
        lrCharge: 0,
      });
    } else {
      // Fallback if ViewChild is not yet available
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
        paidVia: 'CASH',
        loadingCharge: 0,
        lrCharge: 0,
      });
      this.form.markAsUntouched();
      this.form.markAsPristine();
    }

    while (this.articles.length > 1) this.articles.removeAt(1);
    this.articles.at(0).reset({ article: null, artQuantity: 1, artType: null, saidToContain: null, artAmount: 0 });
    this.articles.controls.forEach(ctrl => {
      ctrl.markAsUntouched();
      ctrl.markAsPristine();
    });

    // Reset GST validation flags
    this.hasValidConsignorGST = false;
    this.hasValidConsigneeGST = false;

    this.paymentMode = 'TO PAY';
    this.updatePartyNameValidation('TO PAY');
    this.selectedParty = null;
    this.partySuggestions = [];
    this.isEditMode = false;
    this.editLR = '';
    this.destinationFilterCtrl.setValue('');
    this.stcFilterCtrl.setValue('');
    this.typeFilterCtrl.setValue('');
    this.articleFilterCtrl.setValue('');
    this.loadNextLR();
    this.consignorSuggestions = [];
    this.consigneeSuggestions = [];

    // Clear the editLr query param if present
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

    const isNoChanges = this.isEditMode && this.form.pristine;
    this.recalcCharges();

    const raw = this.form.getRawValue();

    // Show confirmation or info dialog depending on state
    this.dialog.open(BookingConfirmationDialogComponent, {
      data: {
        grandTotal: raw.grandTotal,
        isEditMode: this.isEditMode,
        isNoChanges: isNoChanges
      },
      width: '420px',
      maxWidth: '95vw',
      disableClose: false,
    }).afterClosed().subscribe((confirmed: boolean) => {
      // If user clicked Cancel, or if the dialog was just an "Info" dialog (isNoChanges), stop here.
      if (!confirmed || isNoChanges) {
        return;
      }

      // User clicked "Confirm" - proceed with booking creation/update
      this.proceedWithBooking(raw);
    });
  }

  private proceedWithBooking(raw: any): void {
    // Extract only the branch code from the selected destination string
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
      freight: raw.freight,
      loading: raw.loadingCharge,
      loadingCharge: raw.lrCharge,
      sgst: raw.sgst,
      cgst: raw.cgst,
      igst: raw.igst,
      grandTotal: raw.grandTotal,
      companyCode: this.auth.companyCode,
      branchCode: this.auth.branchCode,
      employeeName: `${this.auth.currentUser?.firstName || ''} ${this.auth.currentUser?.lastName || ''}`.trim(),
      articleDetails,
    };

    this.loading = true;

    const apiCall$ = this.isEditMode
      ? this.bookingSvc.update(this.editLR, dto)
      : this.bookingSvc.create(dto);

    apiCall$.subscribe({
      next: (saved: any) => {
        this.loading = false;
        const msg = this.isEditMode
          ? `Booking updated! LR: ${saved.loadingReciept || this.editLR}`
          : `Booking created! LR: ${saved.loadingReciept}`;
        this.snack.success(msg);

        // Immediately refresh the LR number in the dashboard header
        this.branchSvc.notifyLrUpdated();

        // Open the enhanced receipt dialog with print/download options, styled for edit/create
        this.dialog.open(LrReceiptDialogComponent, {
          data: {
            booking: saved,
            isEditMode: this.isEditMode
          },
          width: '360px',
          maxWidth: '95vw',
          disableClose: false,
        }).afterClosed().subscribe(() => {
          this.resetForm();
        });
      },
      error: (e: any) => {
        this.loading = false;
        this.snack.error(e?.error?.message || 'Error saving booking. Please try again.');
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
