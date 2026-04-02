import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { dashboardService } from './../../service/dashboard';

import { Sidebar } from '../../../../shared/sidebar/component/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/navbar/component/navbar/navbar';
import { ChartDashboard } from '../chart-dashboard/chart-dashboard';
import { SharedData } from '../../../../shared/service/shared-data';
import { RealtimeAlarmsDashboard } from '../../service/realtime-alarms-dashboard';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MoreAlarm } from '../more-alarm/more-alarm';

export type chartGas = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  colors?: any;
};

@Component({
  selector: 'app-home-dashboard',
  imports: [
    Sidebar,
    CommonModule,
    RouterModule,
    Navbar,
    ChartDashboard,
    TableModule,
    ProgressSpinnerModule,
    SkeletonModule,
    NgApexchartsModule,
    MoreAlarm,
  ],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  allStations: any[] = [];
  dashboardData: any;
  dashboardRevenueData: any;
  dashboardGasData: any;
  isLoading: boolean = true;
  private loadingItems = new Set<string>();
  alarms: any[] = [];
  gasSoldCahrt: any[] = [];
  gasVehiclesChart: any[] = [];
  revenueChart: any[] = [];
  highestConsumptionStations: any[] = [];
  @ViewChild('chart') chart: ChartComponent | any;
  public chartGas!: chartGas;
  public chartRevenue!: chartGas;
  public chartVehicles!: chartGas;

  constructor(
    private sharedData: SharedData,
    private realTime: RealtimeAlarmsDashboard,
    private cdr: ChangeDetectorRef,
    private dashboardService: dashboardService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setLoading('summary');
    this.setLoading('gas');
    this.setLoading('revenue');
    this.setLoading('hourlyGas');
    this.setLoading('hourlyRevenue');
    this.setLoading('vehicles');
    this.setLoading('highest');
    this.setLoading('alarms');
    this.setLoading('map');

    this.getSummaryData();
    this.getGasData();
    this.getRevenueData();
    this.onStartConnection();

    this.hourlyRevenufChart();
    this.getVehiclesChart();
    this.getHighestConsumption();
    this.getHourlyGasChart();
    this.getAlarmsHistory();
  }

  private setLoading(key: string) {
    this.loadingItems.add(key);
    this.isLoading = true;
  }

  private clearLoading(key: string) {
    this.loadingItems.delete(key);
    if (this.loadingItems.size === 0) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  public isPartLoading(key: string): boolean {
    return this.loadingItems.has(key);
  }

  @ViewChildren('barFill') barFills!: QueryList<ElementRef<HTMLDivElement>>;

  get maxValue(): number {
    if (!this.highestConsumptionStations?.length) return 1;
    return Math.max(...this.highestConsumptionStations.map((s) => s.averageDailyGasVolume));
  }

  getHourlyGasChart() {
    this.dashboardService.hourlyGasSold().subscribe({
      next: (res) => {
        this.gasSoldCahrt = res;
        const gasValues = res.map((item: any) => item.totalGasSold);
        const timeLabels = res.map((item: any) => {
          const date = new Date(item.hourStartTime);
          return date.getHours() + ':00';
        });
        this.chartGas = {
          series: [{ name: 'gas sold', data: gasValues }],
          chart: { height: 350, type: 'line', zoom: { enabled: false } },
          dataLabels: { enabled: false },
          stroke: { curve: 'straight' },
          title: {
            text: 'Gas Volume Sold',
            align: 'left',
            style: { fontSize: '25px', fontWeight: 'bold' },
          },
          grid: { row: { colors: ['#ffffff', 'transparent'], opacity: 0.5 } },
          xaxis: { categories: timeLabels },
          colors: ['#B42318'],
        };
        this.clearLoading('hourlyGas');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error fetching hourly gas sold:', err);
        this.clearLoading('hourlyGas');
      },
    });
  }

  hourlyRevenufChart() {
    this.dashboardService.hourlyRevenue().subscribe({
      next: (res) => {
        this.revenueChart = res;
        const revenue = res.map((item: any) => item.totalRevenue);
        const timeLabels = res.map((item: any) => {
          const date = new Date(item.hourStartTime);
          return date.getHours() + ':00';
        });
        this.chartRevenue = {
          series: [{ name: 'revenue', data: revenue }],
          chart: { height: 350, type: 'line', zoom: { enabled: false } },
          dataLabels: { enabled: false },
          stroke: { curve: 'straight' },
          title: {
            text: 'Revenue',
            align: 'left',
            style: { fontSize: '25px', fontWeight: 'bold' },
          },
          grid: { row: { colors: ['#ffffff', 'transparent'], opacity: 0.5 } },
          xaxis: { categories: timeLabels },
          colors: ['#29B705'],
        };
        this.clearLoading('hourlyRevenue');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.clearLoading('hourlyRevenue');
      },
    });
  }

  getVehiclesChart() {
    this.dashboardService.hourlyVehicles().subscribe({
      next: (res) => {
        this.gasVehiclesChart = res;
        const gasVehicles = res.map((item: any) => item.totalVehiclesCharged);
        const timeLabels = res.map((item: any) => {
          const date = new Date(item.hourStartTime);
          return date.getHours() + ':00';
        });
        this.chartVehicles = {
          series: [{ name: 'gas vehicles', data: gasVehicles }],
          chart: { height: 350, type: 'line', zoom: { enabled: false } },
          dataLabels: { enabled: false },
          stroke: { curve: 'straight' },
          title: {
            text: 'Vehicles Charged',
            align: 'left',
            style: { fontSize: '25px', fontWeight: 'bold' },
          },
          grid: { row: { colors: ['#ffffff', 'transparent'], opacity: 0.5 } },
          xaxis: { categories: timeLabels },
          colors: ['#3673E8'],
        };
        this.clearLoading('vehicles');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.clearLoading('vehicles');
      },
    });
  }

  getSummaryData() {
    this.sharedData.dashboardSummary$.subscribe({
      next: (data) => {
        if (data) {
          this.dashboardData = data;
          this.clearLoading('summary');
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard summary:', error);
        this.clearLoading('summary');
      },
    });
  }

  getGasData() {
    this.sharedData.dashboardGas$.subscribe({
      next: (data) => {
        if (data) {
          this.dashboardGasData = data;
          this.clearLoading('gas');
        }
      },
      error: (error) => {
        console.log(error);
        this.clearLoading('gas');
      },
    });
  }

  getRevenueData() {
    this.sharedData.dashboardRevenue$.subscribe({
      next: (data) => {
        if (data) {
          this.dashboardRevenueData = data;
          this.clearLoading('revenue');
        }
      },
      error: (error) => {
        console.log(error);
        this.clearLoading('revenue');
      },
    });
  }

  getHighestConsumption() {
    this.dashboardService.dashboardHighest().subscribe({
      next: (res) => {
        this.highestConsumptionStations = res.map((s: any) => ({
          ...s,
          stationName: s.stationName.trim(),
        }));
        this.clearLoading('highest');
        this.cdr.detectChanges();
        setTimeout(() => {
          this.barFills.forEach((barRef) => {
            const val = +(barRef.nativeElement.dataset['val'] ?? 0);
            const pct = (val / this.maxValue) * 100;
            barRef.nativeElement.style.width = pct + '%';
          });
        }, 100);
      },
      error: (err) => {
        console.log(err);
        this.clearLoading('highest');
      },
    });
  }

  openSeeMore() {
    this.router.navigate(['/dashboard/more-alarms']);
  }

  getAlarmsHistory() {
    this.dashboardService.dashboardAlarms().subscribe({
      next: (res) => {
        this.alarms = this.getLatest3([...res, ...this.alarms]);
        this.clearLoading('alarms');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.clearLoading('alarms');
      },
    });
  }

  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      this.alarms = this.getLatest3([data, ...this.alarms]);
      this.cdr.detectChanges();
    });
  }

  private getLatest3(items: any[]): any[] {
    return items
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.timeStamp === item.timeStamp &&
              t.stationName === item.stationName &&
              t.className === item.className,
          ),
      )
      .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())
      .slice(0, 3);
  }

  getStationsMap() {
    this.dashboardService.dashboardMap().subscribe({
      next: (res) => {
        this.allStations = res;
        this.initMap();
        this.clearLoading('map');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.clearLoading('map');
      },
    });
  }

  private statusColors: Map<string, string> = new Map();
  private colorPalette = ['#16a34a', '#dc2626', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  private getStatusColor(status: string): string {
    if (!this.statusColors.has(status)) {
      const colorIndex = this.statusColors.size % this.colorPalette.length;
      this.statusColors.set(status, this.colorPalette[colorIndex]);
    }
    return this.statusColors.get(status)!;
  }

  get statusLegend(): { status: string; color: string }[] {
    return Array.from(this.statusColors.entries()).map(([status, color]) => ({
      status,
      color,
    }));
  }

  private initMap() {
    if (this.map) {
      this.map.remove();
    }

    const validStations = this.allStations.filter(
      (s) =>
        s.latitude &&
        s.longitude &&
        !isNaN(parseFloat(s.latitude)) &&
        !isNaN(parseFloat(s.longitude)),
    );

    if (validStations.length === 0) return;

    let totalLat = 0,
      totalLng = 0;
    validStations.forEach((station) => {
      totalLat += parseFloat(station.latitude);
      totalLng += parseFloat(station.longitude);
    });

    const centerLat = totalLat / validStations.length;
    const centerLng = totalLng / validStations.length;

    this.map = L.map('map', { zoomControl: true, center: [centerLat, centerLng], zoom: 8 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    const bounds = L.latLngBounds([]);
    this.statusColors.clear();

    validStations.forEach((station) => {
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);
      const color = this.getStatusColor(station.status);
      bounds.extend([lat, lng]);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(this.map);
      marker.bindPopup(
        `<strong>${station.stationName}</strong><br><span style="color: ${color};">● ${station.status}</span>`,
      );
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
      }
    }, 200);

    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 500);
  }

  zoomIn() {
    if (this.map) this.map.zoomIn();
  }
  zoomOut() {
    if (this.map) this.map.zoomOut();
  }

  resetView() {
    if (this.map && this.allStations) {
      const validStations = this.allStations.filter(
        (s) =>
          s.latitude &&
          s.longitude &&
          !isNaN(parseFloat(s.latitude)) &&
          !isNaN(parseFloat(s.longitude)),
      );
      if (validStations.length > 0) {
        const bounds = L.latLngBounds(validStations.map((s) => [parseFloat(s.latitude), parseFloat(s.longitude)]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        this.map.setView([30.0444, 31.2357], 7);
      }
    }
  }

  ngAfterViewInit() {
    this.getStationsMap();
  }
  ngOnDestroy(): void {
    this.realTime.stopConnection();
  }
}
