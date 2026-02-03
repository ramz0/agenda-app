import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@services/event.service';
import { TeamService } from '@services/team.service';
import { UserService } from '@services/user.service';
import { AuthService } from '@services/auth.service';
import { Team, User } from '@models/index';

interface EventTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  duration: number;
  description: string;
}

interface WeekDay {
  id: number;
  short: string;
  name: string;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white">
      <!-- Progress Bar -->
      <div class="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div class="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
             [style.width.%]="progress()"></div>
      </div>

      <!-- Close Button -->
      <button (click)="goBack()"
              class="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur flex items-center justify-center hover:bg-slate-700 transition group">
        <svg class="w-5 h-5 text-slate-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="max-w-2xl mx-auto px-6 py-16">

        @if (error()) {
          <div class="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-shake">
            <span class="text-red-400">{{ error() }}</span>
          </div>
        }

        <!-- Step 1: Template Selection -->
        @if (currentStep() === 1) {
          <div class="animate-fadeIn">
            <p class="text-violet-400 text-sm font-medium mb-2">Paso 1 de 3</p>
            <h1 class="text-4xl font-bold mb-2">¿Qué vas a agendar?</h1>
            <p class="text-slate-400 mb-10">Selecciona una plantilla o empieza desde cero</p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              @for (template of templates; track template.id) {
                <button (click)="selectTemplate(template)"
                        class="group relative p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden"
                        [class]="selectedTemplate()?.id === template.id
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'">
                  <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       [style.background]="'radial-gradient(circle at 50% 50%, ' + template.color + '15, transparent 70%)'"></div>
                  <div class="relative">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300"
                         [style.background]="template.bgColor">
                      <span class="text-xl">{{ template.icon }}</span>
                    </div>
                    <h3 class="font-semibold text-base mb-0.5">{{ template.name }}</h3>
                    <p class="text-xs text-slate-400 line-clamp-1">{{ template.description }}</p>
                    @if (selectedTemplate()?.id === template.id) {
                      <div class="absolute top-0 right-0 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    }
                  </div>
                </button>
              }
            </div>

            <button (click)="nextStep()"
                    [disabled]="!selectedTemplate()"
                    class="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                    [class]="selectedTemplate()
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'">
              Continuar
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </button>
          </div>
        }

        <!-- Step 2: Event Details -->
        @if (currentStep() === 2) {
          <div class="animate-fadeIn">
            <button (click)="prevStep()" class="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Atrás
            </button>

            <p class="text-violet-400 text-sm font-medium mb-2">Paso 2 de 3</p>
            <h1 class="text-4xl font-bold mb-2">Detalles</h1>
            <p class="text-slate-400 mb-10">Cuéntanos más sobre lo que vas a agendar</p>

            <form [formGroup]="form" class="space-y-6">
              <div class="relative">
                <input type="text" formControlName="title"
                       class="w-full bg-transparent border-0 border-b-2 border-slate-700 focus:border-violet-500
                              text-3xl font-semibold py-4 px-0 focus:ring-0 transition-colors placeholder-slate-600"
                       placeholder="Nombre del evento"
                       maxlength="100"/>
                <span class="absolute right-0 bottom-4 text-xs text-slate-500">
                  {{ form.get('title')?.value?.length || 0 }}/100
                </span>
              </div>

              <div>
                <label class="block text-sm text-slate-400 mb-2">Descripción (opcional)</label>
                <textarea formControlName="description"
                          rows="3"
                          class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3
                                 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition resize-none
                                 placeholder-slate-500"
                          placeholder="Agrega notas o detalles..."></textarea>
              </div>

              @if (authService.isAdmin()) {
                <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <label class="block text-sm text-slate-400 mb-3">Tipo</label>
                  <div class="flex gap-3">
                    <button type="button" (click)="form.get('type')?.setValue('personal')"
                            class="flex-1 py-3 rounded-xl font-medium transition-all"
                            [class]="form.get('type')?.value === 'personal'
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'">
                      Personal
                    </button>
                    <button type="button" (click)="form.get('type')?.setValue('team')"
                            class="flex-1 py-3 rounded-xl font-medium transition-all"
                            [class]="form.get('type')?.value === 'team'
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'">
                      Equipo
                    </button>
                  </div>
                  @if (form.get('type')?.value === 'team') {
                    <select formControlName="teamId"
                            class="mt-3 w-full bg-slate-700 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500">
                      <option value="">Seleccionar equipo...</option>
                      @for (team of teams(); track team.id) {
                        <option [value]="team.id">{{ team.name }}</option>
                      }
                    </select>
                  }
                </div>
              }

              <button type="button" (click)="nextStep()"
                      [disabled]="!form.get('title')?.value"
                      class="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                      [class]="form.get('title')?.value
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'">
                Continuar
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>
            </form>
          </div>
        }

        <!-- Step 3: Date & Time -->
        @if (currentStep() === 3) {
          <div class="animate-fadeIn">
            <button (click)="prevStep()" class="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Atrás
            </button>

            <p class="text-violet-400 text-sm font-medium mb-2">Paso 3 de 3</p>
            <h1 class="text-4xl font-bold mb-2">¿Cuándo será?</h1>
            <p class="text-slate-400 mb-10">Configura fecha, hora y repetición</p>

            <form [formGroup]="form" class="space-y-8">

              <!-- Date Selection -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-sm text-slate-400">
                    {{ recurrenceEnabled() ? 'Fecha de inicio' : 'Fecha' }}
                  </label>
                  <!-- Recurrence Toggle inline -->
                  <button type="button" (click)="toggleRecurrence()"
                          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm"
                          [class]="recurrenceEnabled()
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    {{ recurrenceEnabled() ? 'Repetir: ON' : 'Repetir' }}
                  </button>
                </div>

                <div class="flex gap-2 overflow-x-auto pb-2">
                  @for (day of nextDays; track day.date) {
                    <button type="button" (click)="selectDate(day.date)"
                            class="flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all"
                            [class]="form.get('date')?.value === day.date
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700'">
                      <p class="text-xs text-slate-400" [class.text-violet-200]="form.get('date')?.value === day.date">{{ day.label }}</p>
                      <p class="text-xl font-bold">{{ day.day }}</p>
                    </button>
                  }
                  <button type="button" (click)="showDatePicker()"
                          class="flex-shrink-0 w-16 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex flex-col items-center justify-center">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p class="text-xs text-slate-400 mt-1">Otra</p>
                  </button>
                </div>
                <input #datePicker type="date" formControlName="date" class="sr-only" (change)="onDateChange($event)"/>
              </div>

              <!-- Recurrence Options (shows when enabled) -->
              @if (recurrenceEnabled()) {
                <div class="space-y-4 animate-fadeIn">
                  <label class="text-sm text-slate-400">¿Qué días se repite?</label>
                  <div class="flex gap-2">
                    @for (day of weekDays; track day.id) {
                      <button type="button" (click)="toggleDay(day.id)"
                              class="w-11 h-11 rounded-xl text-sm font-bold transition-all"
                              [class]="selectedDays().includes(day.id)
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700'">
                        {{ day.short }}
                      </button>
                    }
                  </div>

                  <!-- Quick presets -->
                  <div class="flex gap-2">
                    <button type="button" (click)="setRecurrenceType('weekdays')"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-slate-800 hover:bg-slate-700 text-slate-400">
                      Lun-Vie
                    </button>
                    <button type="button" (click)="setRecurrenceType('daily')"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-slate-800 hover:bg-slate-700 text-slate-400">
                      Todos
                    </button>
                  </div>

                  <div class="flex items-center gap-4">
                    <label class="text-sm text-slate-400">Por</label>
                    <div class="flex gap-2">
                      @for (weeks of recurrenceWeeksOptions; track weeks) {
                        <button type="button" (click)="setRecurrenceWeeks(weeks)"
                                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                [class]="recurrenceWeeks() === weeks
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700'">
                          {{ weeks === 0 ? 'Siempre' : weeks + ' sem' }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Time Selection -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-slate-400 mb-3">Hora de inicio</label>
                  <div class="grid grid-cols-3 gap-2">
                    @for (time of timeSlots; track time) {
                      <button type="button" (click)="selectStartTime(time)"
                              class="py-2.5 rounded-lg text-sm font-medium transition-all"
                              [class]="form.get('startTime')?.value === time
                                ? 'bg-violet-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700'">
                        {{ time }}
                      </button>
                    }
                  </div>
                  <input type="time" formControlName="startTime"
                         class="mt-3 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"/>
                </div>

                <div>
                  <label class="block text-sm text-slate-400 mb-3">Duración</label>
                  <div class="grid grid-cols-2 gap-2">
                    @for (d of durations; track d.value) {
                      <button type="button" (click)="setDuration(d.value)"
                              class="py-2.5 rounded-lg text-sm font-medium transition-all"
                              [class]="selectedDuration() === d.value
                                ? 'bg-fuchsia-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700'">
                        {{ d.label }}
                      </button>
                    }
                  </div>
                  <p class="mt-3 text-center text-slate-400">
                    Termina a las <span class="text-white font-semibold">{{ form.get('endTime')?.value || '--:--' }}</span>
                  </p>
                </div>
              </div>

              <!-- Status & Capacity Row -->
              <div class="flex gap-4">
                <div class="flex-1 p-4 bg-slate-800/50 rounded-xl">
                  <label class="block text-sm text-slate-400 mb-2">Estado</label>
                  <div class="flex rounded-lg overflow-hidden">
                    <button type="button" (click)="form.get('status')?.setValue('draft')"
                            class="flex-1 py-2 text-sm font-medium transition-all"
                            [class]="form.get('status')?.value === 'draft' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'">
                      Borrador
                    </button>
                    <button type="button" (click)="form.get('status')?.setValue('published')"
                            class="flex-1 py-2 text-sm font-medium transition-all"
                            [class]="form.get('status')?.value === 'published' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'">
                      Publicar
                    </button>
                  </div>
                </div>

                <div class="flex-1 p-4 bg-slate-800/50 rounded-xl">
                  <label class="block text-sm text-slate-400 mb-2">Capacidad</label>
                  <div class="flex items-center justify-center gap-4">
                    <button type="button" (click)="decrementCapacity()"
                            class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                      </svg>
                    </button>
                    <span class="text-2xl font-bold w-12 text-center">{{ form.get('capacity')?.value || '∞' }}</span>
                    <button type="button" (click)="incrementCapacity()"
                            class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Participants Section -->
              <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <button type="button" (click)="toggleParticipantsSection()"
                        class="w-full flex items-center justify-between text-left">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-white">Participantes</span>
                      @if (selectedParticipants().length > 0) {
                        <span class="ml-2 text-xs text-cyan-400">({{ selectedParticipants().length }})</span>
                      }
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-slate-400 transition-transform"
                       [class.rotate-180]="showParticipantsSection()"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (showParticipantsSection()) {
                  <div class="mt-4 space-y-3 animate-fadeIn">
                    <!-- Search Users -->
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <input type="text"
                             [(ngModel)]="userSearchQuery"
                             [ngModelOptions]="{standalone: true}"
                             (input)="searchUsers()"
                             placeholder="Buscar usuario por nombre o email..."
                             class="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-slate-500"/>
                      @if (searchingUsers()) {
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg class="w-4 h-4 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        </div>
                      }
                    </div>

                    <!-- Search Results -->
                    @if (userSearchResults().length > 0) {
                      <div class="bg-slate-700/50 rounded-lg border border-slate-600 max-h-48 overflow-y-auto">
                        @for (user of userSearchResults(); track user.id) {
                          <button type="button" (click)="addParticipant(user)"
                                  [disabled]="isUserSelected(user.id)"
                                  class="w-full flex items-center gap-3 p-3 hover:bg-slate-600/50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {{ user.name.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-white truncate">{{ user.name }}</p>
                              <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
                            </div>
                            @if (isUserSelected(user.id)) {
                              <span class="text-xs text-cyan-400">Agregado</span>
                            } @else {
                              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                              </svg>
                            }
                          </button>
                        }
                      </div>
                    }

                    <!-- Selected Participants -->
                    @if (selectedParticipants().length > 0) {
                      <div class="space-y-2">
                        <p class="text-xs text-slate-400 font-medium">Participantes seleccionados:</p>
                        <div class="flex flex-wrap gap-2">
                          @for (user of selectedParticipants(); track user.id) {
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                              <span class="text-sm text-cyan-300">{{ user.name }}</span>
                              <button type="button" (click)="removeParticipant(user.id)"
                                      class="hover:text-white transition">
                                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <p class="text-xs text-slate-500">Busca y agrega usuarios para que vean esto en su agenda</p>
                  </div>
                }
              </div>

              <!-- Summary Card -->
              <div class="p-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-2xl border border-violet-500/30">
                <div class="flex items-start gap-4">
                  <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                       [style.background]="selectedTemplate()?.bgColor">
                    {{ selectedTemplate()?.icon }}
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold">{{ form.get('title')?.value }}</h3>
                    <p class="text-slate-400 mt-1">
                      {{ formatDateDisplay(form.get('date')?.value) }} ·
                      {{ form.get('startTime')?.value || '--:--' }} - {{ form.get('endTime')?.value || '--:--' }}
                    </p>
                    @if (recurrenceEnabled()) {
                      <p class="text-cyan-400 text-sm mt-1 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        {{ getRecurrenceSummary() }}
                      </p>
                    }
                    @if (form.get('description')?.value) {
                      <p class="text-slate-500 text-sm mt-2 line-clamp-2">{{ form.get('description')?.value }}</p>
                    }
                    @if (selectedParticipants().length > 0) {
                      <div class="flex items-center gap-2 mt-2">
                        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span class="text-cyan-400 text-sm">{{ selectedParticipants().length }} participante{{ selectedParticipants().length > 1 ? 's' : '' }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Submit -->
              <button type="button" (click)="onSubmit()"
                      [disabled]="loading() || !isFormValid()"
                      class="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                      [class]="isFormValid() && !loading()
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'">
                @if (loading()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ recurrenceEnabled() ? 'Agendando...' : 'Agendando...' }}
                } @else {
                  <span>{{ isEdit() ? 'Guardar cambios' : 'Agendar' }}</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                }
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.3s ease-in-out; }
  `]
})
export class EventFormComponent implements OnInit {
  form: FormGroup;
  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  eventId: string | null = null;
  teams = signal<Team[]>([]);

  currentStep = signal(1);
  selectedTemplate = signal<EventTemplate | null>(null);
  selectedDuration = signal<number>(60);

  // Recurrence
  recurrenceEnabled = signal(false);
  selectedRecurrenceType = signal<string>('custom');
  selectedDays = signal<number[]>([]);
  recurrenceWeeks = signal<number>(4);

  // Participants
  showParticipantsSection = signal(false);
  selectedParticipants = signal<User[]>([]);
  userSearchQuery = '';
  userSearchResults = signal<User[]>([]);
  searchingUsers = signal(false);

  templates: EventTemplate[] = [
    { id: 'meeting', name: 'Reunión', icon: '👥', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.2)', duration: 60, description: 'Junta con tu equipo' },
    { id: 'conference', name: 'Conferencia', icon: '🎤', color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.2)', duration: 90, description: 'Webinar o presentación' },
    { id: 'training', name: 'Capacitación', icon: '📚', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.2)', duration: 120, description: 'Curso o taller' },
    { id: 'call', name: 'Llamada', icon: '📞', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.2)', duration: 30, description: 'Llamada rápida' },
    { id: 'interview', name: 'Entrevista', icon: '🤝', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.2)', duration: 45, description: 'Entrevista o 1:1' },
    { id: 'task', name: 'Tarea', icon: '✅', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.2)', duration: 120, description: 'Tiempo para trabajar' },
    { id: 'appointment', name: 'Cita', icon: '📅', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.2)', duration: 60, description: 'Cita médica u otra' },
    { id: 'social', name: 'Social', icon: '🎉', color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.2)', duration: 180, description: 'Evento o celebración' },
    { id: 'reminder', name: 'Recordatorio', icon: '🔔', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.2)', duration: 15, description: 'No olvides algo' },
    { id: 'break', name: 'Descanso', icon: '☕', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.2)', duration: 15, description: 'Toma un respiro' },
    { id: 'other', name: 'Otro', icon: '📌', color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.2)', duration: 60, description: 'Personalizado' }
  ];

  recurrenceTypes = [
    { id: 'daily', label: 'Todos los días' },
    { id: 'weekdays', label: 'Entre semana' },
    { id: 'custom', label: 'Elegir días' }
  ];

  weekDays: WeekDay[] = [
    { id: 0, short: 'D', name: 'Domingo' },
    { id: 1, short: 'L', name: 'Lunes' },
    { id: 2, short: 'M', name: 'Martes' },
    { id: 3, short: 'X', name: 'Miércoles' },
    { id: 4, short: 'J', name: 'Jueves' },
    { id: 5, short: 'V', name: 'Viernes' },
    { id: 6, short: 'S', name: 'Sábado' }
  ];

  recurrenceWeeksOptions = [4, 8, 12, 0]; // 0 = forever (52 weeks)

  durations = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hora', value: 60 },
    { label: '2 horas', value: 120 }
  ];

  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  nextDays: { date: string; day: number; label: string }[] = [];
  progress = signal(33);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private teamService: TeamService,
    private userService: UserService,
    public authService: AuthService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      capacity: [null],
      status: ['draft'],
      type: ['personal'],
      teamId: ['']
    });

    this.form.get('type')?.valueChanges.subscribe(type => {
      const teamIdControl = this.form.get('teamId');
      if (type === 'team') {
        teamIdControl?.setValidators(Validators.required);
      } else {
        teamIdControl?.clearValidators();
        teamIdControl?.setValue('');
      }
      teamIdControl?.updateValueAndValidity();
    });

    this.generateNextDays();
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEdit.set(true);
      this.loadEvent(this.eventId);
      this.currentStep.set(3);
      this.selectedTemplate.set(this.templates[5]);
    }

    if (this.authService.isAdmin()) {
      this.loadTeams();
    }
  }

  generateNextDays(): void {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      let label = days[date.getDay()];
      if (i === 0) label = 'Hoy';
      if (i === 1) label = 'Mañana';

      this.nextDays.push({ date: dateStr, day: date.getDate(), label });
    }

    this.form.get('date')?.setValue(this.nextDays[0].date);
  }

  loadTeams(): void {
    this.teamService.getAll().subscribe({
      next: (teams) => this.teams.set(teams),
      error: () => {}
    });
  }

  loadEvent(id: string): void {
    this.eventService.getById(id).subscribe({
      next: (event) => {
        this.form.patchValue({
          title: event.title,
          description: event.description,
          date: event.date.split('T')[0],
          startTime: this.formatTimeForInput(event.startTime),
          endTime: this.formatTimeForInput(event.endTime),
          capacity: event.capacity,
          status: event.status,
          type: event.type,
          teamId: event.teamId || ''
        });
        // Load participants if available
        if (event.participants && event.participants.length > 0) {
          const users: User[] = event.participants.map(p => ({
            id: p.userId,
            name: p.userName || 'Usuario',
            email: p.userEmail || '',
            role: 'user' as const,
            createdAt: ''
          }));
          this.selectedParticipants.set(users);
          this.showParticipantsSection.set(true);
        }
      },
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  formatTimeForInput(time: string): string {
    if (!time) return '';
    if (time.includes('T')) return time.split('T')[1].substring(0, 5);
    return time.substring(0, 5);
  }

  selectTemplate(template: EventTemplate): void {
    this.selectedTemplate.set(template);
    this.selectedDuration.set(template.duration);
  }

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(v => v + 1);
      this.progress.set(this.currentStep() * 33);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
      this.progress.set(this.currentStep() * 33);
    }
  }

  // Recurrence methods
  toggleRecurrence(): void {
    this.recurrenceEnabled.update(v => !v);
    if (this.recurrenceEnabled() && this.selectedDays().length === 0) {
      // Default to current day
      const today = new Date().getDay();
      this.selectedDays.set([today]);
    }
  }

  setRecurrenceType(type: string): void {
    this.selectedRecurrenceType.set(type);
    if (type === 'weekdays') {
      this.selectedDays.set([1, 2, 3, 4, 5]);
    } else if (type === 'daily') {
      this.selectedDays.set([0, 1, 2, 3, 4, 5, 6]);
    }
  }

  toggleDay(dayId: number): void {
    const current = this.selectedDays();
    if (current.includes(dayId)) {
      this.selectedDays.set(current.filter(d => d !== dayId));
    } else {
      this.selectedDays.set([...current, dayId].sort());
    }
  }

  setRecurrenceWeeks(weeks: number): void {
    this.recurrenceWeeks.set(weeks);
  }

  getRecurrenceSummary(): string {
    if (!this.recurrenceEnabled()) return '';

    const days = this.selectedDays();
    const weeks = this.recurrenceWeeks();
    const weeksText = weeks === 0 ? 'siempre' : `${weeks} sem`;

    if (days.length === 0) return '';
    if (days.length === 7) return `Diario · ${weeksText}`;
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return `Lun-Vie · ${weeksText}`;

    const dayNames = days.map(d => this.weekDays.find(w => w.id === d)?.short).join(', ');
    return `${dayNames} · ${weeksText}`;
  }

  // Participant methods
  toggleParticipantsSection(): void {
    this.showParticipantsSection.update(v => !v);
  }

  searchUsers(): void {
    const query = this.userSearchQuery.trim();
    if (query.length < 2) {
      this.userSearchResults.set([]);
      return;
    }

    this.searchingUsers.set(true);
    this.userService.search(query).subscribe({
      next: (users) => {
        this.userSearchResults.set(users);
        this.searchingUsers.set(false);
      },
      error: () => {
        this.userSearchResults.set([]);
        this.searchingUsers.set(false);
      }
    });
  }

  addParticipant(user: User): void {
    if (this.isUserSelected(user.id)) return;
    this.selectedParticipants.update(list => [...list, user]);
    this.userSearchQuery = '';
    this.userSearchResults.set([]);
  }

  removeParticipant(userId: string): void {
    this.selectedParticipants.update(list => list.filter(u => u.id !== userId));
  }

  isUserSelected(userId: string): boolean {
    return this.selectedParticipants().some(u => u.id === userId);
  }

  selectDate(date: string): void {
    this.form.get('date')?.setValue(date);
  }

  showDatePicker(): void {
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    input?.showPicker();
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get('date')?.setValue(input.value);
  }

  selectStartTime(time: string): void {
    this.form.get('startTime')?.setValue(time);
    this.calculateEndTime();
  }

  setDuration(minutes: number): void {
    this.selectedDuration.set(minutes);
    this.calculateEndTime();
  }

  calculateEndTime(): void {
    const startTime = this.form.get('startTime')?.value;
    if (startTime) {
      const [hours, mins] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, mins, 0, 0);
      const endDate = new Date(startDate.getTime() + this.selectedDuration() * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      this.form.get('endTime')?.setValue(endTime);
    }
  }

  incrementCapacity(): void {
    const current = this.form.get('capacity')?.value || 0;
    this.form.get('capacity')?.setValue(current + 1);
  }

  decrementCapacity(): void {
    const current = this.form.get('capacity')?.value;
    if (current && current > 1) {
      this.form.get('capacity')?.setValue(current - 1);
    } else {
      this.form.get('capacity')?.setValue(null);
    }
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
  }

  isFormValid(): boolean {
    const valid = !!(
      this.form.get('title')?.value &&
      this.form.get('date')?.value &&
      this.form.get('startTime')?.value &&
      this.form.get('endTime')?.value
    );

    if (this.recurrenceEnabled() && this.selectedDays().length === 0) {
      return false;
    }

    return valid;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.error.set('');

    const baseData = { ...this.form.value };
    if (!baseData.capacity) delete baseData.capacity;
    if (!baseData.teamId) delete baseData.teamId;
    if (this.selectedParticipants().length > 0) {
      baseData.participantIds = this.selectedParticipants().map(u => u.id);
    }

    if (this.recurrenceEnabled()) {
      // Create recurring events
      this.createRecurringEvents(baseData);
    } else {
      // Create single event
      const request = this.isEdit()
        ? this.eventService.update(this.eventId!, baseData)
        : this.eventService.create(baseData);

      request.subscribe({
        next: (event) => this.router.navigate(['/events', event.id]),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.error || 'Error al guardar');
        }
      });
    }
  }

  createRecurringEvents(baseData: any): void {
    const startDate = new Date(baseData.date + 'T12:00:00');
    const weeks = this.recurrenceWeeks() || 52; // Default to 1 year if "Siempre"
    const selectedDays = this.selectedDays();
    const dates: string[] = [];

    // Generate all dates for the recurrence period
    for (let week = 0; week < weeks; week++) {
      for (const dayOfWeek of selectedDays) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + (dayOfWeek - startDate.getDay() + 7) % 7);

        // Skip dates before start date
        if (date >= startDate) {
          dates.push(date.toISOString().split('T')[0]);
        }
      }
    }

    // Remove duplicates and sort
    const uniqueDates = [...new Set(dates)].sort();

    // Create events one by one
    let created = 0;
    let firstEventId: string | null = null;

    const createNext = () => {
      if (created >= uniqueDates.length) {
        this.loading.set(false);
        if (firstEventId) {
          this.router.navigate(['/dashboard']);
        }
        return;
      }

      const eventData = { ...baseData, date: uniqueDates[created] };
      this.eventService.create(eventData).subscribe({
        next: (event) => {
          if (!firstEventId) firstEventId = event.id;
          created++;
          createNext();
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(`Error al agendar ${created + 1}: ${err.error?.error || 'Error desconocido'}`);
        }
      });
    };

    createNext();
  }
}
