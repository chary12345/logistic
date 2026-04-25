import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, forkJoin, of, Observable } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { AuthService } from '../../../../core/auth/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { OperationService } from '../../../../core/services/operation.service';
import { StatementService } from '../../../../core/services/statement.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Booking, BookingPageResponse, VehicleDTO } from '../../../../shared/models/models';

interface KpiCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  subtitle?: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, HighchartsChartComponent,
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  loading = true;
  today = new Date();
  greeting = '';
  userName = '';
  branchName = '';

  // KPI
  kpiCards: KpiCard[] = [];
  totalBookings = 0;
  todayBookings = 0;
  totalRevenue = 0;
  todayRevenue = 0;
  dispatchedCount = 0;
  deliveredCount = 0;
  receivedCount = 0;
  paidCount = 0;
  toPayCount = 0;
  tbbCount = 0;
  activeVehicles = 0;
  nextLR = 'â€”';

  // Chart options
  bookingTrendOptions: Highcharts.Options = {};
  paymentPieOptions: Highcharts.Options = {};
  statusBarOptions: Highcharts.Options = {};
  revenueAreaOptions: Highcharts.Options = {};
  updateFlags = { bookingTrend: false, paymentPie: false, statusBar: false, revenueArea: false };

  // Recent bookings
  recentBookings: Booking[] = [];

  private destroy$ = new Subject<void>();
  private allBookings: Booking[] = [];

  constructor(
    private auth: AuthService,
    private bookingSvc: BookingService,
    private operationSvc: OperationService,
    private statementSvc: StatementService,
    private vehicleSvc: VehicleService,
    private branchSvc: BranchService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.userName = this.auth.userFullName;
    this.branchName = this.auth.currentUser?.companyAndBranchDeatils?.branchName || this.auth.branchCode;
    this.loadNextLR();
    this.loadDashboardData();
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    if (h < 12) this.greeting = 'Good Morning';
    else if (h < 17) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  private loadNextLR(): void {
    const bc = this.auth.branchCode;
    if (!bc) return;
    this.branchSvc.getNextLR(bc).pipe(takeUntil(this.destroy$)).subscribe({
      next: lr => this.nextLR = (lr || 'â€”').trim(),
      error: () => this.nextLR = 'â€”',
    });
  }

  private loadDashboardData(): void {
    this.loading = true;
    const branchCode = this.auth.branchCode;

    const todayStr = this.formatDate(this.today);
    const monthStart = this.formatDate(new Date(this.today.getFullYear(), this.today.getMonth(), 1));

    // Fetch all bookings for this month with different statuses
    forkJoin({
      booked: this.fetchAllPages(monthStart, todayStr, 'BOOKED', branchCode),
      dispatched: this.fetchAllPages(monthStart, todayStr, 'DISPATCHED', branchCode),
      received: this.fetchAllPages(monthStart, todayStr, 'RECEIVED', branchCode),
      delivered: this.fetchAllPages(monthStart, todayStr, 'DELIVERED', branchCode),
      vehicles: this.vehicleSvc.getActive(branchCode).pipe(catchError(() => of([] as VehicleDTO[]))),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        const booked = data.booked || [];
        const dispatched = data.dispatched || [];
        const received = data.received || [];
        const delivered = data.delivered || [];
        const vehicles = data.vehicles || [];

        this.allBookings = [...booked, ...dispatched, ...received, ...delivered];
        this.activeVehicles = vehicles.length;

        this.processData(booked, dispatched, received, delivered);
        this.buildCharts();
        this.buildKpiCards();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.buildKpiCards();
      },
    });
  }

  private fetchAllPages(from: string, to: string, status: string, branchCode: string): Observable<Booking[]> {
    return new Observable<Booking[]>((subscriber) => {
      const allItems: Booking[] = [];
      const fetchPage = (lastId?: string) => {
        this.bookingSvc.getReport(from, to, status, lastId, branchCode).subscribe({
          next: (res: BookingPageResponse) => {
            if (res.content) allItems.push(...res.content);
            if (!res.last && res.lastId) {
              fetchPage(res.lastId);
            } else {
              subscriber.next(allItems);
              subscriber.complete();
            }
          },
          error: () => {
            subscriber.next(allItems);
            subscriber.complete();
          },
        });
      };
      fetchPage();
    });
  }

  private processData(booked: Booking[], dispatched: Booking[], received: Booking[], delivered: Booking[]): void {
    const all = this.allBookings;
    const todayStr = this.formatDate(this.today);

    this.totalBookings = all.length;
    this.todayBookings = all.filter(b => b.bookingDate === todayStr).length;
    this.dispatchedCount = dispatched.length;
    this.receivedCount = received.length;
    this.deliveredCount = delivered.length;

    this.totalRevenue = all.reduce((sum, b) => {
      const freight = b.freight || 0;
      const sgst = b.sgst || 0;
      const cgst = b.cgst || 0;
      const igst = b.igst || 0;
      const loading = b.loading || 0;
      const loadingCharge = b.loadingCharge || 0;
      return sum + freight + sgst + cgst + igst + loading + loadingCharge;
    }, 0);

    this.todayRevenue = all.filter(b => b.bookingDate === todayStr).reduce((sum, b) => {
      const freight = b.freight || 0;
      const sgst = b.sgst || 0;
      const cgst = b.cgst || 0;
      const igst = b.igst || 0;
      const loading = b.loading || 0;
      const loadingCharge = b.loadingCharge || 0;
      return sum + freight + sgst + cgst + igst + loading + loadingCharge;
    }, 0);

    this.paidCount = all.filter(b => b.billType === 'PAID').length;
    this.toPayCount = all.filter(b => b.billType === 'TO PAY').length;
    this.tbbCount = all.filter(b => b.billType === 'TBB').length;

    this.recentBookings = [...all]
      .sort((a, b) => (b.bookingDate || '').localeCompare(a.bookingDate || '') || (b.loadingReciept || '').localeCompare(a.loadingReciept || ''))
      .slice(0, 10);
  }

  private buildKpiCards(): void {
    this.kpiCards = [
      {
        title: 'Month Bookings',
        value: this.totalBookings,
        icon: 'receipt_long',
        color: '#0b5ed7',
        bg: '#e8f0fe',
        subtitle: `Today: ${this.todayBookings}`,
        route: '/dashboard/reports/booking',
      },
      {
        title: 'Month Revenue',
        value: 'â‚¹' + this.totalRevenue.toLocaleString('en-IN'),
        icon: 'currency_rupee',
        color: '#15803d',
        bg: '#d1fae5',
        subtitle: `Today: â‚¹${this.todayRevenue.toLocaleString('en-IN')}`,
        route: '/dashboard/statements',
      },
      {
        title: 'Dispatched',
        value: this.dispatchedCount,
        icon: 'local_shipping',
        color: '#9d174d',
        bg: '#fce7f3',
        subtitle: 'Pending delivery',
        route: '/dashboard/reports/dispatch',
      },
      {
        title: 'Received',
        value: this.receivedCount,
        icon: 'move_to_inbox',
        color: '#b45309',
        bg: '#fef3c7',
        subtitle: 'At destination',
        route: '/dashboard/reports/receive',
      },
      {
        title: 'Delivered',
        value: this.deliveredCount,
        icon: 'done_all',
        color: '#065f46',
        bg: '#d1fae5',
        subtitle: 'Completed',
        route: '/dashboard/reports/delivery',
      },
      {
        title: 'Active Vehicles',
        value: this.activeVehicles,
        icon: 'fire_truck',
        color: '#6d28d9',
        bg: '#ede9fe',
        subtitle: 'Fleet size',
        route: '/dashboard/admin/vehicles',
      },
    ];
  }

  private buildCharts(): void {
    this.buildBookingTrendChart();
    this.buildPaymentPieChart();
    this.buildStatusBarChart();
    this.buildRevenueAreaChart();
  }

  private buildBookingTrendChart(): void {
    const daysInMonth = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getDate();
    const currentDay = this.today.getDate();
    const dayLabels: string[] = [];
    const dailyCounts: number[] = [];

    for (let d = 1; d <= Math.min(daysInMonth, currentDay); d++) {
      const dt = new Date(this.today.getFullYear(), this.today.getMonth(), d);
      const dtStr = this.formatDate(dt);
      dayLabels.push(d.toString());
      dailyCounts.push(this.allBookings.filter(b => b.bookingDate === dtStr).length);
    }

    this.bookingTrendOptions = {
      chart: { type: 'areaspline', height: 300, style: { fontFamily: 'Poppins, sans-serif' } },
      title: { text: 'Daily Booking Trend', style: { fontSize: '14px', fontWeight: '700', color: '#1a2744' } },
      credits: { enabled: false },
      xAxis: { categories: dayLabels, title: { text: 'Day of Month' }, labels: { style: { fontSize: '10px' } } },
      yAxis: { title: { text: 'Bookings' }, min: 0, allowDecimals: false, labels: { style: { fontSize: '10px' } } },
      tooltip: { shared: true, valueSuffix: ' bookings' },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.15,
          marker: { radius: 3 },
          lineWidth: 2,
          color: '#0b5ed7',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(11,94,215,0.3)'], [1, 'rgba(11,94,215,0.02)']],
          } as any,
        },
      },
      series: [{ type: 'areaspline', name: 'Bookings', data: dailyCounts }],
    };
    this.updateFlags.bookingTrend = true;
  }

  private buildPaymentPieChart(): void {
    this.paymentPieOptions = {
      chart: { type: 'pie', height: 300, style: { fontFamily: 'Poppins, sans-serif' } },
      title: { text: 'Payment Mode Split', style: { fontSize: '14px', fontWeight: '700', color: '#1a2744' } },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)' },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: { enabled: true, format: '{point.name}: {point.y}', style: { fontSize: '11px' } },
          innerSize: '50%',
        },
      },
      series: [{
        type: 'pie',
        name: 'Bookings',
        data: [
          { name: 'PAID', y: this.paidCount, color: '#15803d' },
          { name: 'TO PAY', y: this.toPayCount, color: '#b45309' },
          { name: 'TBB', y: this.tbbCount, color: '#6d28d9' },
        ],
      }],
    };
    this.updateFlags.paymentPie = true;
  }

  private buildStatusBarChart(): void {
    const bookedOnly = this.allBookings.filter(b => b.consignStatus === 'BOOKED').length;
    this.statusBarOptions = {
      chart: { type: 'column', height: 300, style: { fontFamily: 'Poppins, sans-serif' } },
      title: { text: 'Bookings by Status', style: { fontSize: '14px', fontWeight: '700', color: '#1a2744' } },
      credits: { enabled: false },
      xAxis: {
        categories: ['Booked', 'Dispatched', 'Received', 'Delivered'],
        labels: { style: { fontSize: '11px' } },
      },
      yAxis: { title: { text: 'Count' }, min: 0, allowDecimals: false, labels: { style: { fontSize: '10px' } } },
      tooltip: { valueSuffix: ' bookings' },
      plotOptions: {
        column: {
          borderRadius: 4,
          colorByPoint: true,
          colors: ['#0b5ed7', '#9d174d', '#b45309', '#15803d'],
          dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: '700' } },
        },
      },
      series: [{
        type: 'column',
        name: 'Count',
        data: [bookedOnly, this.dispatchedCount, this.receivedCount, this.deliveredCount],
      }],
    };
    this.updateFlags.statusBar = true;
  }

  private buildRevenueAreaChart(): void {
    const daysInMonth = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getDate();
    const currentDay = this.today.getDate();
    const dayLabels: string[] = [];
    const dailyRevenue: number[] = [];

    for (let d = 1; d <= Math.min(daysInMonth, currentDay); d++) {
      const dt = new Date(this.today.getFullYear(), this.today.getMonth(), d);
      const dtStr = this.formatDate(dt);
      dayLabels.push(d.toString());
      const dayBookings = this.allBookings.filter(b => b.bookingDate === dtStr);
      const dayRev = dayBookings.reduce((sum, b) => {
        return sum + (b.freight || 0) + (b.sgst || 0) + (b.cgst || 0) + (b.igst || 0) + (b.loading || 0) + (b.loadingCharge || 0);
      }, 0);
      dailyRevenue.push(dayRev);
    }

    this.revenueAreaOptions = {
      chart: { type: 'area', height: 300, style: { fontFamily: 'Poppins, sans-serif' } },
      title: { text: 'Daily Revenue Trend', style: { fontSize: '14px', fontWeight: '700', color: '#1a2744' } },
      credits: { enabled: false },
      xAxis: { categories: dayLabels, title: { text: 'Day of Month' }, labels: { style: { fontSize: '10px' } } },
      yAxis: {
        title: { text: 'Revenue (â‚¹)' },
        min: 0,
        labels: {
          style: { fontSize: '10px' },
          formatter: function() { return 'â‚¹' + Highcharts.numberFormat(this.value as number, 0, '.', ','); },
        },
      },
      tooltip: {
        valuePrefix: 'â‚¹',
        valueDecimals: 0,
      },
      plotOptions: {
        area: {
          fillOpacity: 0.15,
          marker: { radius: 3 },
          lineWidth: 2,
          color: '#15803d',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(21,128,61,0.3)'], [1, 'rgba(21,128,61,0.02)']],
          } as any,
        },
      },
      series: [{ type: 'area', name: 'Revenue', data: dailyRevenue }],
    };
    this.updateFlags.revenueArea = true;
  }

  navigateTo(route: string | undefined): void {
    if (route) this.router.navigate([route]);
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toUpperCase()) {
      case 'BOOKED': return 'status-booked';
      case 'DISPATCHED': return 'status-dispatched';
      case 'RECEIVED': return 'status-received';
      case 'DELIVERED': return 'status-delivered';
      default: return '';
    }
  }

  getPaymentClass(type: string | undefined): string {
    switch (type?.toUpperCase()) {
      case 'PAID': return 'pay-paid';
      case 'TO PAY': return 'pay-topay';
      case 'TBB': return 'pay-tbb';
      default: return '';
    }
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
