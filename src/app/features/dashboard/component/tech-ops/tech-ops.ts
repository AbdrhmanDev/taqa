import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TechOpsRealtime } from '../../service/tech-ops-realtime';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-tech-ops',
  imports: [SelectModule, FormsModule, CommonModule],
  templateUrl: './tech-ops.html',
  styleUrl: './tech-ops.scss',
})
export class TechOps implements OnInit {
  techOpsData: any[] = [];
  isLoading: boolean = true;
  private subscription!: Subscription;
  constructor(
    private _TechOpsRealtime: TechOpsRealtime,
    private cdr: ChangeDetectorRef,
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
  async onStartConection() {
    await this._TechOpsRealtime.startConnection();
    //because the data is coming as an array of objects, we need to subscribe to the observable and update the techOpsData variable with the received data
    //and if i want use this subscribtion in another function i need to store it in a variable and unsubscribe from it when the component is destroyed to avoid memory leaks
    this.subscription = this._TechOpsRealtime.getTechOps().subscribe({
      next: (data) => {
        this.techOpsData = data;
        console.log('Received TechOps data:', data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._TechOpsRealtime.stopConnection();
  }
}
