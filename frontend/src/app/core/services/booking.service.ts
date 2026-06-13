import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BookingDTO, Booking, BookingPageResponse, BookingResponseDTO,
  DispatchRequest, DispatchResponse, BookingSearchRequest
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) { }

  create(dto: BookingDTO): Observable<BookingResponseDTO> {
    return this.http.post<BookingResponseDTO>('/api/bookings/bookLoad', dto);
  }

  update(lr: string, dto: BookingDTO): Observable<BookingResponseDTO> {
    return this.http.put<BookingResponseDTO>(`/api/bookings/updateBookLoad?lr=${encodeURIComponent(lr)}`, dto);
  }

  searchByLR(lr: string): Observable<BookingDTO> {
    const ts = new Date().getTime();
    return this.http.get<BookingDTO>(`/api/bookings/searchBylr?lr=${encodeURIComponent(lr)}&_t=${ts}`);
  }

  getReport(fromDate: string, toDate: string, status: string, lastId?: string, branchCode?: string): Observable<BookingPageResponse> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('status', status);
    if (lastId) params = params.set('lastId', lastId);
    if (branchCode) params = params.set('branchCode', branchCode);

    const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
    return this.http.get<BookingPageResponse>('/api/bookings/report', { params, headers });
  }

  dispatchLoad(req: DispatchRequest): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>('/api/bookings/dispatchLoad', req);
  }

  globalSearch(req: BookingSearchRequest): Observable<BookingPageResponse> {
    const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
    return this.http.post<BookingPageResponse>('/api/bookings/get-Global-Search-Reports', req, { headers });
  }

  getSaidToContains(companyCode: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/bookings/Get-distinct-saidtocontains/${companyCode}`);
  }

  fetchArticleTypeList(companyCode: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/bookings/fetchArticleTypeList?companyCode=${encodeURIComponent(companyCode)}`);
  }

  createArticleType(payload: { articleType: string; companyCode: string }): Observable<any> {
    return this.http.post<any>('/api/bookings/createArticleType', payload);
  }

  /** Check if a given LR number already exists in the system (used for manual booking validation). */
  checkLRExists(lr: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/bookings/checkLrExists?lr=${encodeURIComponent(lr)}`);
  }

  /** Submit a manual booking via the dedicated endpoint (does not increment the auto-sequence). */
  createManual(dto: any): Observable<any> {
    return this.http.post<any>('/api/bookings/manualBookLoad', dto);
  }
}

