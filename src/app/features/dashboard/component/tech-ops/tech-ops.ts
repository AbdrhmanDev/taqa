import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TechOpsRealtime } from '../../service/tech-ops-realtime';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Tempreture } from './tempreture/tempreture';

import { Pressure } from './pressure/pressure';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-tech-ops',
  imports: [
    SelectModule,
    FormsModule,
    CommonModule,
    RouterLink,
    RouterOutlet,
    DialogModule,
    Pressure,
    Tempreture,
  ],
  templateUrl: './tech-ops.html',
  styleUrl: './tech-ops.scss',
})
export class TechOps implements OnInit {
  techOpsData: any[] = [];
  selectedStationId: number | null = null;
  isLoading: boolean = true;
  isPressureDialogOpen = false;
  isTemperatureDialogOpen = false;
  private subscription!: Subscription;
  constructor(
    private _TechOpsRealtime: TechOpsRealtime,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.onStartConection();
  }
  statusMap: { [key: string]: { color: string, dot: string } } = {
    'Off': { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    'Idle': { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    'Starting': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
    'Compression': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'Recirculating': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
    'Alarm': { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
    'Start_delay': { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    'Force': { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    'Not_Linked': { color: 'bg-gray-200 text-gray-600 border-gray-300', dot: 'bg-gray-400' }
  };

  getStatusInfo(state: string) {
    return this.statusMap[state] ?? { color: 'bg-gray-50 text-gray-400 border-gray-100', dot: 'bg-gray-300' };
  }

  // Summary Getters
  get totalStationsCount(): number {
    return this.techOpsData.length;
  }

  get activeCompressorsCount(): number {
    return this.techOpsData.filter(s => s.state === 'Compression').length;
  }

  get totalActiveDispensers(): string {
    let active = 0;
    let total = 0;
    this.techOpsData.forEach(s => {
      if (s.dispenserActivity && typeof s.dispenserActivity === 'string' && s.dispenserActivity.includes('/')) {
        const parts = s.dispenserActivity.split('/');
        active += parseInt(parts[0]) || 0;
        total += parseInt(parts[1]) || 0;
      }
    });
    return `${active}/${total}`;
  }

  get alarmStationsCount(): number {
    return this.techOpsData.filter(s => s.state === 'Alarm').length;
  }

  parseAvailability(val: any): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.includes('/')) {
      const parts = val.split('/');
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      return b !== 0 && !isNaN(a) && !isNaN(b) ? (a / b) * 100 : 0;
    }
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  get selectedStation(): any {
    return this.techOpsData.find((s) => s.stationId === this.selectedStationId) ?? null;
  }
  openDispenserDialog(station: any) {
    this.selectedStationId = station.stationId;
    this.isTemperatureDialogOpen = true;
  }
  openCompressorDialog(station: any) {
    this.selectedStationId = station.stationId;
    this.isPressureDialogOpen = true;
  }
  onStartConection() {
    // We no longer await as the connection is managed by the service globally
    this._TechOpsRealtime.startConnection();

    this.subscription = this._TechOpsRealtime.getTechOps().subscribe({
      next: (data) => {
        console.log('TechOps Realtime Data:', data);
        if (data && data.length > 0) {
          this.ngZone.run(() => {
            const mapped = data.map(s => ({
              ...s,
              availabilityClean: this.parseAvailability(s.availability),
              dispenserActivityClean: parseFloat(s.dispenserActivity) || 0
            }));

            // Sort alphabetically by stationName
            this.techOpsData = mapped.sort((a, b) => 
              (a.stationName || '').localeCompare(b.stationName || '')
            );

            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => console.error(err),
    });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // We DO NOT stop the connection here anymore because other dashboards might need it 
    // and we want it to persist for the next time we visit this page.
  }
}
