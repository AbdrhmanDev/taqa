import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { OverView } from '../over-view/over-view';
import { Comprossers } from '../comprossers/comprossers';
import { Dispensers } from '../dispensers/dispensers';
import { StationAlarm } from '../station-alarm/station-alarm';
import { StationTickets } from '../station-tickets/station-tickets';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StationDetails } from '../../service/station-details';
import { IStationDetails } from '../../model/station-details';
import { ComproserDetails } from '../comprossers/comproser-details/comproser-details';
import { CommonModule, Location } from '@angular/common';

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
  // Sequential warming states
  isOverViewReady = false;
  isCompressorsReady = false;
  isDispensersReady = false;
  isAlarmsReady = false;
  activeTab: string = '0';

  constructor(
    private _Router: Router,
    private activateRoute: ActivatedRoute,
    private stationDetails: StationDetails,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}
  goBack() {
    this.location.back();
  }
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      // show anything in url
      this.stationId = Number(params.get('id'));
      this.onGetStationDetails();
    });
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
  }

  // Sequential Initialization Handlers
  onOverViewReady() {
    this.isOverViewReady = true;
    console.log('--- Sequential Warming: OverView Ready -> Starting Compressors ---');
  }

  onCompressorsReady() {
    this.isCompressorsReady = true;
    console.log('--- Sequential Warming: Compressors Ready -> Starting Dispensers ---');
  }

  onDispensersReady() {
    this.isDispensersReady = true;
    console.log('--- Sequential Warming: Dispensers Ready -> Starting Alarms ---');
  }

  onAlarmsReady() {
    this.isAlarmsReady = true;
    console.log('--- Sequential Warming: All Signals Ready ---');
  }
}
