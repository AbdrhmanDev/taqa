import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  ViewChild,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
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
  ApexYAxis,
  ApexLegend,
  ApexFill,
  ApexTooltip,
  ApexPlotOptions,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { RealtimeStationDetails } from '../../../service/realtime-station-details';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { StationDetails } from '../../../service/station-details';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
  responsive: ApexResponsive[];
};

import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-comproser-details',
  imports: [
    SelectModule,
    FormsModule,
    NgApexchartsModule,
    DatePipe,
    DecimalPipe,
    CommonModule,
    SkeletonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './comproser-details.html',
  styleUrl: './comproser-details.scss',
})
export class ComproserDetails implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild('timelineChart', { static: false }) timelineChart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  timelineChartOptions: any;
  timeLineChart: any = {};
  selectedTime: any;
  station: any;
  private subscription!: Subscription;
  stationId!: number;
  compressorDetailsData!: any;
  ComproserDataCard!: any;
  isLoadingCompressor: boolean = false;
  isLoadingTimeline: boolean = false;
  isLoadingRealtime: boolean = true;

  timeOptions = [
    { label: 'Last Hour', value: 'hour' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  constructor(
    private Router: Router,
    private cdr: ChangeDetectorRef,
    private realTime: RealtimeStationDetails,
    private stationDetails: StationDetails,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initCharts();
    this.activateRoute.paramMap.subscribe((params) => {
      this.stationId = Number(params.get('id'));
      if (this.stationId) {
        this.onStartConnection();
        this.onGetTimeLineChart();
        this.onGetCompressorData();
      }
    });
  }

  ngAfterViewInit(): void {
    // Additional safety for chart rendering after view init
    setTimeout(() => {
      this.forceChartRender();
    }, 500);
  }

  initCharts() {
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
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
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

    // Initialize timelineChartOptions with complete configuration
    this.timelineChartOptions = {
      series: [],
      chart: {
        height: 160,
        width: '100%',
        type: 'bar',
        stacked: true,
        stackType: '100%',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        background: 'transparent',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '50%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
          dataLabels: {
            position: 'top',
          },
        },
      },
      colors: ['#3E4A60'],
      xaxis: {
        categories: ['Status Distribution'],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { show: false },
      },
      grid: { show: false },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 500,
        offsetY: 0,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: (val: number) => val.toFixed(2) + '%',
        },
      },
      fill: {
        opacity: 1,
        type: 'solid',
      },
      stroke: {
        show: false,
        width: 0,
      },
      responsive: [
        {
          breakpoint: undefined,
          options: {},
        },
      ],
    };
  }

  forceChartRender() {
    if (this.timelineChart && !this.isLoadingTimeline) {
      try {
        console.log('Forcing chart render...');
        // Force update and re-render with a new object reference
        this.timelineChartOptions = { ...this.timelineChartOptions };
        this.timelineChart.updateOptions(this.timelineChartOptions, true, true);
        
        // Trigger resize event to recalculate dimensions
        window.dispatchEvent(new Event('resize'));
      } catch (e) {
        console.warn('Chart render error:', e);
      }
    }
  }

  onGetTimeLineChart() {
    this.isLoadingTimeline = true;
    this.stationDetails.getTimeLineChart(this.stationId).subscribe({
      next: (res) => {
        this.timeLineChart = res.result;
        console.log('timeline', this.timeLineChart);

        const statusColors: { [key: string]: string } = {
          Off: '#9CA3AF',
          Idle: '#3B82F6',
          Statring: '#FBBF24',
          Starting: '#FBBF24',
          Compression: '#10B981',
          Recirculating: '#6366F1',
          Alarm: '#EF4444',
          Start_delay: '#8B5CF6',
          Force: '#EC4899',
          Lockout: '#111827',
        };

        const colors = this.timeLineChart.map((s: any) => statusColors[s.name] || '#3E4A60');

        this.timelineChartOptions = {
          ...this.timelineChartOptions,
          series: this.timeLineChart.map((s: any) => ({
            name: s.name,
            data: [Number((s.data[0] * 100).toFixed(2))],
          })),
          colors: colors,
        };

        this.isLoadingTimeline = false;
        this.cdr.detectChanges();

        // Force chart to re-render after DOM update with multiple attempts
        setTimeout(() => this.forceChartRender(), 100);
        setTimeout(() => this.forceChartRender(), 500);
        setTimeout(() => this.forceChartRender(), 1200);
      },
      error: (err) => {
        console.log(err);
        this.isLoadingTimeline = false;
        this.cdr.detectChanges();
      },
    });
  }

  backComproser() {
    this.Router.navigate(['/dashboard/station']);
  }

  onGetCompressorData() {
    this.isLoadingCompressor = true;
    this.stationDetails.getCompressorById(this.stationId).subscribe({
      next: (res) => {
        this.ComproserDataCard = res[0];
        console.log(this.ComproserDataCard);
        this.isLoadingCompressor = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoadingCompressor = false;
        this.cdr.detectChanges();
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
    return 78 - this.getFillHeight(value);
  }

  getColorS(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';
    const v = value as number;
    if (v <= 50) return '#FF3400';
    if (v <= 100) return '#FF3400';
    if (v <= 200) return '#FF3400';
    return '#FF3400';
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
      1
    );
  }

  getNeedleRotation(value: number | null): number {
    return -90 + this.getRatio(value) * 180;
  }

  getArcPath(value: number | null): string {
    const ratio = this.getRatio(value);
    if (ratio <= 0) return '';
    const cx = 80,
      cy = 80,
      r = 60;
    const startX = cx - r;
    const startY = cy;
    const angleRad = Math.PI - ratio * Math.PI;
    const endX = cx + r * Math.cos(angleRad);
    const endY = cy + r * Math.sin(angleRad);
    const largeArc = ratio > 0.5 ? 1 : 0;
    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(
      2
    )}`;
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
      this.subscription = this.realTime.getCompressorDetails().subscribe({
        next: (data) => {
          this.compressorDetailsData = data[0];
          this.isLoadingRealtime = false;
          this.cdr.detectChanges();
          console.log('Received compressor data:', this.compressorDetailsData);
        },
        error: (err) => {
          console.error(err);
          this.isLoadingRealtime = false;
          this.cdr.detectChanges();
        },
      });
      await this.realTime.joinCompressor(this.stationId);
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    this.realTime.stopConnectionCompressor();
  }
}
