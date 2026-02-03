import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssignmentService } from '@services/assignment.service';
import { EventAssignmentWithDetails, AssignmentStatus } from '@models/index';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="mb-8">
        <p class="text-violet-400 text-sm font-medium mb-1">Gestión</p>
        <h1 class="text-3xl font-bold text-white">Mis Asignaciones</h1>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <button
          (click)="filterByStatus(undefined)"
          [class]="getFilterClass(undefined)"
          class="px-4 py-2 rounded-xl font-medium transition">
          Todas
        </button>
        <button
          (click)="filterByStatus('pending')"
          [class]="getFilterClass('pending')"
          class="px-4 py-2 rounded-xl font-medium transition">
          Pendientes
        </button>
        <button
          (click)="filterByStatus('approved')"
          [class]="getFilterClass('approved')"
          class="px-4 py-2 rounded-xl font-medium transition">
          Aprobadas
        </button>
        <button
          (click)="filterByStatus('rejected')"
          [class]="getFilterClass('rejected')"
          class="px-4 py-2 rounded-xl font-medium transition">
          Rechazadas
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
        </div>
      } @else if (assignments().length === 0) {
        <div class="text-center py-12 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50">
          <div class="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-slate-400">No tienes asignaciones</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (assignment of assignments(); track assignment.id) {
            <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-5">
              <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h3 class="font-semibold text-lg text-white">{{ assignment.eventTitle }}</h3>
                  <div class="flex items-center gap-4 mt-2 text-sm">
                    <span class="text-slate-400 flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {{ assignment.eventDate | date:'dd/MM/yyyy' }}
                    </span>
                    <span class="text-slate-500 text-xs">
                      Asignado: {{ assignment.assignedAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                  @switch (assignment.status) {
                    @case ('pending') {
                      <span class="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium">
                        Pendiente
                      </span>
                      <div class="flex gap-2">
                        <button
                          (click)="respond(assignment.eventId, 'approved')"
                          [disabled]="responding()"
                          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 text-sm font-medium transition">
                          Aprobar
                        </button>
                        <button
                          (click)="respond(assignment.eventId, 'rejected')"
                          [disabled]="responding()"
                          class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl disabled:opacity-50 text-sm font-medium transition">
                          Rechazar
                        </button>
                      </div>
                    }
                    @case ('approved') {
                      <span class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Aprobada
                      </span>
                    }
                    @case ('rejected') {
                      <span class="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        Rechazada
                      </span>
                    }
                  }
                </div>
              </div>
              @if (assignment.respondedAt) {
                <p class="text-slate-500 text-xs mt-4 pt-3 border-t border-slate-700/50">
                  Respondido: {{ assignment.respondedAt | date:'dd/MM/yyyy HH:mm' }}
                </p>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AssignmentListComponent implements OnInit {
  assignments = signal<EventAssignmentWithDetails[]>([]);
  loading = signal(true);
  responding = signal(false);
  currentFilter = signal<AssignmentStatus | undefined>(undefined);

  constructor(private assignmentService: AssignmentService) {}

  ngOnInit() {
    this.loadAssignments();
  }

  loadAssignments() {
    this.loading.set(true);
    this.assignmentService.getMyAssignments(this.currentFilter()).subscribe({
      next: (assignments) => {
        this.assignments.set(assignments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  filterByStatus(status: AssignmentStatus | undefined) {
    this.currentFilter.set(status);
    this.loadAssignments();
  }

  getFilterClass(status: AssignmentStatus | undefined): string {
    const isActive = this.currentFilter() === status;
    return isActive
      ? 'bg-violet-600 text-white'
      : 'bg-slate-800 text-slate-400 hover:bg-slate-700';
  }

  respond(eventId: string, status: 'approved' | 'rejected') {
    this.responding.set(true);
    this.assignmentService.respond(eventId, { status }).subscribe({
      next: () => {
        this.responding.set(false);
        this.loadAssignments();
      },
      error: () => {
        this.responding.set(false);
      }
    });
  }
}
