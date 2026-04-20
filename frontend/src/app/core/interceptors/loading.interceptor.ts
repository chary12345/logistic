import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading for silent requests like polling or background checks if needed
  if (req.headers.has('X-Skip-Loading')) {
    const headers = req.headers.delete('X-Skip-Loading');
    return next(req.clone({ headers }));
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
