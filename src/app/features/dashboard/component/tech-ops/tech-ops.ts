import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TechOpsRealtime } from '../../service/tech-ops-realtime';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
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
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.onStartConection();
  }
  statusEnum: { [key: string]: string } = {
    OffLine: 'OffLine',
    Idle: 'Idle',
    Starting: 'Starting',
    Compression: 'Compression',
    Recirculating: 'Recirculating',
    Alarm: 'Alarm',
    'Start delay': 'Start delay',
    Force: 'Force',
    Lockout: 'Lockout',
    Online: 'Online',
  };

  statusColors: { [key: string]: string } = {
    OffLine: 'bg-gray-100 text-gray-600',
    Idle: 'bg-blue-100 text-blue-600',
    Starting: 'bg-yellow-100 text-yellow-600',
    Compression: 'bg-green-100 text-green-600',
    Recirculating: 'bg-indigo-100 text-indigo-600',
    Alarm: 'bg-red-100 text-red-600',
    'Start delay': 'bg-purple-100 text-purple-600',
    Force: 'bg-pink-100 text-pink-600',
    Lockout: 'bg-black text-white',
    Online: 'bg-green-100 text-green-600',
  };
  showZoneDropdown = false;
  selectedZone = 'All Zones';
  zones = ['All Zones', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
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
        if (data && data.length > 0) {
          this.techOpsData = data;
          this.isLoading = false;
          this.cdr.detectChanges();
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
