import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { passengerGuard } from './core/guards/passenger.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
  },
  {
    path: 'acceso-denegado',
    loadComponent: () => import('./features/auth/access-denied/access-denied').then(m => m.AccessDenied),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [() => {
          const auth = inject(AuthService);
          const router = inject(Router);
          return auth.isAdmin()
            ? router.createUrlTree(['/admin'])
            : router.createUrlTree(['/inicio']);
        }],
        children: [],
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: 'buses', loadComponent: () => import('./features/admin/buses/buses').then(m => m.Buses) },
          { path: 'rutas', loadComponent: () => import('./features/admin/rutas/rutas').then(m => m.Rutas) },
          { path: 'viajes', loadComponent: () => import('./features/admin/viajes/viajes').then(m => m.Viajes) },
          { path: '', redirectTo: 'buses', pathMatch: 'full' },
        ],
      },
      {
        path: 'inicio',
        canActivate: [passengerGuard],
        loadComponent: () => import('./features/passenger/home/home').then(m => m.Home),
      },
      {
        path: 'mis-viajes',
        canActivate: [passengerGuard],
        loadComponent: () => import('./features/passenger/my-trips/my-trips').then(m => m.MyTrips),
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
