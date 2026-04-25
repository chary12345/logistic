import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="coming-soon-wrapper">
      <mat-icon>construction</mat-icon>
      <h2>{{ featureName }}</h2>
      <p>This feature is currently under development. Stay tuned for upcoming updates!</p>
      <button mat-raised-button color="primary" routerLink="/dashboard/booking">
        <mat-icon>home</mat-icon> Go to Booking
      </button>
    </div>
  `,
})
export class ComingSoonComponent {
  featureName = 'Coming Soon';
  constructor(private route: ActivatedRoute) {
    this.featureName = this.route.snapshot.data['feature'] || 'Coming Soon';
  }
}
