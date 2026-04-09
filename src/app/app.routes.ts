import { AdminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
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
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'homeDashboard',
        pathMatch: 'full',
      },
      {
        path: 'scada-monitor',
        loadComponent: () =>
          import('./features/scada-monitor/scada-dashboard.component').then(
            (m) => m.ScadaDashboardComponent,
          ),
        title: 'SCADA Monitor',
      },
      {
        path: 'homeDashboard',
        loadComponent: () =>
          import('./features/dashboard/component/home-dashboard/home-dashboard').then(
            (m) => m.HomeDashboard,
          ),
        title: 'Dashboard',
      },
      {
        path: 'chartDashboard',
        loadComponent: () =>
          import('./features/dashboard/component/chart-dashboard/chart-dashboard').then(
            (m) => m.ChartDashboard,
          ),
        title: 'Dashboard',
      },
      {
        path: 'more-alarms',
        loadComponent: () =>
          import('./features/dashboard/component/more-alarm/more-alarm').then((m) => m.MoreAlarm),
        title: 'Alarms',
      },
      {
        path: 'tech-ops',
        loadComponent: () =>
          import('./features/dashboard/component/tech-ops/tech-ops').then((m) => m.TechOps),
        title: 'Tech Ops',
        children: [
          {
            path: 'tempreture',
            loadComponent: () =>
              import('./features/dashboard/component/tech-ops/tempreture/tempreture').then(
                (m) => m.Tempreture,
              ),
          },
          {
            path: 'pressure',
            loadComponent: () =>
              import('./features/dashboard/component/tech-ops/pressure/pressure').then(
                (m) => m.Pressure,
              ),
          },
        ],
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./features/user-management/component/users/users').then((m) => m.Users),
        title: 'User Management',
        canActivate: [AdminGuard],
      },

      {
        path: 'add-user',
        loadComponent: () =>
          import('./features/user-management/component/add-user/add-user').then((m) => m.AddUser),
        title: 'Add User',
      },
      {
        path: 'add-role',
        loadComponent: () =>
          import('./features/user-management/component/add-role/add-role').then((m) => m.AddRole),
        title: 'Add Role',
      },
      {
        path: 'station',
        loadComponent: () =>
          import('./features/stations/components/station/station').then((m) => m.Station),
        title: 'Stations',
      },
      {
        path: 'station-details/:id',
        loadComponent: () =>
          import('./features/stations/components/station-detatils/station-detatils').then(
            (m) => m.StationDetatils,
          ),
        title: 'Stations Details',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/stations/components/over-view/over-view').then((m) => m.OverView),
        title: 'Stations',
      },
      {
        path: 'compressors',
        loadComponent: () =>
          import('./features/stations/components/comprossers/comprossers').then(
            (m) => m.Comprossers,
          ),
        title: 'Stations',
      },
      {
        path: 'compressors',
        loadComponent: () =>
          import('./features/stations/components/comprossers/comprossers').then(
            (m) => m.Comprossers,
          ),
        title: 'Stations',
      },
      {
        path: 'dispensers',
        loadComponent: () =>
          import('./features/stations/components/dispensers/dispensers').then((m) => m.Dispensers),
        title: 'Stations',
      },
      {
        path: 'station-alarm',
        loadComponent: () =>
          import('./features/stations/components/station-alarm/station-alarm').then(
            (m) => m.StationAlarm,
          ),
        title: 'Stations',
      },
      {
        path: 'station-tickets',
        loadComponent: () =>
          import('./features/stations/components/station-tickets/station-tickets').then(
            (m) => m.StationTickets,
          ),
        title: 'Stations',
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/Maintenance Request/components/requests/requests').then(
            (m) => m.Requests,
          ),
        title: 'Maintenance Request',
      },
      {
        path: 'create-ticket',
        loadComponent: () =>
          import('./features/Maintenance Request/components/create-ticket/create-ticket').then(
            (m) => m.CreateTicket,
          ),
        title: 'Create Ticket',
      },
      {
        path: 'tariff',
        loadComponent: () =>
          import('./features/Tariff/components/tarrif/tarrif').then((m) => m.Tarrif),
        title: 'Tariff',
      },
      {
        path: 'chart-price',
        loadComponent: () =>
          import('./features/Tariff/components/chart-price/chart-price').then((m) => m.ChartPrice),
        title: 'Tariff',
      },
      {
        path: 'profile-user',
        loadComponent: () =>
          import('./features/setting/components/profile-user/profile-user').then(
            (m) => m.ProfileUser,
          ),
        title: 'Profile',
      },
      {
        path: 'comproser-details',
        loadComponent: () =>
          import('./features/stations/components/comprossers/comproser-details/comproser-details').then(
            (m) => m.ComproserDetails,
          ),
        title: 'Comproser Details',
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/setting/components/logs-user/logs-user').then((m) => m.LogsUser),
        title: 'Profile',
      },
      {
        path: 'lists',
        loadComponent: () =>
          import('./features/request-manager/components/lists/lists').then((m) => m.Lists),
        title: 'Request Manager',
      },
      {
        path: 'board',
        loadComponent: () =>
          import('./features/request-manager/components/board/board').then((m) => m.Board),
        title: 'Request Manager',
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/request-manager/components/history/history').then((m) => m.History),
        title: 'Request Manager',
      },
      {
        path: 'Revenue',
        loadComponent: () =>
          import('./features/revenue/component/revenue-all/revenue-all').then((m) => m.RevenueAll),
        title: 'Revenue',
      },
      {
        path: 'Revenue-chart',
        loadComponent: () =>
          import('./features/revenue/component/revenue-chart/revenue-chart').then(
            (m) => m.RevenueChart,
          ),
        title: 'Revenue',
      },
      {
        path: 'Revenue-table',
        loadComponent: () =>
          import('./features/revenue/component/revenue-table/revenue-table').then(
            (m) => m.RevenueTable,
          ),
        title: 'Revenue',
      },
      {
        path: 'alarm-alert',
        loadComponent: () =>
          import('./features/alarm-alerts/components/alarm-alerts-home/alarm-alerts-home').then(
            (m) => m.AlarmAlertsHome,
          ),
        title: 'Alarm & Alerts',
      },
      {
        path: 'alarm-view',
        loadComponent: () =>
          import('./features/alarm-alerts/components/alarm-view/alarm-view').then(
            (m) => m.AlarmView,
          ),
        title: 'Alarm & Alerts',
      },
      {
        path: 'alarm-add',
        loadComponent: () =>
          import('./features/alarm-alerts/components/alarm-add/alarm-add').then((m) => m.AlarmAdd),
        title: 'Alarm & Alert Management',
      },
      {
        path: 'create-alarm',
        loadComponent: () =>
          import('./features/alarm-alerts/components/create-alarm/create-alarm').then(
            (m) => m.CreateAlarm,
          ),
        title: 'Alarm & Alert Management',
      },
      {
        path: 'preview-alarm',
        loadComponent: () =>
          import('./features/alarm-alerts/components/preview-alarm/preview-alarm').then(
            (m) => m.PreviewAlarm,
          ),
        title: 'Alarm & Alert Management',
      },
      {
        path: 'zones',
        loadComponent: () =>
          import('./features/zone/components/zones/zones').then((m) => m.ZonesComponent),
        title: 'Zones Management',
      },
      {
        path: 'areas',
        loadComponent: () =>
          import('./features/area/components/areas/areas').then((m) => m.AreasComponent),
        title: 'Areas Management',
      },
      {
        path: 'station-config',
        loadComponent: () =>
          import('./features/station-config/station-config').then((m) => m.StationConfig),
        title: 'Station Configuration',
      },
      {
        path: 'station-hierarchy',
        loadComponent: () =>
          import('./features/station-hierarchy/station-hierarchy').then((m) => m.StationHierarchyComponent),
        title: 'Station Hierarchy',
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
