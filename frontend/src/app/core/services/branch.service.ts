import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BranchDTO, BranchMap } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  constructor(private http: HttpClient) {}

  validateCompanyCode(companyCode: string): Observable<{status: string}> {
    return this.http.get<{status: string}>(`/validate-company-code?companyCode=${companyCode}`);
  }

  validateBranchCode(branchCode: string): Observable<{status: string}> {
    return this.http.get<{status: string}>(`/validate-branch-code?branchCode=${branchCode}`);
  }

  create(branch: BranchDTO): Observable<{message: string; status: string}> {
    return this.http.post<{message: string; status: string}>('/createBranch', branch);
  }

  update(branchCode: string, branch: BranchDTO): Observable<{status: string; data: BranchDTO}> {
    return this.http.put<{status: string; data: BranchDTO}>(`/updateBranch/${branchCode}`, branch);
  }

  getByCompanyCode(companyCode: string): Observable<{status: string; data: BranchMap[]}> {
    return this.http.get<{status: string; data: BranchMap[]}>(`/BranchesByCompanyCode/${companyCode}`);
  }

  getByCode(branchCode: string): Observable<BranchDTO> {
    return this.http.get<BranchDTO>(`/getBranchDetails/${branchCode}`);
  }

  getLogoUrl(companyCode: string): string {
    return `/company/logo/${companyCode}`;
  }

  getNextLR(branchCode: string): Observable<string> {
    return this.http.get(`/nextLr/${branchCode}`, { responseType: 'text' });
  }
}
