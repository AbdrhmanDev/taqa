import { ChangeDetectorRef, Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Sensor } from '../../../model/sensor';
import { RealtimeStationDetails } from '../../../service/realtime-station-details';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { StationDetails } from '../../../service/station-details';
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
  selector: 'app-comproser-details',
  imports: [SelectModule, FormsModule, ChartComponent, DatePipe, DecimalPipe, CommonModule],
  templateUrl: './comproser-details.html',
  styleUrl: './comproser-details.scss',
})
export class ComproserDetails implements OnInit {
  @ViewChild('chart') chart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  timelineChartOptions: any;
  timeLineChart: any = {};
  selectedTime: any;
  station: any;
  private subscription!: Subscription;
  compressorDetailsData!: any;
  ComproserDataCard!: any;
  private interval: any;
  stationId!: number;
  timeOptions = [
    { label: 'Last Hour', value: 'hour' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];
  // sensors: Sensor[] = [
  //   { id: 1, name: 'Pressure Sensor 1', value: 148.7, min: 0, max: 255, active: true },
  //   { id: 2, name: 'Pressure Sensor 2', value: 148.7, min: 0, max: 255, active: true },
  //   { id: 3, name: 'Pressure Sensor 3', value: 148.7, min: 0, max: 255, active: true },
  //   { id: 4, name: 'Pressure Sensor 4', value: 148.7, min: 0, max: 255, active: true },
  //   { id: 5, name: 'Pressure Sensor 5', value: 148.7, min: 0, max: 255, active: true },
  //   { id: 6, name: 'Pressure Sensor 6', value: 148.7, min: 0, max: 255, active: true },
  // ];

  constructor(
    private Router: Router,
    private cdr: ChangeDetectorRef,
    private realTime: RealtimeStationDetails,
    private stationDetails: StationDetails,
    private activateRoute: ActivatedRoute,
<<<<<<< HEAD
  ) {}

  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      this.stationId = Number(params.get('id'));

      if (this.stationId) {
        this.onStartConnection();
      }
      this.onGetCompressorData();
      this.onGetTimeLineChart();
    });
  }
  onGetTimeLineChart() {
    this.stationDetails.getTimeLineChart(this.stationId).subscribe({
      next: (res) => {
        this.timeLineChart = res.result;
        console.log('timeline', this.timeLineChart);
        this.timelineChartOptions = {
          series: [
=======
  ) {
    this.chartOptions = {
      series: [
        {
          name: 'Gas consumption',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chart: {
        height: 300,
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
        colors: ['#1ED6FF'],
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
    this.timelineChartOptions = {
      series: [
        {
          name: 'Comproser Details',
          data: [
>>>>>>> d04f5a8ca041d97a62d1a2eb8ece76ac41963bd9
            {
              name: 'Comproser Details',
              data: [
                {
                  x: 'President',
                  y: [new Date(1789, 3, 30).getTime(), new Date(1797, 2, 4).getTime()],
                },
              ],
            },
          ],
          chart: {
            height: 300,
            type: 'rangeBar',
          },
          plotOptions: {
            bar: {
              horizontal: true,
              barHeight: '50%',
              rangeBarGroupRows: true,
            },
          },
          xaxis: {
            type: 'datetime',
          },
        };
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
<<<<<<< HEAD
=======
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      this.stationId = Number(params.get('id'));

      if (this.stationId) {
        this.onStartConnection();
      }
      this.onGetCompressorData();
    });
  }
>>>>>>> d04f5a8ca041d97a62d1a2eb8ece76ac41963bd9
  backComproser() {
    this.Router.navigate(['/dashboard/station']);
  }
  onGetCompressorData() {
    this.stationDetails.getCompressorById(this.stationId).subscribe({
      next: (res) => {
        this.ComproserDataCard = res[0];
        console.log(this.ComproserDataCard);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  get temperatureStages() {
    if (!this.compressorDetailsData?.temperatureStages) return [];

    return this.compressorDetailsData.temperatureStages.map((value: number, i: number) => ({
      label: `Stage ${i + 1}`,
      value: this.isInvalidValue(value) ? null : value,
    }));
  }
  readonly minTemp = 0;
  readonly maxTemp = 300;

  getFillHeight(value: number | null): number {
    if (this.isInvalidValue(value)) return 0;
    const ratio = Math.min(Math.max((value! - this.minTemp) / (this.maxTemp - this.minTemp), 0), 1);
    return ratio * 43;
  }

  getFillY(value: number | null): number {
    const fillH = this.getFillHeight(value);
    return 78 - fillH;
  }

  getColorS(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';
    const v = value as number;

    if (v <= 50) return '#FFA500';
    if (v <= 100) return '#FF6B00';
    if (v <= 200) return '#FF3300';
    return '#CC0000';
  }

  readonly minPressure = 0.1;
  readonly maxPressure = 486;
  get stages() {
    if (!this.compressorDetailsData?.pressureStages) return [];

    return this.compressorDetailsData.pressureStages.map((value: number, i: number) => ({
      label: `Stage ${i + 1}`,
      value: this.isInvalidValue(value) ? null : value,
    }));
  }
  isInvalidValue(value: any): boolean {
    return value === null || value === undefined || value === 0 || value === -1;
  }
  getRatio(value: number | null): number {
    if (value === null || value === undefined) return 0;
    return Math.min(
      Math.max((value - this.minPressure) / (this.maxPressure - this.minPressure), 0),
      1,
    );
  }

  getNeedleRotation(value: number | null): number {
    const ratio = this.getRatio(value);
    return -90 + ratio * 180;
  }

  getArcPath(value: number | null): string {
    const ratio = this.getRatio(value);
    if (ratio <= 0) return '';

    const cx = 80,
      cy = 80,
      r = 60;

    const startX = cx - r; // = 20
    const startY = cy; // = 80

    const angleRad = Math.PI - ratio * Math.PI;
    const endX = cx + r * Math.cos(angleRad);
    const endY = cy + r * Math.sin(angleRad);

    const largeArc = ratio > 0.5 ? 1 : 0;

    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }

  getColor(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';

    const v = value as number;

    if (v >= 0.1 && v <= 50) return '#38d3fa';
    if (v >= 51 && v <= 150) return '#0663f9';
    if (v >= 151 && v <= 300) return '#2c26d9';
    if (v >= 301 && v <= 486) return '#4426d9';

    return '#DDDDDD';
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['station']) {
      this.cdr.detectChanges();
    }
  }
  async onStartConnection() {
    try {
      await this.realTime.startConnectionCompressor();
      // await this.realTime.joinCompressor(this.stationId);
      this.subscription = this.realTime.getCompressorDetails().subscribe({
        next: (data) => {
          console.log('Received Compressor data:', data);
          this.compressorDetailsData = data[0];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });

      await this.realTime.joinCompressor(this.stationId);
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.realTime.stopConnectionCompressor();
  }
}
