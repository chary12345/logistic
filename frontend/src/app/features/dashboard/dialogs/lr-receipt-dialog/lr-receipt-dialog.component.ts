import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../../../core/services/export.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';

@Component({
  selector: 'app-lr-receipt-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatDividerModule, MatRadioModule, MatCheckboxModule, FormsModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="success-header" [ngClass]="isEditMode ? 'update-theme' : 'create-theme'">
        <mat-icon class="success-icon">{{ isEditMode ? 'update' : 'check_circle' }}</mat-icon>
        <h2 mat-dialog-title>{{ isEditMode ? 'Booking Updated Successfully' : 'Booking Created Successfully' }}</h2>
      </div>

      <mat-dialog-content class="receipt-content">
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">LR Number</span>
            <span class="info-value">{{ booking.loadingReciept }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-status" [ngClass]="isEditMode ? 'text-teal' : 'text-green'">
              ✓ {{ isEditMode ? 'Booking updated successfully' : 'Booking saved successfully' }}
            </span>
          </div>
        </div>

        <div class="action-card">
          <div class="action-title">Receipt Options</div>
          <div class="checkbox-options">
            <label class="checkbox-wrapper">
              <mat-checkbox [(ngModel)]="shouldPrint" class="custom-checkbox"></mat-checkbox>
              <mat-icon class="option-icon">print</mat-icon>
              <span class="option-text">Print Receipt</span>
            </label>
            <label class="checkbox-wrapper">
              <mat-checkbox [(ngModel)]="shouldDownload" class="custom-checkbox"></mat-checkbox>
              <mat-icon class="option-icon">download</mat-icon>
              <span class="option-text">Download PDF</span>
            </label>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
          Close
        </button>
        <button mat-raised-button color="primary" (click)="execute()" class="proceed-btn">
          <mat-icon>check</mat-icon>
          Proceed
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      display: flex;
      flex-direction: column;
      min-width: 320px;
      max-width: 380px;
      overflow: hidden;
    }

    .success-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px 8px 0 0;
      color: white;

      &.create-theme { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
      &.update-theme { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); }

      .success-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }

      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0;
      }
    }

    .receipt-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f9fafb;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .info-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;

      .info-label {
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .info-value {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
        font-family: 'Monaco', 'Courier New', monospace;
        background: #f3f4f6;
        padding: 4px 8px;
        border-radius: 4px;
        letter-spacing: 0.5px;
      }

      .info-status {
        font-size: 12px;
        font-weight: 600;
        
        &.text-green { color: #10b981; }
        &.text-teal { color: #0d9488; }
      }
    }

    .action-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
    }

    .action-title {
      font-size: 11px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .checkbox-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f9fafb;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e5e7eb;

      &:hover {
        background: #f3f4f6;
        border-color: #0b5ed7;
      }

      .custom-checkbox {
        margin: 0;
      }

      .option-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #0b5ed7;
        flex-shrink: 0;
      }

      .option-text {
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        flex: 1;
      }
    }


    .dialog-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      border-radius: 0 0 6px 6px;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        font-weight: 500;
        font-size: 13px;
        padding: 6px 12px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .close-btn {
        color: #6b7280;
        flex: 1;
      }

      .proceed-btn {
        flex: 1;
        min-width: auto;
      }
    }

    @media (max-width: 520px) {
      .dialog-wrapper {
        min-width: auto;
        max-width: 100%;
      }

      .success-header {
        padding: 16px;
      }

      .receipt-content {
        padding: 16px;
        gap: 16px;
      }

      .dialog-actions {
        padding: 12px 16px;
        flex-wrap: wrap;

        button {
          flex: 1;
          min-width: 100px;
        }
      }
    }
  `]
})
export class LrReceiptDialogComponent {
  shouldPrint = false;
  shouldDownload = false;
  isProcessing = false;
  isEditMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { booking: any, isEditMode?: boolean },
    private dialogRef: MatDialogRef<LrReceiptDialogComponent>,
    private exportSvc: ExportService,
    private snackbar: SnackbarService,
  ) {
    this.isEditMode = !!data.isEditMode;
  }

  get booking() {
    return this.data.booking;
  }

  get pmClass(): string {
    const m: Record<string, string> = {
      'PAID': 'paid',
      'TO PAY': 'to-pay',
      'TBB': 'tbb'
    };
    return m[this.booking.billType] || '';
  }

  execute(): void {
    this.isProcessing = true;

    if (this.shouldPrint) {
      try {
        this.exportSvc.generateLRReceipt(this.booking, 'print');
      } catch (error) {
        this.snackbar.error('Failed to print receipt.');
      }
    }

    if (this.shouldDownload) {
      try {
        this.exportSvc.generateLRReceipt(this.booking, 'download');
      } catch (error) {
        this.snackbar.error('Failed to download receipt.');
      }
    }

    if (this.shouldPrint || this.shouldDownload) {
      this.snackbar.success('Receipt processed successfully!');
    }

    this.isProcessing = false;

    // Dismiss the dialog after processing
    this.dialogRef.close();
  }
}

