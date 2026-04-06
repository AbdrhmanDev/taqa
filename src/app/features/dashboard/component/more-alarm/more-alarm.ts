import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RealtimeAlarmsDashboard } from '../../service/realtime-alarms-dashboard';
import { FormsModule } from '@angular/forms';
import { dashboardService } from '../../service/dashboard';
import { CommonModule, DatePipe } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';

import { SelectModule } from 'primeng/select';
import { AutoComplete } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-more-alarm',
  imports: [
    DatePipe,
    CommonModule,
    FormsModule,
    SelectModule,
    AutoComplete,
    DatePickerModule,
    InputTextModule,
  ],
  templateUrl: './more-alarm.html',
  styleUrl: './more-alarm.scss',
})
export class MoreAlarm implements OnInit {
  alarmsHistory: any[] = [];
  currentPage = 1;
  pageSize = 15;
  searchText = '';
  selectedStation = '';
  selectedSeverity = '';
  selectedStatus = '';
  fromDate = '';
  toDate = '';
  dateRange: Date[] = [];
  activeTab: 'all' | 'system' | 'user' = 'all';
  severity!: any;
  allStations: any[] = [];
  severityOptions: any[] = [];
  alarmsRealTime: any[] = [];
  displayedAlarms: any[] = [];
  statusOptions = [
    { label: 'Acknowledged', value: 'acknowledged' },
    { label: 'Pending', value: 'pending' },
  ];

  constructor(
    private realTime: RealtimeAlarmsDashboard,
    private cdr: ChangeDetectorRef,
    private dashboardService: dashboardService,
  ) {}
  ngOnInit(): void {
    this.getAlarmsHistory();
    this.onStartConnection();
    this.onGetAllStation();
    this.onGetAllSeverity();
  }
  private formatDateForAPI(date: Date | string): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toISOString();
  }

  onDateRangeChange(dates: Date[] | any) {
    this.dateRange = dates;

    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      this.fromDate = this.formatDateForAPI(dates[0]);
      this.toDate = this.formatDateForAPI(dates[1]);
      this.onFilterChange();
    } else {
      this.fromDate = '';
      this.toDate = '';
    }
  }

  getAlarmsHistory() {
    if (this.dateRange && this.dateRange.length === 2) {
      if (!this.dateRange[0] || !this.dateRange[1]) {
        return;
      }
    }

    const formattedFromDate = this.fromDate ? this.formatDateForAPI(this.fromDate) : '';
    const formattedToDate = this.toDate ? this.formatDateForAPI(this.toDate) : '';

    console.log('Sending dates to API:', { fromDate: formattedFromDate, toDate: formattedToDate });

    this.dashboardService
      .dashboardAlarms(
        this.selectedStation,
        this.selectedSeverity,
        formattedFromDate,
        formattedToDate,
      )
      .subscribe({
        next: (res) => {
          this.alarmsHistory = res;
          this.mergeAndFilterAlarms();
          console.log('Alarms History:', this.alarmsHistory);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  onGetAllSeverity() {
    this.dashboardService.getAllSeverity().subscribe({
      next: (res) => {
        this.severityOptions = res.map((item: string) => ({
          label: item,
          value: item,
        }));
        console.log('Severities:', res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onGetAllStation() {
    this.dashboardService.getAllStation().subscribe({
      next: (res) => {
        this.allStations = res.items;
        this.cdr.detectChanges();
        console.log('Stations:', res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      this.alarmsRealTime = data;
      this.mergeAndFilterAlarms();
      this.alarmsHistory.unshift(data);
      this.currentPage = 1;
      this.cdr.detectChanges();
    });
  }

  get systemCount(): number {
    return this.alarmsHistory.filter((a) => a.type === 'system').length;
  }

  get userCount(): number {
    return this.alarmsHistory.filter((a) => a.type === 'user').length;
  }

  mergeAndFilterAlarms() {
    let allAlarms = [...this.alarmsHistory, ...this.alarmsRealTime];
    allAlarms = this.filteredAlarms(allAlarms);
    this.cdr.detectChanges();
    allAlarms.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    this.displayedAlarms = allAlarms;
  }

  filteredAlarms(alarms: any[]): any {
    let result = [...alarms];
    if (this.activeTab === 'system') result = result.filter((a) => a.type === 'system');
    if (this.activeTab === 'user') result = result.filter((a) => a.type === 'user');
    if (this.selectedStation) {
      result = result.filter((a) => a.stationName === this.selectedStation);
    }
    if (this.selectedSeverity) {
      result = result.filter((a) => a.severity?.toLowerCase() === this.selectedSeverity);
    }
    if (this.selectedStatus === 'acknowledged') {
      result = result.filter((a) => a.isAcknowledged);
    } else if (this.selectedStatus === 'pending') {
      result = result.filter((a) => !a.isAcknowledged);
    }

    if (this.dateRange && this.dateRange.length === 2) {
      const fromDateTime = new Date(this.dateRange[0]).getTime();
      const toDateTime = new Date(this.dateRange[1]).getTime();

      result = result.filter((a) => {
        const alarmTime = new Date(a.timeStamp || a.timestamp).getTime();
        return alarmTime >= fromDateTime && alarmTime <= toDateTime;
      });
    }
    return result;
  }

  onFilterChange() {
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.getAlarmsHistory();
    } else if (this.selectedStation || this.selectedSeverity) {
      this.getAlarmsHistory();
    } else {
      this.mergeAndFilterAlarms();
    }
  }
  clearDateFilter() {
    this.dateRange = [];
    this.fromDate = '';
    this.toDate = '';
    this.onFilterChange();
  }

  get totalAlarms(): number {
    return this.alarmsHistory.length;
  }

  get totalPagesCount(): number {
    return Math.ceil(this.alarmsHistory.length / this.pageSize);
  }

  get totalPages(): number[] {
    return Array.from({ length: this.totalPagesCount }, (_, i) => i + 1);
  }

  get pagedAlarms(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.alarmsHistory.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPagesCount) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}
