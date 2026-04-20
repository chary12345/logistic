import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  search(type: string, q: string, branchCode: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(
      `/contacts/search?type=${type}&q=${encodeURIComponent(q)}&branchCode=${branchCode}`
    );
  }

  save(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>('/contacts', contact);
  }
}
