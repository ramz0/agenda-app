import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TeamService } from '@services/team.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <div class="mb-8">
        <p class="text-violet-400 text-sm font-medium mb-1">Equipos</p>
        <h1 class="text-3xl font-bold text-white">
          {{ isEdit() ? 'Editar Equipo' : 'Nuevo Equipo' }}
        </h1>
      </div>

      <div class="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-300 mb-2">
              Nombre del equipo *
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500"
              placeholder="Ej: Equipo de Desarrollo"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-rose-400 text-sm mt-2">El nombre es requerido</p>
            }
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500 resize-none"
              placeholder="Describe el propósito del equipo..."
            ></textarea>
          </div>

          @if (error()) {
            <div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl">
              {{ error() }}
            </div>
          }

          <div class="flex gap-4 pt-2">
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-violet-500/25">
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Guardando...
                </span>
              } @else {
                {{ isEdit() ? 'Guardar Cambios' : 'Crear Equipo' }}
              }
            </button>
            <a routerLink="/teams"
               class="px-5 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white rounded-xl transition">
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TeamFormComponent implements OnInit {
  form: FormGroup;
  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  teamId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.teamId = this.route.snapshot.paramMap.get('id');
    if (this.teamId) {
      this.isEdit.set(true);
      this.loadTeam();
    }
  }

  loadTeam() {
    if (!this.teamId) return;

    this.teamService.getById(this.teamId).subscribe({
      next: (team) => {
        this.form.patchValue({
          name: team.name,
          description: team.description
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el equipo');
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const data = this.form.value;

    const request = this.isEdit()
      ? this.teamService.update(this.teamId!, data)
      : this.teamService.create(data);

    request.subscribe({
      next: (team) => {
        this.router.navigate(['/teams', team.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Error al guardar el equipo');
      }
    });
  }
}
