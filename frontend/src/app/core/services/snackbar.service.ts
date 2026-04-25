import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(private snack: MatSnackBar) {}

  private show(message: string, panelClass: string, duration = 4000) {
    this.snack.open(message, '✕', {
      duration,
      panelClass: [panelClass],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    } as MatSnackBarConfig);
  }

  success(msg: string) { this.show(msg, 'snack-success'); }
  error(msg: string)   { this.show(msg, 'snack-error', 6000); }
  info(msg: string)    { this.show(msg, 'snack-info'); }
  warning(msg: string) { this.show(msg, 'snack-warning'); }
}
