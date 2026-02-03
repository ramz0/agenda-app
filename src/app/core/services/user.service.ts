import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'https://agenda-api-production-96e1.up.railway.app/api';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users/search?q=${encodeURIComponent(query)}`);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }
}
