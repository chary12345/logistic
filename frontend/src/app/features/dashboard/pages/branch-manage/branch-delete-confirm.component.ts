import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-branch-delete-confirm',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog-wrap">
      <!-- Icon header -->
      <div class="delete-dialog-icon">
        <div class="icon-circle danger">
          <mat-icon>delete_forever</mat-icon>
        </div>
      </div>

      <h2 class="delete-dialog-title" mat-dialog-title>Delete Branch</h2>

      <mat-dialog-content class="delete-dialog-body">
        <p class="warning-text">
          Are you sure you want to delete the selected branches? This action
          <strong>cannot be undone</strong> and will permanently remove all
          associated data.
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="delete-dialog-actions">
        <button mat-stroked-button (click)="dialogRef.close(false)" id="cancel-delete-btn">
          <mat-icon>close</mat-icon> Cancel
        </button>
        <button mat-raised-button color="warn" (click)="dialogRef.close(true)" id="confirm-delete-btn">
          <mat-icon>delete_forever</mat-icon> Yes, Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog-wrap {
      padding: 0;
    }

    .delete-dialog-icon {
      display: flex;
      justify-content: center;
      padding: 24px 24px 0;
    }

    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.danger {
        background: linear-gradient(135deg, #dc2626, #f87171);
      }

      mat-icon {
        color: #fff;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
    }

    .delete-dialog-title {
      font-size: 17px !important;
      font-weight: 700;
      color: var(--text-primary);
      text-align: center;
      margin: 12px 0 0;
      padding: 0 24px !important;
    }

    .delete-dialog-body {
      padding: 12px 24px 8px !important;
    }

    .warning-text {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0 0 14px;
      line-height: 1.6;

      strong {
        color: var(--danger);
      }
    }

    .delete-dialog-actions {
      padding: 12px 24px 20px !important;
      gap: 8px;

      button {
        font-size: 12px !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
      }
    }

    @media (max-width: 520px) {
      .delete-dialog-actions {
        flex-direction: column;
        align-items: stretch;

        button {
          width: 100%;
          height: 44px;
        }
      }
    }
  `]
})
export class BranchDeleteConfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<BranchDeleteConfirmComponent>
  ) {}
}
