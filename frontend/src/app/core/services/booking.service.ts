import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BookingDTO, Booking, BookingPageResponse,
  DispatchRequest, DispatchResponse, BookingSearchRequest
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  create(dto: BookingDTO): Observable<Booking> {
    return this.http.post<Booking>('/api/bookings/bookLoad', dto);
  }

  update(lr: string, dto: BookingDTO): Observable<Booking> {
    return this.http.put<Booking>(`/api/bookings/bookLoad?lr=${lr}`, dto);
  }

  searchByLR(lr: string): Observable<BookingDTO> {
    return this.http.get<BookingDTO>(`/api/bookings/searchBylr?lr=${encodeURIComponent(lr)}`);
  }

  getReport(fromDate: string, toDate: string, status: string, lastId?: string, branchCode?: string): Observable<BookingPageResponse> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('status', status);
    if (lastId)    params = params.set('lastId', lastId);
    if (branchCode) params = params.set('branchCode', branchCode);
    return this.http.get<BookingPageResponse>('/api/bookings/report', { params });
  }

  dispatchLoad(req: DispatchRequest): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>('/api/bookings/dispatchLoad', req);
  }

  globalSearch(req: BookingSearchRequest): Observable<BookingPageResponse> {
    return this.http.post<BookingPageResponse>('/api/bookings/get-Global-Search-Reports', req);
  }

  getSaidToContains(companyCode: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/bookings/Get-ditinct-saidtocontains/${companyCode}`);
  }
}
