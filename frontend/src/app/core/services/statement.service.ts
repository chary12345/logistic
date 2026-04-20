import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatementDto } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class StatementService {
  constructor(private http: HttpClient) {}

  getStatements(
    branchCode: string,
    fromDate: string,
    toDate: string,
    paymentMode?: string
  ): Observable<StatementDto[]> {
    let params = new HttpParams()
      .set('branchCode', branchCode)
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    if (paymentMode) params = params.set('paymentMode', paymentMode);
    return this.http.get<StatementDto[]>('/statement/report', { params });
  }
}
