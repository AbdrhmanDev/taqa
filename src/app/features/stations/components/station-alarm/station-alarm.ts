import { dashboardService } from './../../../dashboard/service/dashboard';
import { Component, OnDestroy } from '@angular/core';
import { RealtimeAlarmsDashboard } from '../../../dashboard/service/realtime-alarms-dashboard';
import { ChangeDetectorRef, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CommonModule, DatePipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AlarmsStationDetails } from '../../service/alarms-station-details';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-station-alarm',
  imports: [DatePipe, CommonModule, FormsModule, SelectModule, DatePickerModule, InputTextModule],
  templateUrl: './station-alarm.html',
  styleUrl: './station-alarm.scss',
})
export class StationAlarm implements OnInit {
  alarms: any[] = [];
  isLoading: boolean = true;
  // Raw data from API
  alarmsHistory: any[] = [];
  // Real-time alarms from SignalR
  alarmsRealTime: any[] = [];
  stationDetailsDataAlarm: any[] = [];
  private subscription!: Subscription;
  @Input() stationId!: number;
  @Output() connectionReady = new EventEmitter<void>(); // Keep for compatibility

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
    private realtimeAlarmDetails: AlarmsStationDetails,
    private activateRoute: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    if (this.stationId) {
      this.getAlarmsHistory();
      this.subscribeToAlarms();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  setTab(tab: 'all' | 'system' | 'user') {
    this.activeTab = tab;
    this.currentPage = 1;
    // this.applyClientSideFilters();
  }

  getAlarmsHistory() {
    this.isLoading = true;
    this.dashboardService.StationAlarmById(this.stationId).subscribe({
      next: (res: any[]) => {
        this.alarmsHistory = res;
        console.log('Alarms history:', this.alarmsHistory);
        this.mergeAlarms();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  mergeAlarms() {
    this.displayedAlarms = [...this.stationDetailsDataAlarm, ...this.alarmsHistory];
  }

  subscribeToAlarms() {
    this.subscription = this.realtimeAlarmDetails.getStationDetails().subscribe({
      next: (data) => {
        if (data) {
          const sid = data.stationId || data.stationID || data.id;
          console.log(`🔍 [Alarm Filter] Incoming StationId: ${sid}, Expected: ${this.stationId}`);

          if (sid && Number(sid) !== Number(this.stationId)) {
            console.warn(`⏭️ [Alarm Filter] Data skipped for station ${sid}`);
            return;
          }

          console.log('✅ [Alarm Filter] Match found! Updating UI...');
          console.log('⚠️ [Alarm Data Details]:', {
            Message: data.className,
            Severity: data.severity,
            Time: data.time
          });
          data.className = data.className?.trim(); //remove r/n/

          this.stationDetailsDataAlarm.unshift(data);
          this.mergeAlarms();
          this.isLoading = false;
          this.cdr.detectChanges();
        }
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
