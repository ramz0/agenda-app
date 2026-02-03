import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { EventService } from '@services/event.service';
import { Event } from '@models/index';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <p class="text-violet-400 text-sm font-medium mb-1">Dashboard</p>
        <h1 class="text-3xl font-bold text-white">Hola, {{ (authService.user()?.name?.split(' ') || [])[0] || 'Usuario' }} 👋</h1>
        <p class="text-slate-400 mt-1">Aquí está el resumen de tu agenda</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-white">{{ totalEvents() }}</p>
          <p class="text-sm text-slate-400">Total Agendados</p>
        </div>

        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-white">{{ publishedEvents() }}</p>
          <p class="text-sm text-slate-400">Publicados</p>
        </div>

      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Upcoming Events -->
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
          <div class="flex justify-between items-center mb-5">
            <h2 class="text-lg font-semibold text-white">Próximos</h2>
            <a routerLink="/my-calendar" class="text-violet-400 hover:text-violet-300 text-sm transition">Ver todos →</a>
          </div>
          @if (upcomingEvents().length === 0) {
            <div class="text-center py-8">
              <div class="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p class="text-slate-400">Nada agendado próximamente</p>
              <a routerLink="/events/new" class="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">Agendar →</a>
            </div>
          } @else {
            <div class="space-y-3">
              @for (event of upcomingEvents().slice(0, 5); track event.id) {
                <a [routerLink]="['/events', event.id]"
                   class="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition group">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span class="text-xs text-violet-300">{{ getMonthShort(event.date) }}</span>
                    <span class="text-lg font-bold text-white">{{ getDay(event.date) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-white truncate group-hover:text-violet-300 transition">{{ event.title }}</p>
                    <p class="text-sm text-slate-400">{{ formatTime(event.startTime) }}</p>
                  </div>
                  <span [class]="getStatusClass(event.status)">{{ getStatusLabel(event.status) }}</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
          <h2 class="text-lg font-semibold text-white mb-5">Acciones Rápidas</h2>
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/events/new"
               class="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 hover:from-violet-500/30 hover:to-fuchsia-500/30 border border-violet-500/20 transition group">
              <div class="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <p class="font-medium text-white">Agendar</p>
              <p class="text-xs text-slate-400 mt-1">Nueva actividad</p>
            </a>

            <a routerLink="/my-calendar"
               class="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/20 transition group">
              <div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p class="font-medium text-white">Mi Agenda</p>
              <p class="text-xs text-slate-400 mt-1">Ver calendario</p>
            </a>

            @if (authService.isAdmin()) {
              <a routerLink="/teams"
                 class="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/20 transition group">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <p class="font-medium text-white">Equipos</p>
                <p class="text-xs text-slate-400 mt-1">Gestionar</p>
              </a>
            }

          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  events = signal<Event[]>([]);
  totalEvents = signal(0);
  publishedEvents = signal(0);
  upcomingEvents = signal<Event[]>([]);

  constructor(
    public authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    // Get MY calendar events (only events I'm part of)
    this.eventService.getMyCalendar(
      startOfMonth.toISOString().split('T')[0],
      endOfYear.toISOString().split('T')[0]
    ).subscribe({
      next: (events) => {
        this.events.set(events);
        this.totalEvents.set(events.length);
        this.publishedEvents.set(events.filter(e => e.status === 'published').length);

        const todayStr = today.toISOString().split('T')[0];
        this.upcomingEvents.set(
          events
            .filter(e => e.date >= todayStr && e.status === 'published')
            .sort((a, b) => a.date.localeCompare(b.date))
        );
      }
    });
  }

  getMonthShort(dateStr: string): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = new Date(dateStr);
    return months[date.getMonth()];
  }

  getDay(dateStr: string): string {
    const date = new Date(dateStr);
    return date.getDate().toString();
  }

  formatTime(time: string): string {
    if (!time) return '';
    if (time.includes('T')) return time.split('T')[1].substring(0, 5);
    return time.substring(0, 5);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published': return 'px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400';
      case 'draft': return 'px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400';
      case 'cancelled': return 'px-2 py-1 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-400';
      default: return 'px-2 py-1 rounded-lg text-xs font-medium bg-slate-500/20 text-slate-400';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'published': return 'Activo';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }
}
