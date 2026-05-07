import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { BranchDTO, BranchMap } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  /** Emits whenever an LR is created/updated and the next LR should be refreshed */
  private lrUpdatedSubject = new Subject<void>();
  lrUpdated$ = this.lrUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Call this after a booking is created to notify subscribers to refresh the LR */
  notifyLrUpdated(): void {
    this.lrUpdatedSubject.next();
  }

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

  delete(branchCode: string): Observable<{status: string; message: string}> {
    return this.http.delete<{status: string; message: string}>(`/deleteBranch/${branchCode}`);
  }

  deleteMultiple(branchCodes: string[]): Observable<{
    status: string; deletedCount: number; failedCount: number;
    deleted: string[]; failed: string[];
  }> {
    return this.http.post<any>('/api/deleteBranches', branchCodes);
  }
}
