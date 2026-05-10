import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logout-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="confirm-header logout-theme">
        <mat-icon class="confirm-icon">power_settings_new</mat-icon>
        <h2 mat-dialog-title>Logout Confirmation</h2>
      </div>

      <mat-dialog-content class="confirm-content">
        <div class="logout-icon-container">
          <div class="icon-circle">
             <mat-icon>exit_to_app</mat-icon>
          </div>
        </div>
        <div class="confirm-message">
          <h3>Ready to Leave?</h3>
          <p>Are you sure you want to log out? You will need to log back in to access your workspace.</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="confirm-actions">
        <button mat-stroked-button [mat-dialog-close]="false" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Stay Signed In
        </button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true" class="confirm-btn">
          <mat-icon>logout</mat-icon>
          Yes, Logout
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      max-width: 480px;
      border-radius: 8px;
      overflow: hidden; /* Prevents internal scroll overlap */
    }

    ::ng-deep .logout-dialog-panel .mat-mdc-dialog-container {
      padding: 0 !important; /* Removes material wrapper baseline padding */
      overflow: hidden !important;
    }

    mat-dialog-content {
      overflow: hidden !important; /* Prevents micro-scrollbars */
      margin: 0 !important;
      padding: 0 !important;
    }

    .confirm-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 24px;
      color: white;
      background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%);

      .confirm-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    .confirm-content {
      padding: 32px 24px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      background: #ffffff;
      overflow: hidden !important; /* Force container confinement */
      max-height: none !important;
    }

    .logout-icon-container {
      .icon-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #fff1f2;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #fecdd3;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #e11d48;
        }
      }
    }

    .confirm-message {
      text-align: center;
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
      }
      p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
        line-height: 1.5;
      }
    }

    .confirm-actions {
      display: flex !important; /* Overwrite default layout constraints */
      gap: 12px;
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        height: 42px;
        border-radius: 6px;
        text-transform: none;
        flex: 1;
        white-space: nowrap; /* Force single line for all texts */

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .cancel-btn {
        color: #4b5563;
        border-color: #d1d5db;
      }
    }

    @media (max-width: 500px) {
      .dialog-wrapper {
        min-width: auto;
        width: 100%;
        max-width: 100%;
      }
      .confirm-actions {
        flex-direction: column-reverse;
        align-items: stretch !important; /* Force children to width 100% in column flow */
        padding: 20px 24px;
        gap: 12px;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class LogoutConfirmationDialogComponent {}
