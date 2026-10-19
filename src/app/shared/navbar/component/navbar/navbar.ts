import { SharedData } from '../../../service/shared-data';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, switchMap } from 'rxjs';
import { dashboardService } from '../../../../features/dashboard/service/dashboard';
import { StationDetails } from '../../../../features/stations/service/station-details';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
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
  isDashboardPage = false;
  constructor(
    private router: Router,
    private dashboardService: dashboardService,
    private SharedData: SharedData,
    private _StationDetails: StationDetails,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.pageTitle = this.getRouteTitle();
      this.isDashboardPage = this.router.url.includes('homeDashboard');
    });
  }
  ngOnInit(): void {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term) return of(null);
          this.searchLoading = true;
          return this._StationDetails
            .getAvailableStations(term, 8)
            .pipe(catchError((err) => (console.log(err), of(null))));
        }),
      )
      .subscribe((res) => {
        this.searchResults = res?.items ?? [];
        this.searchLoading = false;
      });
    this.selectedTime = 0;
    // this.getDashbaordSummary();
    // this.getDashbaordRevenue();
    // this.getDashbaordGas();
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
  // Station search
  searchText = '';
  searchResults: any[] = [];
  searchLoading = false;
  showSearchResults = false;
  private searchTerms = new Subject<string>();

  onSearch(term: string) {
    this.showSearchResults = true;
    this.searchTerms.next(term.trim());
    if (!term.trim()) this.searchResults = [];
  }

  onSearchEnter() {
    if (this.searchResults.length) this.goToStation(this.searchResults[0]);
  }

  goToStation(station: any) {
    this.router.navigate(['/dashboard/station-details', station.id]);
    this.closeSearch();
    this.searchText = '';
    this.searchResults = [];
  }

  closeSearch() {
    // Delay so a click on a result registers before the list is removed
    setTimeout(() => (this.showSearchResults = false), 150);
  }

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
