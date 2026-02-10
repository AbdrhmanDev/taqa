import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AutoCompleteModule, RouterModule, FormsModule, SelectModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  pageTitle = '';
  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.pageTitle = this.getRouteTitle();
    });
  }
  ngOnInit(): void {}
  showTimeDropdown = false;
  selectedTime = 'Time';
  timeOptions = [
    'Today',
    'Yesterday',
    'Last 7 days',
    'Last 30 days',
    'This Month',
    'Last Month',
    'Custom Range',
  ];

  // Zone Filter
  showZoneDropdown = false;
  selectedZone = 'All Zones';
  zones = ['All Zones', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
  items: any[] | undefined;

  value: any;

  search(event: AutoCompleteCompleteEvent) {}
  exportData() {
    console.log('Exporting data...');
    // Add your export logic here
  }
  private getRouteTitle(): string {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.title ?? '';
  }
}
