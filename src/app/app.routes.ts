import { Requests } from './features/Maintenance Request/components/requests/requests';
import { Routes } from '@angular/router';
import { Login } from './features/auth/component/login/login';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'homeDashboard',
    loadComponent: () =>
      import('./features/dashboard/component/home-dashboard/home-dashboard').then(
        (m) => m.HomeDashboard,
      ),
  },
  {
    path: 'chartDashboard',
    loadComponent: () =>
      import('./features/dashboard/component/chart-dashboard/chart-dashboard').then(
        (m) => m.ChartDashboard,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/user-management/component/users/users').then((m) => m.Users),
  },
  {
    path: 'station',
    loadComponent: () =>
      import('./features/stations/components/station/station').then((m) => m.Station),
  },
  {
    path: 'requests',

    loadComponent: () =>
      import('./features/Maintenance Request/components/requests/requests').then((m) => m.Requests),
  },
];
