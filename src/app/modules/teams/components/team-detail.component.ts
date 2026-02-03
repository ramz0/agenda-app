import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TeamService } from '@services/team.service';
import { AuthService } from '@services/auth.service';
import { Team, TeamMemberWithUser, User } from '@models/index';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
        </div>
      } @else if (team()) {
        <div class="mb-8">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-violet-400 text-sm font-medium mb-1">Equipo</p>
              <h1 class="text-3xl font-bold text-white">{{ team()!.name }}</h1>
              <p class="text-slate-400 mt-2">{{ team()!.description || 'Sin descripción' }}</p>
            </div>
            <div class="flex gap-2">
              <a [routerLink]="['/teams', team()!.id, 'edit']"
                 class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition">
                Editar
              </a>
              <button (click)="deleteTeam()"
                      class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Add Member Form -->
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-5 mb-6">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Agregar Miembro
          </h2>
          <form [formGroup]="addMemberForm" (ngSubmit)="addMember()" class="flex gap-4">
            <input
              type="text"
              formControlName="userId"
              placeholder="ID del usuario"
              class="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500"
            />
            <button
              type="submit"
              [disabled]="addMemberForm.invalid || addingMember()"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 transition font-medium">
              @if (addingMember()) {
                Agregando...
              } @else {
                Agregar
              }
            </button>
          </form>
          @if (addMemberError()) {
            <p class="text-rose-400 text-sm mt-3">{{ addMemberError() }}</p>
          }
        </div>

        <!-- Members List -->
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
          <div class="p-5 border-b border-slate-700/50">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Miembros ({{ members().length }})
            </h2>
          </div>

          @if (members().length === 0) {
            <div class="p-8 text-center">
              <div class="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <p class="text-slate-400">Este equipo no tiene miembros</p>
            </div>
          } @else {
            <ul class="divide-y divide-slate-700/50">
              @for (member of members(); track member.id) {
                <li class="p-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <span class="text-violet-400 font-medium">{{ member.userName?.charAt(0)?.toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ member.userName }}</p>
                      <p class="text-sm text-slate-400">{{ member.userEmail }}</p>
                    </div>
                  </div>
                  <button
                    (click)="removeMember(member.userId)"
                    class="text-rose-400 hover:text-rose-300 text-sm transition">
                    Eliminar
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        <div class="mt-6">
          <a routerLink="/teams" class="text-violet-400 hover:text-violet-300 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver a equipos
          </a>
        </div>
      } @else {
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-slate-400 mb-4">Equipo no encontrado</p>
          <a routerLink="/teams" class="text-violet-400 hover:text-violet-300 transition">
            Volver a equipos
          </a>
        </div>
      }
    </div>
  `
})
export class TeamDetailComponent implements OnInit {
  team = signal<Team | null>(null);
  members = signal<TeamMemberWithUser[]>([]);
  loading = signal(true);
  addingMember = signal(false);
  addMemberError = signal<string | null>(null);
  addMemberForm: FormGroup;

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addMemberForm = this.fb.group({
      userId: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTeam(id);
      this.loadMembers(id);
    }
  }

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe({
      next: (team) => {
        this.team.set(team);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadMembers(teamId: string) {
    this.teamService.getMembers(teamId).subscribe({
      next: (members) => this.members.set(members),
      error: () => {}
    });
  }

  addMember() {
    const teamId = this.team()?.id;
    if (!teamId || this.addMemberForm.invalid) return;

    this.addingMember.set(true);
    this.addMemberError.set(null);

    this.teamService.addMember(teamId, { userId: this.addMemberForm.value.userId }).subscribe({
      next: () => {
        this.addMemberForm.reset();
        this.addingMember.set(false);
        this.loadMembers(teamId);
      },
      error: (err) => {
        this.addingMember.set(false);
        this.addMemberError.set(err.error?.error || 'Error al agregar miembro');
      }
    });
  }

  removeMember(userId: string) {
    const teamId = this.team()?.id;
    if (!teamId) return;

    if (confirm('¿Estás seguro de eliminar este miembro?')) {
      this.teamService.removeMember(teamId, userId).subscribe({
        next: () => this.loadMembers(teamId),
        error: () => {}
      });
    }
  }

  deleteTeam() {
    const team = this.team();
    if (!team) return;

    if (confirm(`¿Estás seguro de eliminar el equipo "${team.name}"?`)) {
      this.teamService.delete(team.id).subscribe({
        next: () => this.router.navigate(['/teams']),
        error: () => {}
      });
    }
  }
}
