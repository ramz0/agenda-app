import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '@services/event.service';
import { AuthService } from '@services/auth.service';
import { Event, EventStatus } from '@models/index';

interface EventGroup {
  key: string;
  title: string;
  description: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  location: string;
  capacity?: number;
  events: Event[];
  firstEvent: Event;
  totalParticipants: number;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <p class="text-violet-400 text-sm font-medium mb-1">{{ authService.isAuthenticated() ? 'Mis eventos' : 'Explorar' }}</p>
            <h1 class="text-3xl font-bold text-white">Agendados</h1>
            <p class="text-slate-400 mt-1">{{ authService.isAuthenticated() ? 'Eventos que creaste o te asignaron' : 'Explora las próximas actividades' }}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative">
              <select
                [value]="statusFilter()"
                (change)="onFilterChange($event)"
                class="appearance-none pl-4 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white font-medium cursor-pointer"
              >
                <option value="">Todos los estados</option>
                <option value="published">Publicados</option>
                @if (authService.isAdmin()) {
                  <option value="draft">Borradores</option>
                  <option value="cancelled">Cancelados</option>
                }
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            @if (authService.isAuthenticated()) {
              <a routerLink="/events/new"
                 class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition font-medium shadow-lg shadow-violet-500/25">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agendar
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Content -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-slate-400">Cargando...</p>
        </div>
      } @else if (groupedEvents().length === 0) {
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-12 text-center">
          <div class="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">No hay agendados</h3>
          <p class="text-slate-400 mb-6">
            @if (authService.isAuthenticated()) {
              No tienes eventos creados ni asignados.
            } @else {
              No se encontraron actividades.
            }
          </p>
          @if (statusFilter()) {
            <button (click)="clearFilter()"
                    class="px-4 py-2 text-violet-400 hover:bg-slate-700/50 rounded-xl transition font-medium">
              Limpiar filtros
            </button>
          }
          @if (authService.isAuthenticated() && !statusFilter()) {
            <a routerLink="/events/new"
               class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition font-medium">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Crear mi primer evento
            </a>
          }
        </div>
      } @else {
        <!-- Stats bar -->
        <div class="flex items-center gap-4 mb-6 text-sm text-slate-400">
          <span class="font-medium text-white">{{ groupedEvents().length }} evento{{ groupedEvents().length !== 1 ? 's' : '' }}</span>
          @if (events().length !== groupedEvents().length) {
            <span class="text-slate-500">({{ events().length }} instancias)</span>
          }
          @if (statusFilter()) {
            <span class="px-2 py-1 bg-violet-500/20 text-violet-400 rounded-lg text-xs font-medium">
              {{ getFilterLabel(statusFilter()) }}
            </span>
          }
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (group of groupedEvents(); track group.key) {
            <a [routerLink]="['/events', group.firstEvent.id]"
               class="group bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden hover:border-violet-500/50 hover:bg-slate-800/70 transition-all duration-300">
              <!-- Color bar based on status -->
              <div [class]="getHeaderClass(group.status)"></div>

              <div class="p-6">
                <div class="flex items-start justify-between gap-3 mb-3">
                  <h3 class="text-lg font-semibold text-white group-hover:text-violet-300 transition line-clamp-2">
                    {{ group.title }}
                  </h3>
                  <div class="flex flex-col items-end gap-1">
                    <span [class]="getStatusClass(group.status)">
                      {{ getStatusLabel(group.status) }}
                    </span>
                    @if (group.events.length > 1) {
                      <span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium">
                        {{ group.events.length }} fechas
                      </span>
                    }
                  </div>
                </div>

                <p class="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {{ group.description || 'Sin descripción disponible' }}
                </p>

                <div class="space-y-3 text-sm">
                  <!-- Fecha(s) -->
                  <div class="flex items-center gap-3 text-slate-300">
                    <div class="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    @if (group.events.length === 1) {
                      <span>{{ formatDate(group.firstEvent.date) }}</span>
                    } @else {
                      <span>{{ formatDateShort(group.events[0].date) }} → {{ formatDateShort(group.events[group.events.length - 1].date) }}</span>
                    }
                  </div>

                  <!-- Hora -->
                  <div class="flex items-center gap-3 text-slate-300">
                    <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>{{ formatTime(group.startTime) }} - {{ formatTime(group.endTime) }}</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="mt-5 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-slate-400 text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ group.totalParticipants }} participantes</span>
                  </div>
                  <span class="text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ver más
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class EventListComponent implements OnInit {
  events = signal<Event[]>([]);
  loading = signal(true);
  statusFilter = signal<EventStatus | ''>('');

  // Computed que agrupa eventos por título + descripción + hora
  groupedEvents = computed(() => {
    const events = this.events();
    if (!events || events.length === 0) return [];

    const groups = new Map<string, EventGroup>();

    for (const event of events) {
      // Crear key única basada en título, descripción y horario
      const key = `${event.title}|${event.description || ''}|${event.startTime}|${event.endTime}`;

      if (groups.has(key)) {
        const group = groups.get(key)!;
        group.events.push(event);
        group.totalParticipants += event.participants?.length || 0;
      } else {
        groups.set(key, {
          key,
          title: event.title,
          description: event.description || '',
          status: event.status,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          capacity: event.capacity,
          events: [event],
          firstEvent: event,
          totalParticipants: event.participants?.length || 0
        });
      }
    }

    // Ordenar eventos dentro de cada grupo por fecha
    for (const group of groups.values()) {
      group.events.sort((a, b) => a.date.localeCompare(b.date));
      group.firstEvent = group.events[0];
    }

    // Devolver grupos ordenados por la primera fecha
    return Array.from(groups.values()).sort((a, b) =>
      a.firstEvent.date.localeCompare(b.firstEvent.date)
    );
  });

  constructor(
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    const status = this.statusFilter() || undefined;

    // Si está autenticado, mostrar solo sus eventos (creados + asignados)
    if (this.authService.isAuthenticated()) {
      this.eventService.getMyEvents().subscribe({
        next: (response) => {
          // getMyEvents puede devolver un array o un objeto {personal, team}
          let allEvents: Event[] = [];
          if (Array.isArray(response)) {
            allEvents = response;
          } else {
            allEvents = [...(response.personal || []), ...(response.team || [])];
          }
          // Filtrar por status si se seleccionó
          if (status) {
            allEvents = allEvents.filter(e => e.status === status);
          }
          this.events.set(allEvents);
          this.loading.set(false);
        },
        error: () => {
          this.events.set([]);
          this.loading.set(false);
        }
      });
    } else {
      // Si no está autenticado, mostrar eventos públicos
      this.eventService.getAll(status).subscribe({
        next: (events) => {
          this.events.set(events ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.events.set([]);
          this.loading.set(false);
        }
      });
    }
  }

  onFilterChange(event: globalThis.Event): void {
    const value = (event.target as HTMLSelectElement).value as EventStatus | '';
    this.statusFilter.set(value);
    this.loadEvents();
  }

  clearFilter(): void {
    this.statusFilter.set('');
    this.loadEvents();
  }

  formatDate(dateStr: string): string {
    if (!dateStr || dateStr.startsWith('0000')) return 'Fecha no definida';
    try {
      // Si viene con T (ISO), extraer solo la parte de fecha
      const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const date = new Date(datePart + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Fecha no definida';
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha no definida';
    }
  }

  formatDateShort(dateStr: string): string {
    if (!dateStr || dateStr.startsWith('0000')) return '—';
    try {
      const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const date = new Date(datePart + 'T00:00:00');
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return '—';
    }
  }

  formatTime(time: string): string {
    if (!time) return '';
    // Handle ISO datetime format (e.g., "0000-01-01T12:00:00Z")
    if (time.includes('T')) {
      const timePart = time.split('T')[1];
      return timePart.substring(0, 5);
    }
    return time.substring(0, 5);
  }

  getFilterLabel(status: string): string {
    switch (status) {
      case 'published': return 'Publicados';
      case 'draft': return 'Borradores';
      case 'cancelled': return 'Cancelados';
      default: return status;
    }
  }

  getStatusLabel(status: EventStatus): string {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  getHeaderClass(status: EventStatus): string {
    switch (status) {
      case 'published': return 'h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500';
      case 'draft': return 'h-1.5 bg-gradient-to-r from-amber-400 to-amber-500';
      case 'cancelled': return 'h-1.5 bg-gradient-to-r from-rose-400 to-rose-500';
      default: return 'h-1.5 bg-gradient-to-r from-slate-400 to-slate-500';
    }
  }

  getStatusClass(status: EventStatus): string {
    switch (status) {
      case 'published':
        return 'px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium';
      case 'draft':
        return 'px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium';
      case 'cancelled':
        return 'px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium';
      default:
        return 'px-2.5 py-1 bg-slate-500/20 text-slate-400 rounded-lg text-xs font-medium';
    }
  }
}
