import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, OperationFilter, ReceiveRequest, DispatchedResponseDTO } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class OperationService {
  constructor(private http: HttpClient) {}

  getBookingsWithFilter(filter: OperationFilter): Observable<Booking[]> {
    const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
    return this.http.post<Booking[]>('/operation/bookingList', filter, { headers });
  }

  getDispatchedList(lsId?: number, vehicleNo?: string): Observable<DispatchedResponseDTO> {
    let params = new HttpParams();
    if (lsId != null) params = params.set('lsId', lsId.toString());
    if (vehicleNo) params = params.set('vehicleNo', vehicleNo);
    const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
    return this.http.get<DispatchedResponseDTO>('/operation/disaptchedList', { params, headers });
  }

  receiveSelectedLrs(request: ReceiveRequest): Observable<string> {
    return this.http.post('/operation/receive', request, { responseType: 'text' });
  }

  getReceivedLrs(destinationBranchCode: string, lrNumber?: string): Observable<Booking[]> {
    let params = new HttpParams().set('destinationBranchCode', destinationBranchCode);
    if (lrNumber?.trim()) params = params.set('lrNumber', lrNumber.trim());
    const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
    return this.http.get<Booking[]>('/operation/fetchReceivedLrs', { params, headers });
  }

  deliverLrs(lrIds: string[]): Observable<string> {
    return this.http.post('/operation/deliverLrs', lrIds, { responseType: 'text' });
  }
}

