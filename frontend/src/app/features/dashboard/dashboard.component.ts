import {
  Component, OnInit, OnDestroy, HostListener, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { BranchService } from '../../core/services/branch.service';
import { BookingService } from '../../core/services/booking.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PaymentModeService, PaymentMode } from '../../core/services/payment-mode.service';
import { ChangePasswordDialogComponent } from './dialogs/change-password-dialog/change-password-dialog.component';
import { LrSearchDialogComponent } from './dialogs/lr-search-dialog/lr-search-dialog.component';
import { LogoutConfirmationDialogComponent } from './dialogs/logout-confirmation-dialog/logout-confirmation-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterModule, FormsModule,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatButtonModule, MatExpansionModule, MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  currentUser: any = null;
  nextLR        = '—';
  lrSearch      = '';
  paymentMode: PaymentMode = 'TO PAY';
  isMobile      = window.innerWidth < 960;
  userMenuOpen  = false;
  private destroy$ = new Subject<void>();

  constructor(
    public  auth:           AuthService,
    private branchSvc:      BranchService,
    private bookingSvc:     BookingService,
    private dialog:         MatDialog,
    private router:         Router,
    private snack:          SnackbarService,
    private paymentModeSvc: PaymentModeService,
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (this.currentUser) {
          this.loadNextLR();
        }
      });

    // Auto-refresh LR number in header when a booking is created
    this.branchSvc.lrUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadNextLR());
  }

  loadNextLR(): void {
    const bc = this.auth.branchCode;
    if (!bc) return;
    this.branchSvc.getNextLR(bc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lr: string) => {
          this.nextLR = (lr || '—').trim();
        },
        error: () => {
          this.nextLR = '—';
        }
      });
  }

  refreshNextLR(): void { this.loadNextLR(); }

  @HostListener('window:resize')
  onResize(): void { this.isMobile = window.innerWidth < 960; }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'F7') { e.preventDefault(); this.setPaymentMode('PAID'); }
    else if (e.key === 'F8') { e.preventDefault(); this.setPaymentMode('TO PAY'); }
    else if (e.key === 'F9') { e.preventDefault(); this.setPaymentMode('TBB'); }
  }

  setPaymentMode(mode: PaymentMode): void {
    this.paymentMode = mode;
    this.paymentModeSvc.setPaymentMode(mode);
    this.snack.info(`Payment mode: ${mode}`);
  }

  searchLR(): void {
    const lr = this.lrSearch.trim();
    if (!lr) return;
    this.dialog.open(LrSearchDialogComponent, {
      data: { lr },
      width: '800px',
      maxWidth: '95vw',
    });
    this.lrSearch = '';
  }

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      disableClose: false,
    });
  }

  logout(): void {
    const dialogRef = this.dialog.open(LogoutConfirmationDialogComponent, {
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: false,
      panelClass: 'logout-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  // Getters for auto-expanding the correct sidebar panel based on current route
  get isAdmin(): boolean { return this.auth.isAdmin; }

  get isDashboardHomeActive(): boolean {
    return this.router.url.endsWith('/dashboard/home');
  }

  get isOperationsActive(): boolean {
    const url = this.router.url;
    return url.includes('/dashboard/operations') || url.includes('/dashboard/booking');
  }

  get isReportsActive(): boolean {
    return this.router.url.includes('/dashboard/reports');
  }

  get isAdminActive(): boolean {
    return this.router.url.includes('/dashboard/admin');
  }

  get isStatementsActive(): boolean {
    return this.router.url.includes('/dashboard/statements');
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
