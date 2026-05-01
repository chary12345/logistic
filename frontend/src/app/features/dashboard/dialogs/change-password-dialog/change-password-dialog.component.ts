import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginApiService } from '../../../../core/services/login-api.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import * as CryptoJS from 'crypto-js';
import { passwordStrengthValidator, PASSWORD_REQUIREMENTS_TEXT, PASSWORD_REQUIREMENTS_SHORT } from '../../../../shared/validators/password.validator';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPw  = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { mismatch: true } : null;
}

const AES_KEY = '1234567890123456';
const AES_IV  = 'abcdefghijklmnop';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatDividerModule, MatTooltipModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-icon-header">
        <div class="icon-circle">
          <mat-icon>lock_reset</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>Change Password</h2>
          <p class="dialog-subtitle">Update your account password</p>
        </div>
      </div>

      <mat-divider></mat-divider>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="pw-form" autocomplete="off">

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Current Password</mat-label>
            <input matInput
                   [type]="showCurrent ? 'text' : 'password'"
                   formControlName="currentPassword"
                   autocomplete="current-password">
            <button mat-icon-button matSuffix type="button"
                    (click)="showCurrent = !showCurrent"
                    [attr.aria-label]="showCurrent ? 'Hide password' : 'Show password'">
              <mat-icon>{{ showCurrent ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('currentPassword')?.hasError('required')">Current password is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>New Password</mat-label>
            <input matInput
                   [type]="showNew ? 'text' : 'password'"
                   formControlName="newPassword"
                   autocomplete="new-password">
            <span matSuffix class="suffix-icons">
              <button mat-icon-button type="button"
                      [matTooltip]="PASSWORD_REQUIREMENTS_TEXT"
                      matTooltipPosition="above"
                      [attr.aria-label]="'Password requirements'">
                <mat-icon color="primary">info</mat-icon>
              </button>
              <button mat-icon-button type="button"
                      (click)="showNew = !showNew"
                      [attr.aria-label]="showNew ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </span>
            <mat-hint>{{ PASSWORD_REQUIREMENTS_SHORT }}</mat-hint>
            <mat-error *ngIf="form.get('newPassword')?.hasError('required')">New password is required</mat-error>
            <mat-error *ngIf="form.get('newPassword')?.hasError('weakPassword')">
              {{ PASSWORD_REQUIREMENTS_TEXT }}
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Confirm New Password</mat-label>
            <input matInput
                   [type]="showConfirm ? 'text' : 'password'"
                   formControlName="confirmPassword"
                   autocomplete="new-password">
            <button mat-icon-button matSuffix type="button"
                    (click)="showConfirm = !showConfirm">
              <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.hasError('mismatch') && form.get('confirmPassword')?.touched">
              Passwords do not match
            </mat-error>
          </mat-form-field>

          <div class="error-banner" *ngIf="errorMsg" role="alert">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMsg }}</span>
          </div>

        </form>
      </mat-dialog-content>

      <mat-divider></mat-divider>

      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button mat-dialog-close type="button" form="no-form" class="cancel-btn">
          Cancel
        </button>
        <button mat-raised-button color="primary" type="button"
                (click)="submit()" [disabled]="loading || form.invalid" class="save-btn">
          <mat-spinner *ngIf="loading" diameter="16" class="btn-spinner"></mat-spinner>
          <mat-icon *ngIf="!loading">save</mat-icon>
          {{ loading ? 'Saving...' : 'Update Password' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      display: flex;
      flex-direction: column;
    }

    .dialog-icon-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px 12px;
    }

    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0b5ed7, #0097d7);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #fff; font-size: 20px; }
    }

    h2[mat-dialog-title] {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
    }

    .dialog-subtitle {
      margin: 2px 0 0;
      font-size: 11px;
      color: #5c6780;
    }

    .dialog-content {
      padding: 16px 20px !important;
      max-height: 60vh;
      overflow-y: auto;
    }

    .pw-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 100%;
      max-width: 100%;
    }

    .suffix-icons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 6px;
      padding: 8px 12px;
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
      mat-icon { font-size: 16px; flex-shrink: 0; }
    }

    .dialog-actions {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 8px !important;
      padding: 10px 20px 14px !important;
    }

    .cancel-btn { min-width: 80px; flex: 1; }

    .save-btn {
      min-width: 130px;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
      mat-icon { font-size: 16px; }
    }

    .btn-spinner { display: inline-block; }
  `]
})
export class ChangePasswordDialogComponent {
  PASSWORD_REQUIREMENTS_TEXT = PASSWORD_REQUIREMENTS_TEXT;
  PASSWORD_REQUIREMENTS_SHORT = PASSWORD_REQUIREMENTS_SHORT;

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  loading     = false;
  errorMsg    = '';
  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  constructor(
    private fb:        FormBuilder,
    private loginSvc:  LoginApiService,
    private auth:      AuthService,
    private snack:     SnackbarService,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>
  ) {}

  private encryptPassword(plain: string): string {
    const key = CryptoJS.enc.Utf8.parse(AES_KEY);
    const iv  = CryptoJS.enc.Utf8.parse(AES_IV);
    return CryptoJS.AES.encrypt(plain, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  submit(): void {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const { currentPassword, newPassword } = this.form.value;
    
    this.loginSvc.changePassword({
      username: this.auth.currentUser?.userName || '',
      currentPassword: this.encryptPassword(currentPassword!),
      newPassword: this.encryptPassword(newPassword!),
      group: this.auth.companyCode,
    }).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.snack.success('Password changed successfully!');
          this.dialogRef.close(true);
        } else {
          this.errorMsg = r.message || 'Failed to change password.';
        }
      },
      error: (e: any) => {
        this.loading = false;
        this.errorMsg = e?.error?.message || 'Error changing password. Please try again.';
      }
    });
  }
}
