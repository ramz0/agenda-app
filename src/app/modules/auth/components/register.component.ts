import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h2 class="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
    <p class="text-slate-400 mb-6">Completa tus datos para registrarte</p>

    @if (error()) {
      <div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error() }}
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5" for="name">
          Nombre completo
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            id="name"
            formControlName="name"
            class="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500 transition"
            placeholder="Tu nombre"
          />
        </div>
        @if (form.get('name')?.touched && form.get('name')?.errors?.['required']) {
          <p class="text-rose-400 text-sm mt-1.5">El nombre es requerido</p>
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5" for="email">
          Correo electrónico
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500 transition"
            placeholder="tu@email.com"
          />
        </div>
        @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
          <p class="text-rose-400 text-sm mt-1.5">El correo es requerido</p>
        }
        @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
          <p class="text-rose-400 text-sm mt-1.5">Formato de correo inválido</p>
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1.5" for="password">
          Contraseña
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500 transition"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
          <p class="text-rose-400 text-sm mt-1.5">La contraseña es requerida</p>
        }
        @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
          <p class="text-rose-400 text-sm mt-1.5">La contraseña debe tener al menos 6 caracteres</p>
        }
      </div>

      <button
        type="submit"
        [disabled]="loading()"
        class="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-violet-500/25"
      >
        @if (loading()) {
          <span class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          </span>
        } @else {
          Crear Cuenta
        }
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-slate-400">
        ¿Ya tienes cuenta?
        <a routerLink="/auth/login" class="text-violet-400 hover:text-violet-300 font-medium transition">
          Inicia sesión
        </a>
      </p>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Error al crear la cuenta. Intenta de nuevo.');
      }
    });
  }
}
