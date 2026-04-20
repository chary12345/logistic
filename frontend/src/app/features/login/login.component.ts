import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as CryptoJS from 'crypto-js';
import { AuthService } from '../../core/auth/auth.service';
import { LoginApiService } from '../../core/services/login-api.service';
import { SnackbarService } from '../../core/services/snackbar.service';

const AES_KEY = '1234567890123456';
const AES_IV  = 'abcdefghijklmnop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form = this.fb.group({
    username:     ['', Validators.required],
    password:     ['', Validators.required],
    group:        ['', Validators.required],
    captchaInput: ['', Validators.required],
  });

  captchaText  = '';
  loading      = false;
  errorMsg     = '';
  hidePassword = true;

  constructor(
    private fb:      FormBuilder,
    private loginSvc: LoginApiService,
    private auth:    AuthService,
    private router:  Router,
    private snack:   SnackbarService,
  ) {}

  ngOnInit(): void { this.generateCaptcha(); }

  generateCaptcha(): void {
    this.captchaText = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private encryptPassword(plain: string): string {
    const key = CryptoJS.enc.Utf8.parse(AES_KEY);
    const iv  = CryptoJS.enc.Utf8.parse(AES_IV);
    return CryptoJS.AES.encrypt(plain, key, {
      iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { username, password, group, captchaInput } = this.form.value;

    if (captchaInput?.toUpperCase() !== this.captchaText) {
      this.errorMsg = 'Captcha is incorrect. Please try again.';
      this.generateCaptcha();
      this.form.patchValue({ captchaInput: '' });
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    this.loginSvc.login({
      username: username!,
      password: this.encryptPassword(password!),
      group: group!,
      captcha: captchaInput!,
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.loginResponse) {
          this.auth.login(res.loginResponse);
          this.router.navigate(['/dashboard/booking']);
        } else {
          this.errorMsg = res.message || 'Login failed. Please check your credentials.';
          this.generateCaptcha();
          this.form.patchValue({ captchaInput: '' });
        }
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || 'Login failed. Please try again.';
        this.generateCaptcha();
        this.form.patchValue({ captchaInput: '' });
      }
    });
  }
}
