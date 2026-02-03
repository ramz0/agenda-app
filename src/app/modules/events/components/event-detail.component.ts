import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventService } from '@services/event.service';
import { AuthService } from '@services/auth.service';
import { Event } from '@models/index';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      @if (loading()) {
        <div class="text-center py-12">
          <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400">Cargando...</p>
        </div>
      } @else if (!event()) {
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-slate-400 mb-4">No encontrado</p>
          <a routerLink="/events" class="text-violet-400 hover:text-violet-300 transition">Volver</a>
        </div>
      } @else {
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl font-bold text-white mb-3">{{ event()!.title }}</h1>
              <div class="flex gap-2 items-center flex-wrap">
                <span [class]="getStatusClass(event()!.status)">{{ getStatusLabel(event()!.status) }}</span>
                @if (event()!.type === 'team') {
                  <span class="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg text-xs font-medium">
                    Equipo: {{ event()!.teamName }}
                  </span>
                } @else {
                  <span class="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-lg text-xs font-medium">
                    Personal
                  </span>
                }
              </div>
            </div>
            <div class="flex gap-2">
              @if (canEdit()) {
                <a [routerLink]="['/events', event()!.id, 'edit']"
                   class="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-slate-300 hover:text-white transition">
                  Editar
                </a>
              }
              @if (authService.isAdmin()) {
                <button (click)="deleteEvent()"
                        class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition">
                  Eliminar
                </button>
              }
            </div>
          </div>

          <div class="mb-6">
            <p class="text-slate-300">{{ event()!.description || 'Sin descripción' }}</p>
          </div>

          <!-- Participants Section -->
          @if (event()!.participants && event()!.participants!.length > 0) {
            <div class="mb-6 space-y-6">
              <!-- Ponentes -->
              @if (getSpeakers().length > 0) {
                <div>
                  <h3 class="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <div class="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                      </svg>
                    </div>
                    Ponentes ({{ getSpeakers().length }})
                  </h3>
                  <div class="flex flex-wrap gap-3">
                    @for (participant of getSpeakers(); track participant.userId) {
                      <div class="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-medium">
                          {{ (participant.userName || 'U').charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-medium text-white">{{ participant.userName || 'Usuario' }}</p>
                          @if (participant.userEmail) {
                            <p class="text-sm text-slate-400">{{ participant.userEmail }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Asistentes -->
              @if (getAssistants().length > 0) {
                <div>
                  <h3 class="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <div class="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                      </svg>
                    </div>
                    Asistentes ({{ getAssistants().length }})
                  </h3>
                  <div class="flex flex-wrap gap-3">
                    @for (participant of getAssistants(); track participant.userId) {
                      <div class="flex items-center gap-3 px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {{ (participant.userName || 'U').charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-medium text-white">{{ participant.userName || 'Usuario' }}</p>
                          @if (participant.userEmail) {
                            <p class="text-sm text-slate-400">{{ participant.userEmail }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Participantes -->
              @if (getParticipants().length > 0) {
                <div>
                  <h3 class="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    Participantes ({{ getParticipants().length }})
                  </h3>
                  <div class="flex flex-wrap gap-3">
                    @for (participant of getParticipants(); track participant.userId) {
                      <div class="flex items-center gap-3 px-4 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium">
                          {{ (participant.userName || 'U').charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-medium text-white">{{ participant.userName || 'Usuario' }}</p>
                          @if (participant.userEmail) {
                            <p class="text-sm text-slate-400">{{ participant.userEmail }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/30 rounded-xl p-5 space-y-4">
              <h3 class="font-semibold text-lg text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Detalles
              </h3>
              <div class="space-y-3 text-slate-300">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span>{{ event()!.date | date:'fullDate' }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span>{{ formatTime(event()!.startTime) }} - {{ formatTime(event()!.endTime) }}</span>
                </div>
                @if (event()!.location) {
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                    </div>
                    <span>{{ event()!.location }}</span>
                  </div>
                }
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div class="flex flex-wrap gap-2 text-sm">
                    @if (getSpeakers().length > 0) {
                      <span class="text-amber-400">{{ getSpeakers().length }} ponente{{ getSpeakers().length > 1 ? 's' : '' }}</span>
                    }
                    @if (getAssistants().length > 0) {
                      <span class="text-violet-400">{{ getAssistants().length }} asistente{{ getAssistants().length > 1 ? 's' : '' }}</span>
                    }
                    @if (getParticipants().length > 0) {
                      <span class="text-cyan-400">{{ getParticipants().length }} participante{{ getParticipants().length > 1 ? 's' : '' }}</span>
                    }
                    @if (!event()!.participants?.length) {
                      <span class="text-slate-400">Sin participantes</span>
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        <div class="mt-6">
          <a routerLink="/events" class="text-violet-400 hover:text-violet-300 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver
          </a>
        </div>
      }
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  event = signal<Event | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
    }
  }

  loadEvent(id: string): void {
    this.eventService.getById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  deleteEvent(): void {
    if (!confirm('¿Estás seguro de eliminar?')) return;

    const eventId = this.event()?.id;
    if (!eventId) return;

    this.eventService.delete(eventId).subscribe({
      next: () => this.router.navigate(['/events'])
    });
  }

  canEdit(): boolean {
    const event = this.event();
    if (!event) return false;
    // Solo el creador puede editar
    return event.createdBy === this.authService.user()?.id;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published': return 'px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium';
      case 'draft': return 'px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium';
      case 'cancelled': return 'px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium';
      default: return 'px-3 py-1 bg-slate-500/20 text-slate-400 rounded-lg text-xs font-medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  formatTime(time: string): string {
    if (!time) return '';
    // Handle ISO datetime format (e.g., "0000-01-01T12:00:00Z")
    if (time.includes('T')) {
      const timePart = time.split('T')[1];
      return timePart.substring(0, 5); // Get HH:mm
    }
    // Handle simple time format (e.g., "12:00")
    return time.substring(0, 5);
  }

  getSpeakers() {
    return this.event()?.participants?.filter(p => p.role === 'speaker') || [];
  }

  getAssistants() {
    return this.event()?.participants?.filter(p => p.role === 'attendee') || [];
  }

  getParticipants() {
    return this.event()?.participants?.filter(p => p.role === 'participant' || !p.role) || [];
  }
}
