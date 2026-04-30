import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardSummary(branchCode: string): Observable<DashboardSummary> {
    const params = new HttpParams().set('branchCode', branchCode);
    return this.http.get<DashboardSummary>('/api/dashboard/summary', { params });
  }
}
