import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamService } from '@services/team.service';
import { Team } from '@models/index';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <p class="text-violet-400 text-sm font-medium mb-1">Administración</p>
          <h1 class="text-3xl font-bold text-white">Equipos</h1>
        </div>
        <a routerLink="/teams/new"
           class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition font-medium shadow-lg shadow-violet-500/25">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Equipo
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
        </div>
      } @else if (teams().length === 0) {
        <div class="text-center py-12 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50">
          <div class="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p class="text-slate-400 mb-4">No hay equipos creados</p>
          <a routerLink="/teams/new" class="text-violet-400 hover:text-violet-300 transition">
            Crear el primer equipo
          </a>
        </div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          @for (team of teams(); track team.id) {
            <a [routerLink]="['/teams', team.id]"
               class="group block bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-5 hover:border-violet-500/50 hover:bg-slate-800/70 transition">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-lg text-white group-hover:text-violet-300 transition">{{ team.name }}</h3>
              </div>
              <p class="text-slate-400 text-sm line-clamp-2">{{ team.description || 'Sin descripción' }}</p>
              <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ team.createdAt | date:'dd/MM/yyyy' }}</span>
                <span class="text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Ver
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class TeamListComponent implements OnInit {
  teams = signal<Team[]>([]);
  loading = signal(true);

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading.set(true);
    this.teamService.getAll().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
