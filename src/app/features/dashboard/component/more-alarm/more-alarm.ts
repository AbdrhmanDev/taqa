import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RealtimeAlarmsDashboard } from '../../service/realtime-alarms-dashboard';

import { dashboardService } from '../../service/dashboard';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-more-alarm',
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './more-alarm.html',
  styleUrl: './more-alarm.scss',
})
export class MoreAlarm implements OnInit {
  alarmsHistory: any[] = [];
  currentPage = 1;
  pageSize = 15;
  constructor(
    private realTime: RealtimeAlarmsDashboard,
    private cdr: ChangeDetectorRef,
    private dashboardService: dashboardService,
  ) {}
  ngOnInit(): void {
    this.getAlarmsHistory();
    this.onStartConnection();
  }
  getAlarmsHistory() {
    this.dashboardService.dashboardAlarms().subscribe({
      next: (res) => {
        this.alarmsHistory = res;

        console.log('Alarms History:', this.alarmsHistory);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      this.alarmsHistory.unshift(data);
      this.currentPage = 1;

      this.cdr.detectChanges();
    });
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
