import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatProgressBarModule],
  template: `
    <mat-progress-bar *ngIf="loading$ | async" mode="indeterminate" class="global-loader"></mat-progress-bar>
    <router-outlet />
  `,
  styles: [`
    .global-loader { position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; }
  `]
})
export class AppComponent {
  private loadingService = inject(LoadingService);
  loading$ = this.loadingService.loading$;
}
