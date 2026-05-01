import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideHighcharts } from 'highcharts-angular';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import * as Highcharts from 'highcharts';
import Accessibility from 'highcharts/modules/accessibility';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';

// Initialize Highcharts modules safely
(Accessibility as any)(Highcharts);
(Exporting as any)(Highcharts);
(ExportData as any)(Highcharts);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()), // Use hash routing to avoid 404s when running SPA inside Spring Boot
    provideHttpClient(
      withInterceptors([loadingInterceptor, errorInterceptor]),
      withInterceptorsFromDi()
    ),
    provideAnimations(),
    provideNativeDateAdapter(),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'fixed' }
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 4000, horizontalPosition: 'right', verticalPosition: 'bottom' }
    },
    provideHighcharts({
      instance: () => Promise.resolve(Highcharts)
    }),
  ]
};
