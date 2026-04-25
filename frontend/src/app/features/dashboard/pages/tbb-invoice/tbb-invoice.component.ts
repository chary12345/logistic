import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactService } from '../../../../core/services/contact.service';
import { StatementService } from '../../../../core/services/statement.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Contact } from '../../../../shared/models/models';

@Component({
  selector: 'app-tbb-invoice',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatAutocompleteModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>receipt_long</mat-icon> TBB Invoice</h2>

      <form [formGroup]="form" class="filter-row" (ngSubmit)="generateInvoice()">
        <!-- Consignor AutoComplete -->
        <mat-form-field appearance="outline">
          <mat-label>Consignor Name</mat-label>
          <input matInput type="text" formControlName="consignorName" [matAutocomplete]="cnsgnrAuto" placeholder="Type to search...">
          <mat-autocomplete #cnsgnrAuto="matAutocomplete">
            <mat-option *ngFor="let c of consignorSuggestions" [value]="c.name">
              {{ c.name }} ({{ c.mobile }})
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>

        <!-- Month Dropdown -->
        <mat-form-field appearance="outline">
          <mat-label>Select Month</mat-label>
          <mat-select formControlName="monthIndex">
            <mat-option *ngFor="let m of monthsList; let i = index" [value]="i">
              {{ m.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Submit Button -->
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
          <mat-icon>search</mat-icon> Generate
        </button>
      </form>

      <!-- Loading Indicator -->
      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Results Data -->
      <div class="results-container" *ngIf="statementData && !loading">
        <div class="invoice-summary-card">
          <div class="summary-header">
            <h3>Invoice Summary for {{ statementData.consignorName }}</h3>
          </div>
          <div class="summary-grid">
            <div class="stat-box">
              <span class="stat-label">Total LRs</span>
              <span class="stat-value">{{ statementData.totalLrs }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Total Freight</span>
              <span class="stat-value">₹{{ statementData.totalFreight | number:'1.2-2' }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Loading Charges</span>
              <span class="stat-value">₹{{ statementData.totalLoadingCharge | number:'1.2-2' }}</span>
            </div>
            <div class="stat-box highlight">
              <span class="stat-label">Grand Total</span>
              <span class="stat-value">₹{{ statementData.grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!statementData && !loading && hasSearched">
        <mat-icon>info</mat-icon>
        <p>No records found for the selected consignor and month.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .page-heading {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1f36;
      display: flex;
      align-items: center;
      gap: 12px;
      
      mat-icon { color: var(--primary); }
    }
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      
      mat-form-field {
        flex: 1;
        min-width: 200px;
        max-width: 280px;

        ::ng-deep .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }
      }
      button {
        height: 40px;
        border-radius: 8px;
        padding: 0 20px;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0.3px;
        margin-top: 0;
      }
    }
    .loading-shade {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .invoice-summary-card {
      margin-top: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;

      .summary-header {
        background: #fff;
        padding: 16px 24px;
        border-bottom: 1px solid #e2e8f0;
        h3 {
          margin: 0;
          font-size: 18px;
          color: #1e293b;
        }
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1px;
        background: #e2e8f0;

        .stat-box {
          background: #f8fafc;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;

          &.highlight {
            background: #fff;
            .stat-value { color: var(--primary); }
          }

          .stat-label {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 600;
          }
          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
          }
        }
      }
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #64748b;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #cbd5e1;
      }
      p { margin: 0; font-size: 16px; }
    }
    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
        align-items: stretch;

        mat-form-field { max-width: 100%; }
        button { width: 100%; margin-top: 0; height: 48px; font-size: 14px !important; }
      }
      .invoice-summary-card .summary-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class TbbInvoiceComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  monthsList: { label: string; fromDate: Date; toDate: Date }[] = [];
  consignorSuggestions: Contact[] = [];
  loading = false;
  hasSearched = false;
  statementData: any = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private contactSvc: ContactService,
    private statementSvc: StatementService,
    private auth: AuthService,
    private snack: SnackbarService
  ) {
    this.generateMonthsList();
  }

  ngOnInit() {
    this.form = this.fb.group({
      consignorName: ['', Validators.required],
      monthIndex: [0, Validators.required] // Default to the first (most recent) month
    });

    this.form.get('consignorName')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(val => {
        if (typeof val === 'string') this.searchConsignor(val);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateMonthsList() {
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      // Go back i months
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      // Find the first and last day of that month
      const fromDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const toDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Format month name and year (e.g., "March 2026")
      const label = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      this.monthsList.push({ label, fromDate, toDate });
    }
  }

  searchConsignor(q: string) {
    if (!q || q.length < 2) { this.consignorSuggestions = []; return; }
    this.contactSvc.search('consignor', q, this.auth.branchCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.consignorSuggestions = res,
        error: () => this.consignorSuggestions = []
      });
  }

  /**
   * Helper to format Date to ISO String using local time
   */
  private toISOLocal(d: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return d.getFullYear() + '-' +
      pad(d.getMonth() + 1) + '-' +
      pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' +
      pad(d.getMinutes()) + ':' +
      pad(d.getSeconds()) + '.' +
      String(d.getMilliseconds()).padStart(3, '0');
  }

  generateInvoice() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { consignorName, monthIndex } = this.form.value;
    const selectedMonth = this.monthsList[monthIndex];

    const payload = {
      consignorName: consignorName,
      fromDate: this.toISOLocal(selectedMonth.fromDate),
      toDate: this.toISOLocal(selectedMonth.toDate)
    };

    this.loading = true;
    this.hasSearched = true;
    this.statementData = null;

    this.statementSvc.getTbbStatement(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          // Check if totalLrs > 0 or if backend just returns 0s. 
          // If 0, we can show empty state or just show the 0 values.
          if (res && res.totalLrs > 0) {
            this.statementData = res;
          } else {
            // Treat 0 LRs as "No records found"
            this.statementData = null;
          }
        },
        error: (err) => {
          this.loading = false;
          this.snack.error('Failed to generate TBB invoice.');
        }
      });
  }
}
