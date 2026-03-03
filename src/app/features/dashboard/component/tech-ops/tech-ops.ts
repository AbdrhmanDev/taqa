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
        this.cdr.detectChanges(); // Trigger change detection manually
      },
      error: (err) => console.error(err),
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._TechOpsRealtime.stopConnection();
  }
}
