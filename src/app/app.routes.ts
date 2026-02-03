import { Routes } from '@angular/router';
import { Public } from '@layouts/public/public';
import { Private } from '@layouts/private/private';
import { Auth } from '@layouts/auth/auth';

import { authGuard, guestGuard, authMatch, guestMatch } from '@guards/auth.guard';
import { adminGuard } from '@guards/role.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'auth',
    component: Auth,
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('@modules/auth/components/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('@modules/auth/components/register.component').then(m => m.RegisterComponent)
      }
    ]
  },

  // Private routes (authenticated users) - use canMatch to only match if authenticated
  {
    path: '',
    component: Private,
    canMatch: [authMatch],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@modules/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'my-calendar',
        loadComponent: () => import('@modules/calendar/components/my-calendar.component').then(m => m.MyCalendarComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('@modules/events/components/event-list.component').then(m => m.EventListComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('@modules/events/components/event-detail.component').then(m => m.EventDetailComponent)
      },
      // Events - 'new' MUST come before ':id'
      {
        path: 'events/new',
        loadComponent: () => import('@modules/events/components/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'events/:id/edit',
        loadComponent: () => import('@modules/events/components/event-form.component').then(m => m.EventFormComponent)
      },
      // Teams routes (admin only)
      {
        path: 'teams',
        canActivate: [adminGuard],
        loadComponent: () => import('@modules/teams/components/team-list.component').then(m => m.TeamListComponent)
      },
      {
        path: 'teams/new',
        canActivate: [adminGuard],
        loadComponent: () => import('@modules/teams/components/team-form.component').then(m => m.TeamFormComponent)
      },
      {
        path: 'teams/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('@modules/teams/components/team-form.component').then(m => m.TeamFormComponent)
      },
      {
        path: 'teams/:id',
        canActivate: [adminGuard],
        loadComponent: () => import('@modules/teams/components/team-detail.component').then(m => m.TeamDetailComponent)
      }
    ]
  },

  // Public routes - only match if NOT authenticated for private paths
  {
    path: '',
    component: Public,
    children: [
      {
        path: '',
        loadComponent: () => import('@modules/home/components/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('@modules/events/components/event-list.component').then(m => m.EventListComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('@modules/events/components/event-detail.component').then(m => m.EventDetailComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('@modules/calendar/components/calendar.component').then(m => m.CalendarComponent)
      }
    ]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '' }
];
