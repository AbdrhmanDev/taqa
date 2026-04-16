import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { OverView } from '../over-view/over-view';
import { Comprossers } from '../comprossers/comprossers';
import { Dispensers } from '../dispensers/dispensers';
import { StationAlarm } from '../station-alarm/station-alarm';
import { StationTickets } from '../station-tickets/station-tickets';
import { StationDetails } from '../../service/station-details';
import { IStationDetails } from '../../model/station-details';
import { ComproserDetails } from '../comprossers/comproser-details/comproser-details';
import { CommonModule, Location } from '@angular/common';
import { RealtimeStationDetails } from '../../service/realtime-station-details';
import { AlarmsStationDetails } from '../../service/alarms-station-details';

@Component({
  selector: 'app-station-detatils',
  imports: [
    TabsModule,
    OverView,
    Comprossers,
    Dispensers,
    StationAlarm,
    StationTickets,
    ComproserDetails,
    CommonModule,
  ],
  templateUrl: './station-detatils.html',
  styleUrl: './station-detatils.scss',
})
export class StationDetatils implements OnInit {
  stationId!: number;
  allStationDetails: any;
  activeTab: string = '0';

  constructor(
    private _Router: Router,
    private activateRoute: ActivatedRoute,
    private stationDetails: StationDetails,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private realtimeService: RealtimeStationDetails,
    private alarmsService: AlarmsStationDetails
  ) {}
  goBack() {
    this.location.back();
  }
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      // show anything in url
      this.stationId = Number(params.get('id'));
      this.onGetStationDetails();
      this.startAllConnections();
    });
  }

  async startAllConnections() {
    console.log(`🚀 Starting parallel connections for station ${this.stationId}`);
    
    // Start all connections in parallel
    await Promise.all([
      this.realtimeService.startConnection(),
      this.realtimeService.startConnectionDispenser(),
      this.realtimeService.startConnectionCompressor(),
      this.alarmsService.startConnection()
    ]);

    // Join all groups in parallel
    await Promise.all([
      this.realtimeService.joinStation(this.stationId),
      this.realtimeService.joinDispenser(this.stationId),
      this.realtimeService.joinCompressor(this.stationId),
      this.alarmsService.joinStation(this.stationId)
    ]);
    
    console.log('✅ All background connections established and groups joined');
  }
  onGetStationDetails() {
    this.stationDetails.getStationById(this.stationId).subscribe({
      next: (res) => {
        this.allStationDetails = res;
        console.log('stationID', this.stationId);
        console.log(res);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  setTab(tab: string) {
    this.activeTab = tab;
    
    // Trigger window resize after a short delay to force charts inside hidden tabs to re-render
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
}
