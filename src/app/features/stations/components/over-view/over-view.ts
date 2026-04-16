import { Component, ViewChild, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
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
import { LinkComprosser } from './link-comprosser/link-comprosser';

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
    SkeletonModule,
    LinkComprosser,
  ],
  templateUrl: './over-view.html',
  styleUrl: './over-view.scss',
})
export class OverView implements OnInit, OnDestroy {
  @ViewChild('chart') chart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  isLoading: boolean = false;
  noGasData: boolean = false;
  selectedTime: number = 0;
  @Input() stationId!: number;
  @Input() stationDetails: any;
  duration!: number;
  moveDialogVisible = false;
  unlinkDialogVisible = false;
  linkDialogVisible = false;
  selectedCompressorToMove: any = null;
  selectedCompressorToUnlink: any = null;
  comproserTableData: any[] = [];
  availableAssets: any[] = [];
  assetId!: number;
  private subscription!: Subscription;
  private alarmSubscription!: Subscription;
  stationDetailsData!: any;
  allGasData: any[] = [];
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  stationDetailsDataAlarm: any[] = [];
  allSation: any[] = [];
  fromDate!: string;
  toDate!: string;
  dateRange: Date[] = [];
  private loadingItems = new Set<string>();
  @Output() connectionReady = new EventEmitter<void>();

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
    Lockout: 'bg-gray-800 text-white',
  };

  constructor(
    private _stationDetails: StationDetails,
    private activateRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private realTime: RealtimeStationDetails,
    private Station: AllStation,
    private changeDetectorRef: ChangeDetectorRef,
    private realtimeAlarmDetails: AlarmsStationDetails
  ) {}

  ngOnInit(): void {
    if (this.stationDetails) {
      this.assetId = this.stationDetails.assetId;
    }
    this.onGetComproser();
    this.onGetAllGasConsumption();
    this.onStartConnection();
    this.onStartConnectionAlarms();
  }

  public isPartLoading(key: string): boolean {
    return this.loadingItems.has(key);
  }

  openMoveDialog(compressor: any) {
    this.selectedCompressorToMove = compressor;
    this._stationDetails.getAvailableAssetsComproser().subscribe({
      next: (assets: any) => {
        this.availableAssets = assets;
        this.moveDialogVisible = true;
      },
      error: (err: any) => console.log('Error getting available assets:', err),
    });
  }

  openUnlinkDialog(compressor: any) {
    this.selectedCompressorToUnlink = compressor;
    this.unlinkDialogVisible = true;
  }

  openLinkComproser() {
    this.linkDialogVisible = true;
  }

  handleUnlink(compressor: any) {
    const compId = compressor.id || compressor.compressorId;
    this.loadingItems.add('table');
    this._stationDetails.unlinkCompressor(compId).subscribe({
      next: () => {
        this.onGetComproser();
      },
      error: (err: any) => {
        console.log('Error unlinking compressor:', err);
        this.loadingItems.delete('table');
      },
    });
  }

  handleLink(compressorData: any) {
    // Implement link logic based on your API
    console.log('Linking compressor:', compressorData);
    // Example: this.stationDetails.linkCompressor(compressorData.compressorId, this.assetId).subscribe(...)
  }

  handleMove(payload: any) {
    const { compressor, targetAsset } = payload;
    const compId = compressor.id || compressor.compressorId;

    this.loadingItems.add('table');

    this._stationDetails.unlinkCompressor(compId).subscribe({
      next: () => {
        this._stationDetails.linkCompressor(compId, targetAsset.id).subscribe({
          next: () => {
            this.onGetComproser();
          },
          error: (err: any) => {
            console.log('Link error:', err);
            this.loadingItems.delete('table');
          },
        });
      },
      error: (err: any) => {
        console.log('Unlink error:', err);
        this.loadingItems.delete('table');
      },
    });
  }

  get currentStation() {
    return this.allSation.find((s) => s.id === this.stationId);
  }

  async onStartConnection() {
    this.loadingItems.add('summary');
    try {
      await this.realTime.startConnection();

      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.subscription = this.realTime.getStationDetails().subscribe({
        next: (data: any) => {
          console.log('Received station data:', data);
          this.stationDetailsData = data;
          this.loadingItems.delete('summary');
          this.connectionReady.emit();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error receiving station data:', err);
          this.loadingItems.delete('summary');
        },
      });

      await this.realTime.joinStation(this.stationId);
    } catch (error) {
      console.error('Error starting connection:', error);
      this.loadingItems.delete('summary');
    }
  }

  async onStartConnectionAlarms() {
    this.loadingItems.add('alarms');

    // Fetch historical alarms first
    this.realtimeAlarmDetails.getAlarmsHistory(this.stationId).subscribe({
      next: (history: any) => {
        if (history && Array.isArray(history)) {
          this.stationDetailsDataAlarm = history;
        }
        this.loadingItems.delete('alarms');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching alarm history:', err);
        this.loadingItems.delete('alarms');
      },
    });

    try {
      await this.realtimeAlarmDetails.startConnection();

      if (this.alarmSubscription) {
        this.alarmSubscription.unsubscribe();
      }

      this.alarmSubscription = this.realtimeAlarmDetails.getStationDetails().subscribe({
        next: (data: any) => {
          console.log('Received station Alarm data:', data);
          if (data.className) {
            data.className = data.className.trim();
          }
          this.stationDetailsDataAlarm.unshift(data);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error receiving alarm data:', err);
        },
      });

      await this.realtimeAlarmDetails.joinStation(this.stationId);
    } catch (error) {
      console.error('Error starting alarms connection:', error);
    }
  }

  onGetComproser() {
    this.loadingItems.add('table');
    this._stationDetails.getComproserById(this.stationId).subscribe({
      next: (res: any) => {
        this.comproserTableData = res;
        this.loadingItems.delete('table');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Error getting compressors:', err);
        this.loadingItems.delete('table');
      },
    });
  }

  onGetAllGasConsumption() {
    let fromDate: string | undefined;
    let toDate: string | undefined;

    this.loadingItems.add('chart');
    this.noGasData = false;

    if (this.selectedTime === 5) {
      if (!this.dateRange || this.dateRange.length < 2) {
        console.warn('Please select date range');
        this.loadingItems.delete('chart');
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

    this._stationDetails.getGasById(this.stationId, this.selectedTime, fromDate, toDate).subscribe({
      next: (res: any) => {
        this.loadingItems.delete('chart');
        if (!res || res.length === 0) {
          this.allGasData = [];
          this.chartOptions = undefined;
          this.noGasData = true;
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Error getting gas consumption:', err);
        this.loadingItems.delete('chart');
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.alarmSubscription) {
      this.alarmSubscription.unsubscribe();
    }
    this.realTime.stopConnection();
    this.realtimeAlarmDetails.stopConnection();
  }
}
