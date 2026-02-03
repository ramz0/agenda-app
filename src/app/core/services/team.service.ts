import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Team,
  TeamMemberWithUser,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly API_URL = 'https://agenda-api-production-96e1.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.API_URL}/teams`);
  }

  getById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.API_URL}/teams/${id}`);
  }

  getMyTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.API_URL}/my/teams`);
  }

  create(team: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(`${this.API_URL}/teams`, team);
  }

  update(id: string, team: UpdateTeamRequest): Observable<Team> {
    return this.http.patch<Team>(`${this.API_URL}/teams/${id}`, team);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/teams/${id}`);
  }

  getMembers(teamId: string): Observable<TeamMemberWithUser[]> {
    return this.http.get<TeamMemberWithUser[]>(`${this.API_URL}/teams/${teamId}/members`);
  }

  addMember(teamId: string, data: AddTeamMemberRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/teams/${teamId}/members`, data);
  }

  removeMember(teamId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/teams/${teamId}/members/${userId}`);
  }
}
