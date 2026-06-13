import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoginResponse } from '../../shared/models/models';

const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<LoginResponse | null>(this.storedUser);

  get currentUser$() { return this._user$.asObservable(); }
  get currentUser(): LoginResponse | null { return this._user$.value; }

  private get storedUser(): LoginResponse | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  login(user: LoginResponse): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  logout(): void {
    sessionStorage.clear();
    this._user$.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  hasRole(...roles: string[]): boolean {
    const r = this.currentUser?.role;
    return !!r && roles.includes(r);
  }

  get isAdmin(): boolean {
    return this.hasRole('Admin', 'SuperAdmin');
  }

  get companyCode(): string {
    return (this.currentUser?.companyAndBranchDeatils?.companyCode || this.currentUser?.companyCode) ?? '';
  }

  get branchCode(): string  {
    return (this.currentUser?.companyAndBranchDeatils?.branchCode || this.currentUser?.branchCode) ?? '';
  }

  get branchName(): string {
    return (this.currentUser?.companyAndBranchDeatils?.branchName || this.currentUser?.branchName) ?? '';
  }
  get userFullName(): string {
    const u = this.currentUser;
    return u ? `${u.firstName} ${u.lastName}` : '';
  }
}
