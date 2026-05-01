import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, startWith } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { BranchService } from '../../../../core/services/branch.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { PaymentMode } from '../../../../core/services/payment-mode.service';

const ARTICLE_TYPES = [
  'Auto Parts', 'Electronics', 'Garments', 'Furniture', 'Food Items',
  'Chemicals', 'Machinery', 'Textiles', 'Documents', 'Other'
];

const ARTICLE_OPTIONS = ['Article', 'Weight', 'Fix'];

@Component({
  selector: 'app-edit-booking-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule, MatTooltipModule
  ],
  templateUrl: './edit-booking-dialog.component.html',
  styleUrls: ['./edit-booking-dialog.component.scss']
})
export class EditBookingDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  paymentMode: PaymentMode = 'TO PAY';
  loading = false;
  loadingData = true;
  saving = false;

  destinationSuggestions: string[] = [];
  filteredDestinations: string[] = [];
  destinationFilterCtrl = new FormControl('');

  saidToContainsList: string[] = [];
  filteredSaidToContains: string[] = [];
  stcFilterCtrl = new FormControl('');

  articleTypes = ARTICLE_TYPES;
  filteredArticleTypes: string[] = ARTICLE_TYPES;
  typeFilterCtrl = new FormControl('');

  filteredArticleOptions: string[] = ARTICLE_OPTIONS;
  articleFilterCtrl = new FormControl('');

  booking: any = null;

  private destroy$ = new Subject<void>();

  get articles(): FormArray {
    return this.form.get('articles') as FormArray;
  }

  get showPaidVia(): boolean {
    return this.paymentMode === 'PAID';
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private bookingSvc: BookingService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
    private dialogRef: MatDialogRef<EditBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lr: string }
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranchDestinations();
    this.loadSaidToContains();

    // Destination filter
    this.destinationFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterDestinations(value || '');
    });

    // Said To Contain filter
    this.stcFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterSaidToContains(value || '');
    });

    // Type filter
    this.typeFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      const search = (value || '').toLowerCase().trim();
      this.filteredArticleTypes = ARTICLE_TYPES.filter(t => t.toLowerCase().includes(search));
    });

    // Article filter
    this.articleFilterCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      const search = (value || '').toLowerCase().trim();
      this.filteredArticleOptions = ARTICLE_OPTIONS.filter(a => a.toLowerCase().includes(search));
    });

    // Load booking data
    this.loadBookingData();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      deliveryDestination: ['', Validators.required],
      consignorName: ['', Validators.required],
      consignorMobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      consignorGST: [''],
      consignorAddress: ['', Validators.required],
      consigneeName: ['', Validators.required],
      consigneeMobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      consigneeGST: [''],
      consigneeAddress: ['', Validators.required],
      invoiceNo: [''],
      invoiceValue: [null],
      ewayBill: [''],
      paidVia: ['CASH'],
      loadingCharge: [0, [Validators.min(0)]],
      lrCharge: [0, [Validators.min(0)]],
      freight: [{ value: 0, disabled: true }],
      sgst: [{ value: 0, disabled: true }],
      cgst: [{ value: 0, disabled: true }],
      igst: [{ value: 0, disabled: true }],
      grandTotal: [{ value: 0, disabled: true }],
      articles: this.fb.array([this.makeArticleRow()]),
    });

    // Watch for charge changes
    ['loadingCharge', 'lrCharge'].forEach(f => {
      this.form.get(f)?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.recalcCharges());
    });
  }

  private loadBookingData(): void {
    this.loadingData = true;
    this.bookingSvc.searchByLR(this.data.lr).pipe(takeUntil(this.destroy$)).subscribe({
      next: (booking: any) => {
        this.loadingData = false;
        if (!booking) {
          this.snack.error('Booking not found.');
          this.dialogRef.close();
          return;
        }

        this.booking = booking;

        // Set payment mode
        if (booking.billType) {
          this.paymentMode = booking.billType as PaymentMode;
        }

        // Find the full destination string that matches the branch code
        const destCode = booking.destinationBranchCode;
        const matchingDest = this.destinationSuggestions.find(d => d.includes(`(${destCode})`));

        // Patch form values
        this.form.patchValue({
          deliveryDestination: matchingDest || destCode,
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

        // Rebuild articles
        while (this.articles.length > 0) this.articles.removeAt(0);
        const articleDetails = booking.articleDetails || [];
        if (articleDetails.length > 0) {
          articleDetails.forEach((a: any) => {
            const qty = +(a.artQty) || 1;
            const amt = +(a.artAmt) || 0;
            this.articles.push(this.fb.group({
              article: [a.article || null],
              artQuantity: [qty, [Validators.min(0)]],
              artType: [a.artType || null],
              saidToContain: [a.saidToContain || null],
              artAmount: [amt, [Validators.min(0)]],
              total: [{ value: qty * amt, disabled: true }],
            }));
          });
        } else {
          this.articles.push(this.makeArticleRow());
        }

        // Reset search filters
        this.stcFilterCtrl.setValue('', { emitEvent: false });
        this.typeFilterCtrl.setValue('', { emitEvent: false });
        this.articleFilterCtrl.setValue('', { emitEvent: false });
        this.filteredSaidToContains = this.saidToContainsList.length ? [...this.saidToContainsList] : [];
        this.filteredArticleTypes = [...ARTICLE_TYPES];
        this.filteredArticleOptions = [...ARTICLE_OPTIONS];

        this.recalcCharges();
      },
      error: () => {
        this.loadingData = false;
        this.snack.error('Failed to load booking.');
        this.dialogRef.close();
      }
    });
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
              .filter(b => b.branchCode !== myBranch)
              .map(b => `${b.branchName} (${b.branchCode})`);
            this.filterDestinations('');

            // If booking is already loaded, try to match destination
            if (this.booking) {
              const destCode = this.booking.destinationBranchCode;
              const matchingDest = this.destinationSuggestions.find(d => d.includes(`(${destCode})`));
              if (matchingDest) {
                this.form.patchValue({ deliveryDestination: matchingDest });
              }
            }
          }
        },
        error: () => {}
      });
  }

  private loadSaidToContains(): void {
    const cc = this.auth.companyCode;
    if (!cc) return;

    const defaults = ['Cartons', 'Boxes', 'Bags', 'Bundles', 'Rolls', 'Cases', 'Crates', 'Pallets', 'Pieces', 'Drums'];

    this.bookingSvc.getSaidToContains(cc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
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

  private filterDestinations(val: string): void {
    const search = val.toLowerCase();
    this.filteredDestinations = this.destinationSuggestions.filter(d =>
      d.toLowerCase().includes(search)
    );
  }

  private filterSaidToContains(val: string): void {
    const search = val.toLowerCase();
    this.filteredSaidToContains = this.saidToContainsList.filter(s =>
      s.toLowerCase().includes(search)
    );
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

  addArticle(): void {
    this.articles.push(this.makeArticleRow());
  }

  removeArticle(i: number): void {
    if (this.articles.length > 1) this.articles.removeAt(i);
  }

  onArticleChange(i: number): void {
    const row = this.articles.at(i);
    const qty = +row.get('artQuantity')?.value || 0;
    const amt = +row.get('artAmount')?.value || 0;
    row.patchValue({ total: qty * amt }, { emitEvent: false });
    this.recalcCharges();
  }

  recalcCharges(): void {
    const freight = this.articles.controls.reduce((sum, row) => {
      return sum + (+row.get('artQuantity')?.value || 0) * (+row.get('artAmount')?.value || 0);
    }, 0);
    const loading = +this.form.get('loadingCharge')?.value || 0;
    const lr = +this.form.get('lrCharge')?.value || 0;
    const base = freight + loading + lr;
    const sgst = base * 0.025;
    const cgst = base * 0.025;
    const igst = base * 0.05;
    this.form.patchValue({
      freight,
      sgst: +sgst.toFixed(2),
      cgst: +cgst.toFixed(2),
      igst: +igst.toFixed(2),
      grandTotal: +(base + sgst + cgst).toFixed(2),
    }, { emitEvent: false });
  }

  setPaymentMode(mode: PaymentMode): void {
    this.paymentMode = mode;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.warning('Please fill all required fields.');
      return;
    }

    this.recalcCharges();
    const raw = this.form.getRawValue();

    // Extract only the branch code from the selected destination
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
      consignorName: raw.consignorName,
      consignorMobile: raw.consignorMobile,
      consignorGST: raw.consignorGST,
      consignorAddress: raw.consignorAddress,
      consigneeName: raw.consigneeName,
      consigneeMobile: raw.consigneeMobile,
      consigneeGST: raw.consigneeGST,
      consigneeAddress: raw.consigneeAddress,
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

    this.saving = true;
    this.bookingSvc.update(this.data.lr, dto).subscribe({
      next: (saved: any) => {
        this.saving = false;
        this.snack.success(`Booking updated! LR: ${saved.loadingReciept || this.data.lr}`);
        this.dialogRef.close({ success: true, booking: saved });
      },
      error: (e: any) => {
        this.saving = false;
        this.snack.error(e?.error?.message || 'Error updating booking.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
