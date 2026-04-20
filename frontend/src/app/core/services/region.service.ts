import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegionService {
  constructor(private http: HttpClient) {}

  getRegions(companyCode: string): Observable<string[]> {
    return this.http.get<string[]>(`/region/regions?companyCode=${companyCode}`);
  }

  getSubRegions(region: string): Observable<string[]> {
    return this.http.get<string[]>(`/region/subregions?region=${encodeURIComponent(region)}`);
  }

  getBranches(region: string, subRegion: string): Observable<string[]> {
    return this.http.get<string[]>(
      `/region/branches?region=${encodeURIComponent(region)}&subRegion=${encodeURIComponent(subRegion)}`
    );
  }
}
