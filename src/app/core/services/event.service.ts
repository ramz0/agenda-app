import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest, UpdateEventRequest, EventStatus } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'https://agenda-api-production-96e1.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getAll(status?: EventStatus): Observable<Event[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Event[]>(`${this.API_URL}/events`, { params });
  }

  getById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/events/${id}`);
  }

  getCalendar(start: string, end: string): Observable<Event[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<Event[]>(`${this.API_URL}/events/calendar`, { params });
  }

  getMyCalendar(start: string, end: string): Observable<Event[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<Event[]>(`${this.API_URL}/my/calendar`, { params });
  }

  getMyEvents(type?: 'personal' | 'team'): Observable<Event[] | { personal: Event[], team: Event[] }> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Event[] | { personal: Event[], team: Event[] }>(`${this.API_URL}/my/events`, { params });
  }

  create(event: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/events`, event);
  }

  update(id: string, event: UpdateEventRequest): Observable<Event> {
    return this.http.patch<Event>(`${this.API_URL}/events/${id}`, event);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/events/${id}`);
  }
}
