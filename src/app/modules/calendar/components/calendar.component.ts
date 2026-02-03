import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../../../models';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p class="text-violet-400 text-sm font-medium mb-1">Calendario</p>
          <h1 class="text-3xl font-bold text-white capitalize">{{ currentMonthYear() }}</h1>
        </div>
        <div class="flex gap-2">
          <button (click)="previousMonth()"
                  class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Anterior
          </button>
          <button (click)="goToToday()"
                  class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition">
            Hoy
          </button>
          <button (click)="nextMonth()"
                  class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition flex items-center gap-2">
            Siguiente
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Calendar -->
      <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
        <!-- Week Days Header -->
        <div class="grid grid-cols-7 bg-slate-800/80">
          @for (day of weekDays; track day) {
            <div class="p-3 text-center text-sm font-medium text-slate-400 border-b border-slate-700/50">
              {{ day }}
            </div>
          }
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7">
          @for (day of calendarDays(); track day.date.toISOString()) {
            <div
              class="min-h-[100px] p-2 border-b border-r border-slate-700/30 transition-colors"
              [class.bg-slate-800/30]="!day.isCurrentMonth"
              [class.hover:bg-slate-700/30]="day.isCurrentMonth"
            >
              <div class="flex justify-between items-center mb-1">
                <span
                  class="text-sm w-7 h-7 flex items-center justify-center rounded-lg"
                  [class.text-slate-500]="!day.isCurrentMonth"
                  [class.text-slate-300]="day.isCurrentMonth && !day.isToday"
                  [class.bg-gradient-to-r]="day.isToday"
                  [class.from-violet-500]="day.isToday"
                  [class.to-fuchsia-500]="day.isToday"
                  [class.text-white]="day.isToday"
                  [class.font-bold]="day.isToday"
                >
                  {{ day.date.getDate() }}
                </span>
              </div>
              <div class="space-y-1">
                @for (event of day.events.slice(0, 3); track event.id) {
                  <a
                    [routerLink]="['/events', event.id]"
                    class="block text-xs p-1.5 rounded-lg truncate transition-all hover:scale-105"
                    [class.bg-emerald-500/30]="event.status === 'published'"
                    [class.text-emerald-300]="event.status === 'published'"
                    [class.border-l-2]="true"
                    [class.border-emerald-500]="event.status === 'published'"
                    [class.bg-amber-500/30]="event.status === 'draft'"
                    [class.text-amber-300]="event.status === 'draft'"
                    [class.border-amber-500]="event.status === 'draft'"
                    [title]="event.title + ' - ' + event.startTime"
                  >
                    {{ event.title }}
                  </a>
                }
                @if (day.events.length > 3) {
                  <p class="text-xs text-slate-500 pl-1">
                    +{{ day.events.length - 3 }} más
                  </p>
                }
              </div>
            </div>
          }
        </div>
      </div>

      @if (selectedEvent()) {
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
             (click)="selectedEvent.set(null)">
          <div class="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full mx-4 p-6" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold text-white mb-2">{{ selectedEvent()!.title }}</h3>
            <p class="text-slate-400 mb-4">{{ selectedEvent()!.description }}</p>
            <div class="space-y-2 text-sm text-slate-300 mb-6">
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ selectedEvent()!.date | date:'fullDate' }}
              </p>
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ selectedEvent()!.startTime }} - {{ selectedEvent()!.endTime }}
              </p>
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                {{ selectedEvent()!.location }}
              </p>
            </div>
            <div class="flex justify-end gap-3">
              <button (click)="selectedEvent.set(null)" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition">Cerrar</button>
              <a [routerLink]="['/events', selectedEvent()!.id]" class="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition">Ver detalles</a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CalendarComponent implements OnInit {
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  currentDate = signal(new Date());
  events = signal<Event[]>([]);
  selectedEvent = signal<Event | null>(null);

  currentMonthYear = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(this.createCalendarDay(d, false, today));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createCalendarDay(d, true, today));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(d, false, today));
    }

    return days;
  });

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // Si está autenticado, mostrar solo sus eventos (creados + asignados)
    if (this.authService.isAuthenticated()) {
      this.eventService.getMyEvents().subscribe({
        next: (response) => {
          let allEvents: Event[] = [];
          if (Array.isArray(response)) {
            allEvents = response;
          } else {
            allEvents = [...(response.personal || []), ...(response.team || [])];
          }
          this.events.set(allEvents);
        }
      });
    } else {
      // Si no está autenticado, mostrar eventos publicados en el rango
      const date = this.currentDate();
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const startStr = this.formatDate(start);
      const endStr = this.formatDate(end);

      this.eventService.getCalendar(startStr, endStr).subscribe({
        next: (events) => this.events.set(events)
      });
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dateStr = this.formatDate(date);
    const dayEvents = this.events().filter(e => e.date.startsWith(dateStr));

    return {
      date,
      isCurrentMonth,
      isToday: date.getTime() === today.getTime(),
      events: dayEvents
    };
  }

  previousMonth(): void {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    this.loadEvents();
  }

  nextMonth(): void {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    this.loadEvents();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadEvents();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
