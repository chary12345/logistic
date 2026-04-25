import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehicleRequest, VehicleDTO } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  constructor(private http: HttpClient) {}

  associate(req: VehicleRequest): Observable<string> {
    return this.http.post('/vehicles/associate', req, { responseType: 'text' });
  }

  getActive(branchCode: string): Observable<VehicleDTO[]> {
    return this.http.get<VehicleDTO[]>(`/vehicles/active?branchCode=${branchCode}`);
  }
}
