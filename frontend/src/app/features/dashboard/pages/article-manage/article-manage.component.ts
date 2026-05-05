import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';

@Component({
  selector: 'app-article-manage',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-card">
      <h2 class="page-heading"><mat-icon>category</mat-icon> Article Type Management</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="article-form">
        <div class="form-grid">
          <mat-form-field class="small-field">
            <mat-label>Article Type</mat-label>
            <input matInput formControlName="articleType" placeholder="e.g. WOOD" class="text-uppercase">
            <mat-error *ngIf="form.get('articleType')?.hasError('required') && form.get('articleType')?.touched">Required</mat-error>
          </mat-form-field>
        </div>

        <div class="submit-row">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!loading">save</mat-icon>
            {{ loading ? 'Saving...' : 'Save Article Type' }}
          </button>
          <button mat-stroked-button type="button" (click)="reset()"><mat-icon>clear</mat-icon> Reset</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
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
    .article-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .small-field {
      max-width: 320px;
      width: 100%;
    }
    .text-uppercase {
      text-transform: uppercase;
    }
    .submit-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 8px;
    }
    @media (max-width: 520px) {
      .small-field {
        max-width: 100%;
      }
      .submit-row {
        flex-direction: column;
        align-items: stretch;
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ArticleManageComponent implements OnInit, OnDestroy {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  form = this.fb.group({
    articleType: ['', Validators.required]
  });

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private bookingSvc: BookingService,
    private snack: SnackbarService,
  ) { }

  ngOnInit(): void { }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    const payload = {
      articleType: this.form.value.articleType?.toUpperCase() || '',
      companyCode: this.auth.companyCode
    };

    this.bookingSvc.createArticleType(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.snack.success(res?.message || 'Article Type Created Successfully');
          this.reset();
        },
        error: (err) => {
          this.loading = false;
          this.snack.error(err?.error?.message || 'Failed to create article type.');
        }
      });
  }

  reset(): void {
    this.formDirective?.resetForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
