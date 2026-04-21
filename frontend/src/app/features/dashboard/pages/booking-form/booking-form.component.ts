import {
  Component, OnInit, OnDestroy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { LrReceiptDialogComponent } from '../../dialogs/lr-receipt-dialog/lr-receipt-dialog.component';
import { ArticleDetailDto, BookingDTO, Contact } from '../../../../shared/models/models';

const ARTICLE_TYPES = [
  'Auto Parts','Electronics','Garments','Furniture','Food Items',
  'Chemicals','Machinery','Textiles','Documents','Other'
];

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

  form!: FormGroup;
  paymentMode: PaymentMode = 'TO PAY';
  loading         = false;
  loadingBooking  = false;
  isEditMode      = false;
  editLR          = '';
  saidToContainsList: string[] = [];
  consignorSuggestions: Contact[] = [];
  consigneeSuggestions: Contact[] = [];
  destinationSuggestions: string[] = [];
  filteredDestinations: string[] = [];
  destinationFilterCtrl = new FormControl('');
  stcFilterCtrl = new FormControl('');
  filteredSaidToContains: string[] = [];
  articleTypes    = ARTICLE_TYPES;
  nextLR          = '';

  private destroy$ = new Subject<void>();

  get articles(): FormArray { return this.form.get('articles') as FormArray; }
  get showPaidVia(): boolean { return this.paymentMode === 'PAID'; }

  constructor(
    private fb:             FormBuilder,
    private route:          ActivatedRoute,
    private auth:           AuthService,
    private bookingSvc:     BookingService,
    private contactSvc:     ContactService,
    private branchSvc:      BranchService,
    private snack:          SnackbarService,
    private dialog:         MatDialog,
    private paymentModeSvc: PaymentModeService,
  ) {}

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

    // Subscribe to payment mode changes from dashboard header
    this.paymentModeSvc.getPaymentMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.paymentMode = mode;
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
      consignorName:    ['', Validators.required],
      consignorMobile:  ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      consignorGST:     [''],
      consignorAddress: ['', Validators.required],
      consigneeName:    ['', Validators.required],
      consigneeMobile:  ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      consigneeGST:     [''],
      consigneeAddress: ['', Validators.required],
      invoiceNo:        [''],
      invoiceValue:     [null],
      ewayBill:         [''],
      paidVia:          ['CASH'],
      loadingCharge:    [0, [Validators.min(0)]],
      lrCharge:         [0, [Validators.min(0)]],
      // Calculated (readonly)
      freight:          [{ value: 0, disabled: true }],
      sgst:             [{ value: 0, disabled: true }],
      cgst:             [{ value: 0, disabled: true }],
      igst:             [{ value: 0, disabled: true }],
      grandTotal:       [{ value: 0, disabled: true }],
      articles: this.fb.array([this.makeArticleRow()]),
    });
  }

  private loadBookingForEdit(lr: string): void {
    this.loadingBooking = true;
    this.bookingSvc.searchByLR(lr).pipe(takeUntil(this.destroy$)).subscribe({
      next: (booking: any) => {
        this.loadingBooking = false;
        if (!booking) { this.snack.error('Booking not found.'); return; }

        // Set payment mode (backend returns billType)
        if (booking.billType) {
          this.paymentMode = booking.billType as PaymentMode;
        }

        // Patch main fields (map backend field names to form controls)
        this.form.patchValue({
          deliveryDestination: booking.destinationBranchCode,
          consignorName:       booking.consignorName,
          consignorMobile:     booking.consignorMobile,
          consignorAddress:    booking.consignorAddress,
          consigneeName:       booking.consigneeName,
          consigneeMobile:     booking.consigneeMobile,
          consigneeAddress:    booking.consigneeAddress,
          invoiceNo:           booking.invoiceNumber,
          invoiceValue:        booking.invoiceValue,
          ewayBill:            booking.eWayBillNumber,
          paidVia:             booking.paidVia || 'CASH',
          loadingCharge:       booking.loading || 0,
          lrCharge:            booking.loadingCharge || 0,
        });

        // Rebuild articles (backend uses artQty/artAmt as strings)
        while (this.articles.length > 0) this.articles.removeAt(0);
        const articleDetails = booking.articleDetails || [];
        if (articleDetails.length > 0) {
          articleDetails.forEach((a: any) => {
            const qty = +(a.artQty) || 1;
            const amt = +(a.artAmt) || 0;
            this.articles.push(this.fb.group({
              article:       [a.article || 'Article'],
              artQuantity:   [qty, [Validators.min(0)]],
              artType:       [a.artType || 'Auto Parts'],
              saidToContain: [a.saidToContain || ''],
              artAmount:     [amt, [Validators.min(0)]],
              total:         [{ value: qty * amt, disabled: true }],
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
      article:       ['Article'],
      artQuantity:   [1, [Validators.min(0)]],
      artType:       ['Auto Parts'],
      saidToContain: [''],
      artAmount:     [0, [Validators.min(0)]],
      total:         [{ value: 0, disabled: true }],
    });
  }

  addArticle(): void { this.articles.push(this.makeArticleRow()); }
  removeArticle(i: number): void { if (this.articles.length > 1) this.articles.removeAt(i); }

  onArticleChange(i: number): void {
    const row = this.articles.at(i);
    const qty = +row.get('artQuantity')?.value || 0;
    const amt = +row.get('artAmount')?.value   || 0;
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
    const lr      = +this.form.get('lrCharge')?.value      || 0;
    const base    = freight + loading + lr;
    const sgst    = base * 0.025;
    const cgst    = base * 0.025;
    const igst    = base * 0.05;
    this.form.patchValue({
      freight,
      sgst:       +sgst.toFixed(2),
      cgst:       +cgst.toFixed(2),
      igst:       +igst.toFixed(2),
      grandTotal: +(base + sgst + cgst).toFixed(2),
    }, { emitEvent: false });
  }

  setPaymentMode(mode: PaymentMode): void {
    this.paymentMode = mode;
    this.paymentModeSvc.setPaymentMode(mode);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'F7') { e.preventDefault(); this.setPaymentMode('PAID'); }
    else if (e.key === 'F8') { e.preventDefault(); this.setPaymentMode('TO PAY'); }
    else if (e.key === 'F9') { e.preventDefault(); this.setPaymentMode('TBB'); }
  }

  private loadSaidToContains(): void {
    const cc = this.auth.companyCode;
    if (!cc) return;
    this.bookingSvc.getSaidToContains(cc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: list => { this.saidToContainsList = list; this.filterSaidToContains(''); }, error: () => {} });
  }

  private filterSaidToContains(val: string): void {
    const search = val.toLowerCase();
    this.filteredSaidToContains = this.saidToContainsList.filter(s =>
      s.toLowerCase().includes(search)
    );
  }

  private loadNextLR(): void {
    const bc = this.auth.branchCode;
    if (!bc) return;
    this.branchSvc.getNextLR(bc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: lr => this.nextLR = lr, error: () => {} });
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
        error: () => {}
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
      .subscribe({ next: r => this.consignorSuggestions = r, error: () => {} });
  }

  fillConsignor(c: Contact): void {
    this.form.patchValue({
      consignorName: c.name, consignorMobile: c.mobile,
      consignorGST: c.gst, consignorAddress: c.address,
    });
    this.consignorSuggestions = [];
  }

  searchConsignee(q: string): void {
    if (!q || q.length < 2) { this.consigneeSuggestions = []; return; }
    this.contactSvc.search('consignee', q, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.consigneeSuggestions = r, error: () => {} });
  }

  fillConsignee(c: Contact): void {
    this.form.patchValue({
      consigneeName: c.name, consigneeMobile: c.mobile,
      consigneeGST: c.gst, consigneeAddress: c.address,
    });
    this.consigneeSuggestions = [];
  }

  resetForm(): void {
    this.form.reset({ loadingCharge: 0, lrCharge: 0, paidVia: 'CASH' });
    while (this.articles.length > 1) this.articles.removeAt(1);
    this.articles.at(0).reset({ article: 'Article', artQuantity: 1, artType: 'Auto Parts', artAmount: 0 });
    this.paymentMode = 'TO PAY';
    this.isEditMode  = false;
    this.editLR      = '';
    this.destinationFilterCtrl.setValue('');
    this.loadNextLR();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.warning('Please fill all required fields.');
      return;
    }
    this.recalcCharges();


    const raw = this.form.getRawValue();
    // Extract only the branch code from the selected destination string
    let branchCodeOnly = raw.deliveryDestination;
    if (branchCodeOnly && branchCodeOnly.includes('(') && branchCodeOnly.includes(')')) {
      branchCodeOnly = branchCodeOnly.substring(branchCodeOnly.indexOf('(') + 1, branchCodeOnly.indexOf(')'));
    }

    const articleDetails = raw.articles.map((a: any) => ({
      article:       a.article,
      artQty:        String(a.artQuantity),
      artType:       a.artType,
      saidToContain: a.saidToContain,
      artAmt:        String(a.artAmount),
      total:         String(+a.artQuantity * +a.artAmount),
      companyCode:   this.auth.companyCode,
    }));

    const dto: any = {
      billType:              this.paymentMode,
      paidVia:               this.showPaidVia ? raw.paidVia : undefined,
      destinationBranchCode: branchCodeOnly,
      consignorName:         raw.consignorName,
      consignorMobile:       raw.consignorMobile,
      consignorAddress:      raw.consignorAddress,
      consigneeName:         raw.consigneeName,
      consigneeMobile:       raw.consigneeMobile,
      consigneeAddress:      raw.consigneeAddress,
      invoiceNumber:         raw.invoiceNo,
      invoiceValue:          raw.invoiceValue,
      eWayBillNumber:        raw.ewayBill,
      freight:               raw.freight,
      loading:               raw.loadingCharge,
      loadingCharge:         raw.lrCharge,
      sgst:                  raw.sgst,
      cgst:                  raw.cgst,
      igst:                  raw.igst,
      grandTotal:            raw.grandTotal,
      companyCode:           this.auth.companyCode,
      branchCode:            this.auth.branchCode,
      employeeName:          `${this.auth.currentUser?.firstName || ''} ${this.auth.currentUser?.lastName || ''}`.trim(),
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
        this.dialog.open(LrReceiptDialogComponent, {
          data: { booking: saved },
          width: '700px', maxWidth: '95vw',
        }).afterClosed().subscribe(() => this.resetForm());
      },
      error: (e: any) => {
        this.loading = false;
        this.snack.error(e?.error?.message || 'Error saving booking. Please try again.');
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
