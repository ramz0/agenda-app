import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '@services/event.service';
import { Event } from '@models/index';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-my-calendar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p class="text-violet-400 text-sm font-medium mb-1">Mi Agenda</p>
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

      <!-- Legend & Filter -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex flex-wrap gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-violet-500 rounded"></span>
            <span class="text-slate-400">Personal</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-emerald-500 rounded"></span>
            <span class="text-slate-400">Asignado</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            (click)="setFilter('all')"
            class="px-4 py-2 rounded-xl text-sm font-medium transition"
            [class]="filter() === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'">
            Todos
          </button>
          <button
            (click)="setFilter('personal')"
            class="px-4 py-2 rounded-xl text-sm font-medium transition"
            [class]="filter() === 'personal' ? 'bg-violet-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'">
            Personal
          </button>
          <button
            (click)="setFilter('team')"
            class="px-4 py-2 rounded-xl text-sm font-medium transition"
            [class]="filter() === 'team' ? 'bg-emerald-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'">
            Equipo
          </button>
        </div>
      </div>

      <!-- Calendar -->
      <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-24">
            <div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
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
                class="min-h-[120px] p-2 border-b border-r border-slate-700/30 transition-colors"
                [class.bg-slate-800/30]="!day.isCurrentMonth"
                [class.hover:bg-slate-700/30]="day.isCurrentMonth"
              >
                <div class="flex justify-between items-center mb-2">
                  <span
                    class="text-sm w-7 h-7 flex items-center justify-center rounded-lg transition"
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
                      [ngClass]="getEventClass(event)"
                      [title]="getEventTitle(event)"
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
        }
      </div>
    </div>
  `
})
export class MyCalendarComponent implements OnInit {
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  currentDate = signal(new Date());
  events = signal<Event[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'personal' | 'team'>('all');

  currentMonthYear = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  filteredEvents = computed(() => {
    const f = this.filter();
    const events = this.events();
    if (f === 'all') return events;
    return events.filter(e => e.type === f);
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

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);

    // Usar getMyEvents() para obtener solo eventos creados o asignados al usuario
    this.eventService.getMyEvents().subscribe({
      next: (response) => {
        let allEvents: Event[] = [];
        if (Array.isArray(response)) {
          allEvents = response;
        } else {
          allEvents = [...(response.personal || []), ...(response.team || [])];
        }
        this.events.set(allEvents);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dateStr = this.formatDate(date);
    const dayEvents = this.filteredEvents().filter(e => e.date.startsWith(dateStr));

    return {
      date,
      isCurrentMonth,
      isToday: date.getTime() === today.getTime(),
      events: dayEvents
    };
  }

  getEventClass(event: Event): { [key: string]: boolean } {
    if (event.type === 'personal' && !event.assignmentStatus) {
      return { 'bg-violet-500/30': true, 'text-violet-300': true, 'border-l-2': true, 'border-violet-500': true };
    }
    // Eventos asignados (team o personal con asignación)
    return { 'bg-emerald-500/30': true, 'text-emerald-300': true, 'border-l-2': true, 'border-emerald-500': true };
  }

  getEventTitle(event: Event): string {
    let title = `${event.title} - ${event.startTime}`;
    if (event.type === 'team' && event.teamName) {
      title += ` (${event.teamName})`;
    }
    return title;
  }

  setFilter(f: 'all' | 'personal' | 'team'): void {
    this.filter.set(f);
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
