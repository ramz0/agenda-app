import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '@services/event.service';
import { AuthService } from '@services/auth.service';
import { Event } from '@models/index';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900">
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0">
          <div class="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-2xl"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span class="text-violet-300 text-sm font-medium">Gestiona tu tiempo inteligentemente</span>
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Organiza tu <span class="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Agenda</span><br>
              de forma inteligente
            </h1>
            <p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Agenda actividades, coordina equipos y nunca pierdas una cita importante.
              La herramienta perfecta para tu productividad.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              @if (!authService.isAuthenticated()) {
                <a routerLink="/auth/register"
                   class="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transform hover:-translate-y-0.5">
                  Comenzar Gratis
                </a>
                <a routerLink="/auth/login"
                   class="px-8 py-4 border-2 border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 hover:border-slate-600 transition">
                  Iniciar Sesión
                </a>
              } @else {
                <a routerLink="/dashboard"
                   class="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition shadow-lg shadow-violet-500/25">
                  Ir al Dashboard
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <p class="text-violet-400 text-sm font-medium mb-2">Características</p>
            <h2 class="text-3xl font-bold text-white mb-4">Todo lo que necesitas</h2>
            <p class="text-slate-400 max-w-2xl mx-auto">
              Una plataforma completa para gestionar tu agenda y equipos de trabajo.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50 hover:border-violet-500/30 transition group">
              <div class="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Calendario Intuitivo</h3>
              <p class="text-slate-400">
                Visualiza toda tu agenda en un calendario claro y fácil de usar.
                Vista mensual con indicadores.
              </p>
            </div>

            <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/30 transition group">
              <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Gestión de Equipos</h3>
              <p class="text-slate-400">
                Crea equipos, asigna miembros y coordina actividades grupales.
                Todos en sincronía.
              </p>
            </div>

            <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50 hover:border-fuchsia-500/30 transition group">
              <div class="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Asignaciones</h3>
              <p class="text-slate-400">
                Recibe notificaciones de asignaciones de equipo.
                Acepta o rechaza según tu disponibilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Upcoming Events Section -->
      @if (upcomingEvents().length > 0) {
        <section class="py-20">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
              <div>
                <p class="text-violet-400 text-sm font-medium mb-2">Explorar</p>
                <h2 class="text-3xl font-bold text-white mb-2">Próximos Agendados</h2>
                <p class="text-slate-400">Descubre lo que está pasando</p>
              </div>
              <a routerLink="/events"
                 class="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition font-medium text-slate-300 hover:text-white">
                Ver todos
              </a>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (event of upcomingEvents().slice(0, 6); track event.id) {
                <a [routerLink]="['/events', event.id]"
                   class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden hover:border-violet-500/50 transition group">
                  <div class="h-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h3 class="font-semibold text-white group-hover:text-violet-300 transition line-clamp-1">
                          {{ event.title }}
                        </h3>
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">
                          {{ event.description || 'Sin descripción' }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-4 text-sm text-slate-400 mt-4">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDate(event.date) }}
                      </div>
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ event.startTime }}
                      </div>
                    </div>

                    <div class="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                      <svg class="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span class="text-sm text-slate-400 truncate">{{ event.location }}</span>
                    </div>
                  </div>
                </a>
              }
            </div>
          </div>
        </section>
      }

      <!-- CTA Section -->
      @if (!authService.isAuthenticated()) {
        <section class="py-20">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-3xl p-12 border border-violet-500/20 text-center relative overflow-hidden">
              <div class="absolute inset-0">
                <div class="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
              </div>
              <div class="relative">
                <h2 class="text-3xl font-bold text-white mb-4">
                  ¿Listo para organizarte mejor?
                </h2>
                <p class="text-slate-300 mb-8 text-lg">
                  Únete ahora y comienza a gestionar tu tiempo de manera eficiente.
                </p>
                <a routerLink="/auth/register"
                   class="inline-block px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition shadow-lg shadow-violet-500/25">
                  Crear cuenta gratuita
                </a>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- Footer -->
      <footer class="py-8 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p class="text-slate-500 text-sm">Agenda App - Gestiona tu tiempo inteligentemente</p>
        </div>
      </footer>
    </div>
  `
})
export class HomeComponent implements OnInit {
  upcomingEvents = signal<Event[]>([]);

  constructor(
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUpcomingEvents();
  }

  loadUpcomingEvents(): void {
    this.eventService.getAll('published').subscribe({
      next: (events) => {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = (events ?? [])
          .filter(e => e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));
        this.upcomingEvents.set(upcoming);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }
}
