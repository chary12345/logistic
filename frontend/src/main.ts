import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Register ag-grid modules before bootstrap
ModuleRegistry.registerModules([ClientSideRowModelModule]);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
