import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Party {
  id: number;
  partyName: string;
  companyCode: string | null;
  branchCode: string | null;
  message: string | null;
  displayName: string;
  partyCode: string;
  partyType: string;
  mobileNumber1: string;
  city: string;
  tbb: boolean;
  gstNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class PartyService {
  constructor(private http: HttpClient) { }

  getPartiesByCompanyCode(companyCode: string): Observable<Party[]> {
    return this.http.get<Party[]>(`/party/getPartiesByCompanyCode?companyCode=${encodeURIComponent(companyCode)}`);
  }

  create(party: any): Observable<any> {
    return this.http.post<any>('/party/create', party);
  }
}
