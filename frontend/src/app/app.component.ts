import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './core/services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatProgressBarModule],
  template: `
    <mat-progress-bar *ngIf="loading" mode="indeterminate" class="global-loader"></mat-progress-bar>
    <router-outlet />
  `,
  styles: [`
    .global-loader { position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private loadingService = inject(LoadingService);
  loading = false;
  private loadingSubscription?: Subscription;

  ngOnInit(): void {
    this.loadingSubscription = this.loadingService.loading$.subscribe(
      isLoading => this.loading = isLoading
    );
  }

  ngOnDestroy(): void {
    this.loadingSubscription?.unsubscribe();
  }
}
