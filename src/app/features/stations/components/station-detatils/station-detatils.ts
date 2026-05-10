import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
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
export class StationDetatils implements OnInit, OnDestroy {
  stationId!: number;
  allStationDetails: any;
  activeTab: string = '0';
  private joinedStationId: number | null = null;

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
      const newId = Number(params.get('id'));

      // If we are already in a station group, leave it before joining a new one
      if (this.joinedStationId && this.joinedStationId !== newId) {
        this.leaveAllGroups(this.joinedStationId);
      }

      this.stationId = newId;
      this.onGetStationDetails();
      this.startAllConnections();
    });
  }

  async startAllConnections() {
    console.log(`🚀 Starting parallel connections for station ${this.stationId}`);
    this.joinedStationId = this.stationId;

    try {
      await Promise.allSettled([
        // 1. Station KPIs
        this.realtimeService
          .startConnection()
          .then(() => this.realtimeService.joinStation(this.stationId)),

        // 2. Dispenser
        this.realtimeService
          .startConnectionDispenser()
          .then(() => this.realtimeService.joinDispenser(this.stationId)),

        // 3. Compressor
        this.realtimeService
          .startConnectionCompressor()
          .then(() => this.realtimeService.joinCompressor(this.stationId)),

        // 4. Alarms
        this.alarmsService
          .startConnection()
          .then(() => this.alarmsService.joinStation(this.stationId)),
      ]);

      console.log('✅ All connections established successfully in parallel');
    } catch (error) {
      console.error('❌ SignalR parallel initialization failed:', error);
    }
  }

  async leaveAllGroups(id: number) {
    console.log(`🧹 Cleaning up connections for station ${id}`);
    try {
      await Promise.allSettled([
        this.realtimeService.leaveStation(id),
        this.realtimeService.leaveDispenser(id),
        this.realtimeService.leaveCompressor(id),
        this.alarmsService.leaveStation(id),
      ]);
      console.log(`✅ Successfully left all groups for station ${id}`);
    } catch (error) {
      console.error('❌ Error while leaving station groups:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.joinedStationId) {
      this.leaveAllGroups(this.joinedStationId);
    }
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
