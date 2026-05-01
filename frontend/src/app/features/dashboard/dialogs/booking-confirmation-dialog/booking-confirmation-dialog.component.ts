import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-booking-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="confirm-header" [ngClass]="headerClass">
        <mat-icon class="confirm-icon">{{ iconName }}</mat-icon>
        <h2 mat-dialog-title>{{ title }}</h2>
      </div>

      <mat-dialog-content class="confirm-content">
        <div class="confirm-message">
          <p>{{ message }}</p>
        </div>

        <div class="amount-display" *ngIf="!isNoChanges">
          <div class="amount-label">Grand Total</div>
          <div class="amount-value" [ngClass]="textClass">₹{{ grandTotal | number:'1.2-2' }}</div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="confirm-actions">
        <button mat-stroked-button [mat-dialog-close]="false" class="cancel-btn">
          <mat-icon>{{ isNoChanges ? 'check' : 'close' }}</mat-icon>
          {{ isNoChanges ? 'Ok' : 'Cancel' }}
        </button>
        <button *ngIf="!isNoChanges" mat-raised-button [color]="btnColor" [mat-dialog-close]="true" class="confirm-btn">
          <mat-icon>check</mat-icon>
          Confirm
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      display: flex;
      flex-direction: column;
      min-width: 380px;
      max-width: 500px;
    }

    .confirm-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      color: white;

      &.create-theme { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); }
      &.update-theme { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); }
      &.info-theme { background: linear-gradient(135deg, #6b7280 0%, #374151 100%); }

      .confirm-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0;
      }
    }

    .confirm-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #f9fafb;
    }

    .confirm-message {
      text-align: center;

      p {
        margin: 0;
        font-size: 14px;
        color: #4b5563;
        line-height: 1.5;
        font-weight: 500;
      }
    }

    .amount-display {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0, 0.05);

      .amount-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .amount-value {
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -1px;
        font-family: 'Monaco', 'Courier New', monospace;
        
        &.create-text { color: #3b82f6; }
        &.update-text { color: #d97706; }
      }
    }

    .confirm-actions {
      display: flex;
      gap: 12px;
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      border-radius: 0 0 8px 8px;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        flex: 1;
        justify-content: center;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .cancel-btn {
        color: #4b5563;
      }

      .confirm-btn {
        min-width: 140px;
      }
    }

    @media (max-width: 520px) {
      .dialog-wrapper {
        min-width: auto;
        max-width: 100%;
      }

      .confirm-header {
        padding: 16px;

        h2 {
          font-size: 16px;
        }
      }

      .confirm-content {
        padding: 16px;
        gap: 16px;
      }

      .amount-display {
        padding: 16px;

        .amount-value {
          font-size: 28px;
        }
      }

      .confirm-actions {
        padding: 12px 16px;
        flex-direction: column-reverse;

        button {
          min-width: auto;
        }
      }
    }
  `]
})
export class BookingConfirmationDialogComponent {
  grandTotal: number;
  isEditMode: boolean;
  isNoChanges: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { grandTotal: number, isEditMode?: boolean, isNoChanges?: boolean }) {
    this.grandTotal = data.grandTotal;
    this.isEditMode = !!data.isEditMode;
    this.isNoChanges = !!data.isNoChanges;
  }

  get headerClass(): string {
    if (this.isNoChanges) return 'info-theme';
    return this.isEditMode ? 'update-theme' : 'create-theme';
  }

  get textClass(): string {
    return this.isEditMode ? 'update-text' : 'create-text';
  }

  get iconName(): string {
    if (this.isNoChanges) return 'info';
    return this.isEditMode ? 'edit_note' : 'add_circle_outline';
  }

  get title(): string {
    if (this.isNoChanges) return 'No Changes Detected';
    return this.isEditMode ? 'Confirm Update' : 'Confirm Booking';
  }

  get message(): string {
    if (this.isNoChanges) return 'You have not modified any booking details. Please make changes before updating.';
    return this.isEditMode 
      ? 'Please confirm to update this existing booking.' 
      : 'Please confirm to create this new booking.';
  }

  get btnColor(): string {
    return this.isEditMode ? 'accent' : 'primary';
  }
}
