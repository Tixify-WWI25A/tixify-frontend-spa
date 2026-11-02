// Erstfassung mit KI erstellt (Gemini, KI-Log W3, 13.10.). Weiterentwickelt mit KI (KI-Log W6), jeweils vom Team getestet und bewertet: Check-in entfernt (Robert, 15.10.).
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; // bzw. './guards/auth' je nach Dateiname

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/events/events').then(m => m.Events)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users/users').then(m => m.Users)
  },
  { path: '**', redirectTo: 'dashboard' }
];