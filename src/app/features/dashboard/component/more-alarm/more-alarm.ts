import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RealtimeAlarmsDashboard } from '../../service/realtime-alarms-dashboard';
import { FormsModule } from '@angular/forms';
import { dashboardService } from '../../service/dashboard';
import { CommonModule, DatePipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-more-alarm',
  imports: [DatePipe, CommonModule, FormsModule, SelectModule, DatePickerModule, InputTextModule],
  templateUrl: './more-alarm.html',
  styleUrl: './more-alarm.scss',
})
export class MoreAlarm implements OnInit {
  // Raw data from API
  alarmsHistory: any[] = [];
  // Real-time alarms from SignalR
  alarmsRealTime: any[] = [];

  // Final list shown in the UI (after tab filter + sort)
  displayedAlarms: any[] = [];

  currentPage = 1;
  pageSize = 15;

  searchText = '';
  selectedStation = '';
  selectedSeverity = '';
  selectedStatus = '';

  fromDatePicker: Date | null = null;
  toDatePicker: Date | null = null;
  fromDate = '';
  toDate = '';

  activeTab: 'all' | 'system' | 'user' = 'all';

  allStations: any[] = [];
  severityOptions: any[] = [];

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

  onFromDateChange(date: Date | null) {
    this.fromDatePicker = date;
    this.fromDate = date ? this.formatDateForAPI(date) : '';
    this.onFilterChange();
  }

  onToDateChange(date: Date | null) {
    this.toDatePicker = date;
    this.toDate = date ? this.formatDateForAPI(date) : '';
    this.onFilterChange();
  }

  setTab(tab: 'all' | 'system' | 'user') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  // ── Fetch from API (server handles: station, severity, date range) ─────────
  getAlarmsHistory() {
    this.dashboardService
      .dashboardAlarms(this.selectedStation, this.selectedSeverity, this.fromDate, this.toDate)
      .subscribe({
        next: (res: any[]) => {
          this.alarmsHistory = res ?? [];
          console.log('API response count:', this.alarmsHistory.length, this.alarmsHistory);
          this.applyClientSideFilters();
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }

  // ── Client-side only: tab filter + real-time merge + sort ──────────────────
  applyClientSideFilters() {
    let result = [...this.alarmsHistory, ...this.alarmsRealTime];

    // Tab filter
    if (this.activeTab === 'system') result = result.filter((a) => a.type === 'system');
    if (this.activeTab === 'user') result = result.filter((a) => a.type === 'user');

    // Sort newest first
    result.sort(
      (a, b) =>
        new Date(b.timeStamp || b.timestamp).getTime() -
        new Date(a.timeStamp || a.timestamp).getTime(),
    );

    this.displayedAlarms = result;
    this.cdr.detectChanges();
  }

  // ── Called whenever any dropdown/date filter changes ──────────────────────
  onFilterChange() {
    this.currentPage = 1;
    this.getAlarmsHistory();
  }

  // ── Counts based on full API result ───────────────────────────────────────
  get systemCount(): number {
    return this.alarmsHistory.filter((a) => a.type === 'system').length;
  }

  get userCount(): number {
    return this.alarmsHistory.filter((a) => a.type === 'user').length;
  }

  onGetAllSeverity() {
    this.dashboardService.getAllSeverity().subscribe({
      next: (res) => {
        this.severityOptions = res.map((item: string) => ({ label: item, value: item }));
      },
      error: (err) => console.error(err),
    });
  }

  onGetAllStation() {
    this.dashboardService.getAllStation().subscribe({
      next: (res) => {
        this.allStations = res.items;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      this.alarmsRealTime = [data, ...this.alarmsRealTime];
      this.applyClientSideFilters();
    });
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  get totalPagesCount(): number {
    return Math.ceil(this.displayedAlarms.length / this.pageSize) || 1;
  }

  get totalPages(): number[] {
    return Array.from({ length: this.totalPagesCount }, (_, i) => i + 1);
  }

  get pagedAlarms(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.displayedAlarms.slice(start, start + this.pageSize);
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
