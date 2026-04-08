import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AllStation } from '../../service/all-station';
import { StationDetails } from '../../service/station-details';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeStationDetails } from '../../service/realtime-station-details';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dispensers',
  imports: [TabsModule, SelectModule, DatePickerModule, CommonModule, FormsModule, TableModule],
  templateUrl: './dispensers.html',
  styleUrl: './dispensers.scss',
})
export class Dispensers implements OnInit {
  stationId!: number;
  allDispensers: any[] = [];
  status: string = '';
  private subscription!: Subscription;
  DispenserDetails!: any;
  isLoading: boolean = true;
  constructor(
    private _stationDetails: StationDetails,
    private _Router: Router,
    private activateRoute: ActivatedRoute,
    private realTime: RealtimeStationDetails,

    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      // show anything in url
      this.stationId = Number(params.get('id'));
    });
    this.onStartConnection();
  }
  getAllDispensers() {
    this._stationDetails.getDispenserById(this.stationId).subscribe({
      next: (res) => {
        console.log(res);
        this.allDispensers = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  async onStartConnection() {
    try {
      await this.realTime.startConnectionDispenser();

      this.subscription = this.realTime.getDispenserDetails().subscribe({
        next: (data) => {
          console.log('Received dispenser data:', data);
          this.DispenserDetails = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });

      await this.realTime.joinDispenser(this.stationId);
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }
  formatTimestamp(isoString: string): string {
    if (!isoString) return '--:--:---- -- --';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${hours}:${minutes}:${seconds} ${year}-${month}-${day}`;
    } catch {
      return isoString;
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.realTime.stopConnectionDispenser();
  }
}
