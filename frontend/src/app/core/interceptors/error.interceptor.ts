import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from '../services/snackbar.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(SnackbarService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMsg = `Network error: ${error.error.message}`;
      } else {
        // Backend error
        if (error.status === 401 || error.status === 403) {
          // Authentication error
          errorMsg = 'Session expired or unauthorized access. Please login again.';
          // Only redirect to login if not already on login page to avoid loops
          if (!router.url.includes('/login')) {
             sessionStorage.clear();
             router.navigate(['/login']);
          }
        } else if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else {
          errorMsg = `Server error (${error.status}): ${error.statusText || 'Unable to complete request'}`;
        }
      }

      // Avoid showing spammy global errors for validation inputs where components handle it themselves,
      // but for overall 500s or 401s, it's good to show globally.
      if (error.status >= 500 || error.status === 401 || error.status === 403) {
        snackbar.error(errorMsg);
      }

      return throwError(() => error);
    })
  );
};
