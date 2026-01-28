import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarItem, SidebarSection } from '../../models/sidebar';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
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
      items: [{ name: 'Dashboard', icon: 'dashboard', route: '/homeDashboard' }],
    },
    {
      title: 'Monitoring',
      items: [
        { name: 'Stations', icon: 'stations', route: '/station' },
        { name: 'Map View', icon: 'map', route: '/map' },
        { name: 'QR', icon: 'qr', route: '/qr' },
      ],
    },
    {
      title: 'Tasks',
      items: [{ name: 'Request manager', icon: 'tasks', route: '/request-manager' }],
    },
    {
      title: 'Reports',
      items: [
        { name: 'Revenue', icon: 'revenue', route: '/revenue' },
        { name: 'Report', icon: 'report', route: '/report' },
      ],
    },
    {
      title: 'Setting',
      items: [
        { name: 'Tariff', icon: 'tariff', route: '/tariff' },
        { name: 'Maintenance Request', icon: 'maintenance', route: '/requests' },
        { name: 'User Management', icon: 'users', route: '/users' },
      ],
    },
    {
      title: 'Other',
      items: [
        { name: 'Notification', icon: 'bell', route: '/notifications' },
        { name: 'Settings', icon: 'settings', route: '/settings' },
      ],
    },
  ];
}
