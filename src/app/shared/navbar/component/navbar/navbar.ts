import { SharedData } from '../../../service/shared-data';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { dashboardService } from '../../../../features/dashboard/service/dashboard';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    AutoCompleteModule,
    RouterModule,
    FormsModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  pageTitle = '';
  constructor(
    private router: Router,
    private dashboardService: dashboardService,
    private SharedData: SharedData,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.pageTitle = this.getRouteTitle();
    });
  }
  ngOnInit(): void {
    this.selectedTime = 0;
    this.getDashbaordSummary();
    this.getDashbaordRevenue();
    this.getDashbaordGas();
  }
  showTimeDropdown = false;
  selectedTime: number = 0;
  fromDate!: string;
  toDate!: string;
  dateRange: Date[] = [];

  timeOptions = [
    { label: 'Current', value: 0 },
    { label: 'Last Shift', value: 1 },
    { label: 'Last Day', value: 2 },
    { label: 'Last Week', value: 3 },
    { label: 'Last Month', value: 4 },
    { label: 'Custom', value: 5 },
  ];

  // Zone Filter
  showZoneDropdown = false;
  selectedZone = 'All Zones';
  zones = ['All Zones', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
  items: any[] | undefined;

  value: any;

  search(event: AutoCompleteCompleteEvent) {}

  private getRouteTitle(): string {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.title ?? '';
  }
  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
  getAllDashboardData() {
    this.getDashbaordSummary();
    this.getDashbaordRevenue();
    this.getDashbaordGas();
  }
  getDashbaordSummary() {
    if (this.selectedTime === 5) {
      if (!this.dateRange || this.dateRange.length < 2) {
        return;
      }
      const from = this.formatDate(this.dateRange[0]);
      const to = this.formatDate(this.dateRange[1]);

      this.dashboardService.dashboardSummary(5, from, to).subscribe({
        next: (res) => {
          console.log(res);
          this.SharedData.setDashboardSummary(res);
        },
        error: (err) => console.log(err),
      });
    } else {
      this.dashboardService.dashboardSummary(this.selectedTime).subscribe({
        next: (res) => {
          console.log(res);
          this.SharedData.setDashboardSummary(res);
        },
        error: (err) => console.log(err),
      });
    }
  }
  getDashbaordRevenue() {
    if (this.selectedTime === 5) {
      if (!this.dateRange || this.dateRange.length < 2) {
        return;
      }
      const from = this.formatDate(this.dateRange[0]);
      const to = this.formatDate(this.dateRange[1]);

      this.dashboardService.dashboardRevenue(5, from, to).subscribe({
        next: (res) => {
          this.SharedData.setDashboardRevenue(res);
          console.log(res);
        },
        error: (err) => console.log(err),
      });
    } else {
      this.dashboardService.dashboardRevenue(this.selectedTime).subscribe({
        next: (res) => {
          this.SharedData.setDashboardRevenue(res);
          console.log(res);
        },
        error: (err) => console.log(err),
      });
    }
  }
  getDashbaordGas() {
    if (this.selectedTime === 5) {
      if (!this.dateRange || this.dateRange.length < 2) {
        return;
      }
      const from = this.formatDate(this.dateRange[0]);
      const to = this.formatDate(this.dateRange[1]);

      this.dashboardService.dashboardGas(5, from, to).subscribe({
        next: (res) => {
          this.SharedData.setDashboardGas(res);
          console.log(res);
        },
        error: (err) => console.log(err),
      });
    } else {
      this.dashboardService.dashboardGas(this.selectedTime).subscribe({
        next: (res) => {
          this.SharedData.setDashboardGas(res);
          console.log(res);
        },
        error: (err) => console.log(err),
      });
    }
  }
}
