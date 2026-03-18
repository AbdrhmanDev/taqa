import { Component, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
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
import { AlarmsStationDetails } from '../../service/alarms-station-details';
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
    DatePickerModule,
  ],
  templateUrl: './over-view.html',
  styleUrl: './over-view.scss',
})
export class OverView {
  @ViewChild('chart') chart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  isLoading: boolean = false;
  noGasData: boolean = false;
  selectedTime: number = 0;
  stationId!: number;
  duration!: number;
  moveDialogVisible = false;
  unlinkDialogVisible = false;
  comproserTableData: any[] = [];
  private subscription!: Subscription;
  stationDetailsData!: any;
  allGasData: any[] = [];
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  stationDetailsDataAlarm: any[] = []; //convert alarms from object to array
  allSation: any[] = [];
  fromDate!: string;
  toDate!: string;
  dateRange: Date[] = [];
  timeOptions = [
    { label: 'Current', value: 0 },
    { label: 'Last Shift', value: 1 },
    { label: 'Last Day', value: 2 },
    { label: 'Last Week', value: 3 },
    { label: 'Last Month', value: 4 },
    { label: 'Custom', value: 5 },
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
  };
  constructor(
    private stationDetails: StationDetails,
    private activateRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private realTime: RealtimeStationDetails,
    private Station: AllStation,
    private changeDetectorRef: ChangeDetectorRef,
    private realtimeAlarmDetails: AlarmsStationDetails,
  ) {}
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      // show anything in url
      this.stationId = Number(params.get('id'));
    });
    this.onGetComproser();
    this.onStartConnection();
    this.onGetAllStation();
    this.onGetAllGasConsumption();
    this.onStartConnectionAlarms();
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
    this.Station.getAllStations(this.page, this.pageSize).subscribe({
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

      this.subscription = this.realTime.getStationDetails().subscribe({
        next: (data) => {
          console.log('Received station  data:', data);
          this.stationDetailsData = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });

      await this.realTime.joinStation(this.stationId);
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }
  async onStartConnectionAlarms() {
    try {
      await this.realtimeAlarmDetails.startConnection();

      this.subscription = this.realtimeAlarmDetails.getStationDetails().subscribe({
        next: (data) => {
          console.log('Received station Alarm data:', data);
          data.className = data.className?.trim(); //remove r/n/

          this.stationDetailsDataAlarm.unshift(data); // add every alarm on array
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });

      await this.realtimeAlarmDetails.joinStation(this.stationId);
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }

  onGetAllGasConsumption() {
    let fromDate: string | undefined;
    let toDate: string | undefined;

    this.isLoading = true;
    this.noGasData = false;

    if (this.selectedTime === 5) {
      if (!this.dateRange || this.dateRange.length < 2) {
        alert('Please select date range');
        this.isLoading = false;
        return;
      }

      const startDate = this.dateRange[0];
      const endDate = this.dateRange[1];

      fromDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
      toDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
    }

    this.stationDetails.getGasById(this.stationId, this.selectedTime, fromDate, toDate).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (!res || res.length === 0) {
          this.allGasData = [];
          this.chartOptions = undefined;
          this.noGasData = true; // Trigger "No data" message
          return;
        }

        this.allGasData = res;
        this.noGasData = false;

        this.chartOptions = {
          series: [
            {
              name: 'Gas consumption',
              data: res.map((item: { gasVolumeSold: number }) => item.gasVolumeSold),
            },
          ],
          chart: {
            height: 350,
            type: 'line',
            zoom: { enabled: false },
          },
          dataLabels: { enabled: false },
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
            categories: res.map((item: { bucket: string }) => item.bucket.split('T')[0]),
          },
        };
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.noGasData = true;
      },
    });
  }
  onTimeChange() {
    if (this.selectedTime !== 5) {
      this.onGetAllGasConsumption();
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.realTime.stopConnection();
    this.realtimeAlarmDetails.stopConnection();
  }
}
