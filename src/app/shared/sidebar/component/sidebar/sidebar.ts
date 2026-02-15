import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarItem, SidebarSection } from '../../models/sidebar';
import { RouterModule } from '@angular/router';
import { Authen } from '../../../../features/auth/service/authen';
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  constructor(private _Authen: Authen) {}
  @Input() isDrawer: boolean = false;
  @Input() isCollapsed: boolean = true;

  @Output() toggleSidebar = new EventEmitter<boolean>();

  toggleBar() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }
  toggleExpand(item: SidebarItem) {
    item.expanded = !item.expanded;
  }
  links: SidebarSection[] = [
    {
      title: '',
      items: [{ name: 'Dashboard', icon: 'dashboard', route: '/dashboard/homeDashboard' }],
    },
    {
      title: 'Monitoring',
      items: [
        { name: 'Stations', icon: 'stations', route: '/dashboard/station' },
        { name: 'Map View', icon: 'map', route: '/dashboard/map' },
        { name: 'QR', icon: 'qr', route: '/dashboard/qr' },
      ],
    },
    {
      title: 'Tasks',
      items: [{ name: 'Request manager', icon: 'tasks', route: '/dashboard/lists' }],
    },
    {
      title: 'Reports',
      items: [
        { name: 'Revenue', icon: 'revenue', route: '/dashboard/Revenue' },
        { name: 'Report', icon: 'report', route: '/dashboard/report' },
      ],
    },
    {
      title: 'Setting',
      items: [
        { name: 'Configuration', icon: 'layers-01', route: '/dashboard/profile-user' },
        { name: 'Tariff', icon: 'tariff', route: '/dashboard/tariff' },
        { name: 'Alarm & Alert', icon: 'alarm-alert', route: '/dashboard/tariff' },
        { name: 'Maintenance Request', icon: 'maintenance', route: '/dashboard/requests' },
        { name: 'User Management', icon: 'users', route: '/dashboard/users' },
      ],
    },
    {
      title: 'Other',
      items: [
        { name: 'Notification', icon: 'bell', route: '/dashboard/notifications' },
        { name: 'Settings', icon: 'settings', route: '/dashboard/profile-user' },
      ],
    },
  ];
  logout() {
    this._Authen.logout();
  }
}
