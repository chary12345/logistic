import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginApiResponse, PasswordChangeRequest } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class LoginApiService {
  constructor(private http: HttpClient) {}

  login(body: { username: string; password: string; group: string; captcha: string }): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>('/api/login', body);
  }

  changePassword(req: PasswordChangeRequest): Observable<{success?: boolean; message?: string}> {
    return this.http.post<{success?: boolean; message?: string}>('/api/change-password', req);
  }
}
