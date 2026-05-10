import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private http: HttpClient) {}

  create(employee: UserModel): Observable<{message: string; status: string}> {
    return this.http.post<{message: string; status: string}>('/addEmployee', employee);
  }

  validateUsername(username: string, companyCode: string): Observable<{status: string}> {
    return this.http.post<{status: string}>('/validate-username', { username, companyCode });
  }

  getEmployeesByBranch(companyCode: string, branchCode: string): Observable<string[]> {
    return this.http.get<string[]>(`/employeeList?companyCode=${companyCode}&branchCode=${branchCode}`);
  }

  getByCompanyCode(companyCode: string): Observable<{status: string; data: any[]}> {
    return this.http.get<{status: string; data: any[]}>(`/employeesByCompany/${companyCode}`);
  }

  getByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`/getEmployeeDetails/${userId}`);
  }

  update(userId: string, employee: any): Observable<{status: string; data: any}> {
    return this.http.put<{status: string; data: any}>(`/updateEmployee/${userId}`, employee);
  }
}
