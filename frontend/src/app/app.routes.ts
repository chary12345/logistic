import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/pages/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'booking',
        loadComponent: () => import('./features/dashboard/pages/booking-form/booking-form.component').then(m => m.BookingFormComponent)
      },
      {
        path: 'reports/booking',
        loadComponent: () => import('./features/dashboard/pages/booking-report/booking-report.component').then(m => m.BookingReportComponent)
      },
      {
        path: 'reports/dispatch',
        loadComponent: () => import('./features/dashboard/pages/dispatch-report/dispatch-report.component').then(m => m.DispatchReportComponent)
      },
      {
        path: 'reports/receive',
        loadComponent: () => import('./features/dashboard/pages/receive-report/receive-report.component').then(m => m.ReceiveReportComponent)
      },
      {
        path: 'reports/delivery',
        loadComponent: () => import('./features/dashboard/pages/delivery-report/delivery-report.component').then(m => m.DeliveryReportComponent)
      },
      {
        path: 'operations/dispatch',
        loadComponent: () => import('./features/dashboard/pages/dispatch-operations/dispatch-operations.component').then(m => m.DispatchOperationsComponent)
      },
      {
        path: 'operations/receive',
        loadComponent: () => import('./features/dashboard/pages/receive-operations/receive-operations.component').then(m => m.ReceiveOperationsComponent)
      },
      {
        path: 'operations/delivery',
        loadComponent: () => import('./features/dashboard/pages/delivery-operations/delivery-operations.component').then(m => m.DeliveryOperationsComponent)
      },
      {
        path: 'global-search',
        loadComponent: () => import('./features/dashboard/pages/global-search/global-search.component').then(m => m.GlobalSearchComponent)
      },
      {
        path: 'admin/branches',
        loadComponent: () => import('./features/dashboard/pages/branch-manage/branch-manage.component').then(m => m.BranchManageComponent)
      },
      {
        path: 'admin/employees',
        loadComponent: () => import('./features/dashboard/pages/employee-manage/employee-manage.component').then(m => m.EmployeeManageComponent)
      },
      {
        path: 'admin/vehicles',
        loadComponent: () => import('./features/dashboard/pages/vehicle-manage/vehicle-manage.component').then(m => m.VehicleManageComponent)
      },
      {
        path: 'admin/parties',
        loadComponent: () => import('./features/dashboard/pages/party-manage/party-manage.component').then(m => m.PartyManageComponent)
      },
      {
        path: 'statements',
        loadComponent: () => import('./features/dashboard/pages/statements/statements.component').then(m => m.StatementsComponent)
      },
      {
        path: 'statements/tbb-invoice',
        loadComponent: () => import('./features/dashboard/pages/tbb-invoice/tbb-invoice.component').then(m => m.TbbInvoiceComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
