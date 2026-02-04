import { Dashboard } from './features/dashboard/component/dashboard/dashboard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/component/login/login').then((m) => m.Login),
  },
  {
    path: 'email-verify',
    loadComponent: () =>
      import('./features/auth/component/email-verify/email-verify').then((m) => m.EmailVerify),
  },
  {
    path: 'otp',
    loadComponent: () => import('./features/auth/component/otp/otp').then((m) => m.Otp),
  },
  {
    path: 'change-password-success',
    loadComponent: () =>
      import('./features/auth/component/change-pass-success/change-pass-success').then(
        (m) => m.ChangePassSuccess,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/component/reset-password/reset-password').then(
        (m) => m.ResetPassword,
      ),
  },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        redirectTo: 'homeDashboard',
        pathMatch: 'full',
      },
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
        path: 'add-user',
        loadComponent: () =>
          import('./features/user-management/component/add-user/add-user').then((m) => m.AddUser),
      },
      {
        path: 'add-role',
        loadComponent: () =>
          import('./features/user-management/component/add-role/add-role').then((m) => m.AddRole),
      },
      {
        path: 'station',
        loadComponent: () =>
          import('./features/stations/components/station/station').then((m) => m.Station),
      },
      // {
      //   path: 'requests',
      //   loadComponent: () =>
      //     import('./features/Maintenance Request/components/requests/requests').then(
      //       (m) => m.Requests,
      //     ),
      // },
      // {
      //   path: 'create-ticket',
      //   loadComponent: () =>
      //     import('./features/Maintenance Request/components/create-ticket/create-ticket').then(
      //       (m) => m.CreateTicket,
      //     ),
      // },
      // {
      //   path: 'tariff',
      //   loadComponent: () =>
      //     import('./features/Tariff/components/tarrif/tarrif').then((m) => m.Tarrif),
      // },
      // {
      //   path: 'chart-price',
      //   loadComponent: () =>
      //     import('./features/Tariff/components/chart-price/chart-price').then((m) => m.ChartPrice),
      // },
      {
        path: 'profile-user',
        loadComponent: () =>
          import('./features/setting/components/profile-user/profile-user').then(
            (m) => m.ProfileUser,
          ),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/setting/components/logs-user/logs-user').then((m) => m.LogsUser),
      },
      {
        path: 'lists',
        loadComponent: () =>
          import('./features/request-manager/components/lists/lists').then((m) => m.Lists),
      },
      {
        path: 'board',
        loadComponent: () =>
          import('./features/request-manager/components/board/board').then((m) => m.Board),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/request-manager/components/history/history').then((m) => m.History),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
