import { Component, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

import { RealtimeStationDetails } from '../../service/realtime-station-details';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
} from 'ng-apexcharts';
import { MoveComproser } from './move-comproser/move-comproser';
import { UnlinkComproser } from './unlink-comproser/unlink-comproser';
import { StationDetails } from '../../service/station-details';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AllStation } from '../../service/all-station';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-over-view',
  imports: [
    ChartComponent,
    SelectModule,
    FormsModule,
    DialogModule,
    MoveComproser,
    UnlinkComproser,
    CommonModule,
  ],
  templateUrl: './over-view.html',
  styleUrl: './over-view.scss',
})
export class OverView {
  @ViewChild('chart') chart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  selectedTime: any;
  stationId!: number;
  moveDialogVisible = false;
  unlinkDialogVisible = false;
  comproserTableData: any[] = [];
  private subscription!: Subscription;
  stationDetailsData!: any;
  allSation: any[] = [];
  timeOptions = [
    { label: 'Last Hour', value: 'hour' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];
  statusEnum: { [key: number]: string } = {
    0: 'OffLine',
    1: 'Idle',
    2: 'Starting',
    3: 'Compression',
    4: 'Recirculating',
    5: 'Alarm',
    6: 'Start delay',
    7: 'Force',
    8: 'Lockout',
  };

  statusColors: { [key: number]: string } = {
    0: 'bg-gray-100 text-gray-600',
    1: 'bg-blue-100 text-blue-600',
    2: 'bg-yellow-100 text-yellow-600',
    3: 'bg-green-100 text-green-600',
    4: 'bg-indigo-100 text-indigo-600',
    5: 'bg-red-100 text-red-600',
    6: 'bg-purple-100 text-purple-600',
    7: 'bg-pink-100 text-pink-600',
    8: 'bg-black text-white',
  };
  constructor(
    private stationDetails: StationDetails,
    private activateRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private realTime: RealtimeStationDetails,
    private Station: AllStation,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.chartOptions = {
      series: [
        {
          name: 'Gas consumption',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        colors: ['#EF7B7B'],
      },
      grid: {
        row: {
          colors: ['#f9fafb', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      },
    };
  }
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      // show anything in url
      this.stationId = Number(params.get('id'));
    });
    this.onGetComproser();
    this.onStartConnection();
    this.onGetAllStation();
  }
  openMoveDialog() {
    this.moveDialogVisible = true;
  }
  openUnlinkDialog() {
    this.unlinkDialogVisible = true;
  }
  onGetComproser() {
    this.stationDetails.getComproserById(this.stationId).subscribe({
      next: (res) => {
        this.comproserTableData = res;
        console.log('tablee', this.comproserTableData);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllStation() {
    this.Station.getAllStations().subscribe({
      next: (res) => {
        this.allSation = res.items;

        this.changeDetectorRef.detectChanges();
        console.log(this.allSation);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  get currentStation() {
    return this.allSation.find((s) => s.id === this.stationId);
  }
  async onStartConnection() {
    try {
      await this.realTime.startConnection();
      await this.realTime.joinStation(this.stationId);
      this.subscription = this.realTime.getStationDetails().subscribe({
        next: (data) => {
          this.stationDetailsData = data;
          console.log('Received station data:', data);
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.realTime.stopConnection();
  }
}
