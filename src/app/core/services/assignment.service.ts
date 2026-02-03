import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  EventAssignment,
  EventAssignmentWithDetails,
  RespondAssignmentRequest,
  AssignmentStatus,
  PendingCountResponse
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly API_URL = 'https://agenda-api-production-96e1.up.railway.app/api';

  private _pendingCount = signal<number>(0);
  pendingCount = this._pendingCount.asReadonly();

  constructor(private http: HttpClient) {}

  getMyAssignments(status?: AssignmentStatus): Observable<EventAssignmentWithDetails[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<EventAssignmentWithDetails[]>(`${this.API_URL}/my/assignments`, { params });
  }

  getByEventId(eventId: string): Observable<EventAssignmentWithDetails[]> {
    return this.http.get<EventAssignmentWithDetails[]>(`${this.API_URL}/events/${eventId}/assignments`);
  }

  respond(eventId: string, data: RespondAssignmentRequest): Observable<EventAssignment> {
    return this.http.post<EventAssignment>(
      `${this.API_URL}/events/${eventId}/assignments/respond`,
      data
    ).pipe(
      tap(() => this.refreshPendingCount())
    );
  }

  getPendingCount(): Observable<PendingCountResponse> {
    return this.http.get<PendingCountResponse>(`${this.API_URL}/my/assignments/pending-count`).pipe(
      tap(response => this._pendingCount.set(response.count))
    );
  }

  refreshPendingCount(): void {
    this.getPendingCount().subscribe();
  }
}
