import { dashboardService } from './../../service/dashboard';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Sidebar } from '../../../../shared/sidebar/component/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/navbar/component/navbar/navbar';
import { ChartDashboard } from '../chart-dashboard/chart-dashboard';
import { SharedData } from '../../../../shared/service/shared-data';
import { RealtimeAlarmsDashboard } from '../../service/realtime-alarms-dashboard';
import { ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Route } from '@angular/router';
import { ChartOptions } from 'highcharts';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
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
import { Station } from '../../../stations/components/station/station';
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
    NgApexchartsModule,
    MoreAlarm,
  ],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard implements OnInit {
  private map!: L.Map;
  allStations: any[] = [];
  dashboardData: any;
  dashboardRevenueData: any;
  dashboardGasData: any;
  isLoading: boolean = true;
  alarms: any[] = [];
  gasSoldCahrt: any[] = [];
  gasVehiclesChart: any[] = [];
  revenueChart: any[] = [];
  highestConsumptionStations: any[] = [];
  @ViewChild('chart') chart: ChartComponent | any;
  public chartGas!: chartGas;
  public chartRevenue!: chartGas;
  public chartVehicles!: chartGas;
  public colors!: string[];
  constructor(
    private sharedData: SharedData,
    private realTime: RealtimeAlarmsDashboard,
    private cdr: ChangeDetectorRef,
    private dashboardService: dashboardService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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
        console.log('Gas Sold Chart Data:', this.gasSoldCahrt);
        this.chartGas = {
          series: [
            {
              name: 'gas sold',
              data: gasValues,
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
            curve: 'straight',
          },
          title: {
            text: 'Gas Volume Sold',
            align: 'left',
            style: {
              fontSize: '25px',
              fontWeight: 'bold',
            },
          },
          grid: {
            row: {
              colors: ['#ffffff', 'transparent'],
              opacity: 0.5,
            },
          },
          xaxis: {
            categories: timeLabels,
          },
          colors: ['#B42318'],
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error fetching hourly gas sold:', err);
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
        console.log('Revenue Chart Data:', this.revenueChart);

        this.chartRevenue = {
          series: [
            {
              name: 'revenue',
              data: revenue,
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
            curve: 'straight',
          },
          title: {
            text: 'Revenue',
            align: 'left',
            style: {
              fontSize: '25px',
              fontWeight: 'bold',
            },
          },
          grid: {
            row: {
              colors: ['#ffffff', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5,
            },
          },
          xaxis: {
            categories: timeLabels,
          },
          colors: ['#29B705'],
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
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
        console.log('Gas Sold Chart Data:', this.gasVehiclesChart);

        this.chartVehicles = {
          series: [
            {
              name: 'gas vehicles',
              data: gasVehicles,
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
            curve: 'straight',
          },
          title: {
            text: 'Vehicles Charged',
            align: 'left',
            style: {
              fontSize: '25px',
              fontWeight: 'bold',
            },
          },
          grid: {
            row: {
              colors: ['#ffffff', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5,
            },
          },
          xaxis: {
            categories: timeLabels,
          },
          colors: ['#3673E8'],
        };
        this.cdr.detectChanges();
        console.log('Vehicles Charged Chart Data:', this.gasVehiclesChart);
      },
      error: (err) => console.log(err),
    });
  }
  getSummaryData() {
    this.sharedData.dashboardSummary$.subscribe({
      next: (data) => {
        this.dashboardData = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Error fetching dashboard summary:', error);
      },
    });
  }

  getGasData() {
    this.sharedData.dashboardGas$.subscribe({
      next: (data) => {
        this.dashboardGasData = data;
      },
      error: (error) => console.log(error),
    });
  }

  //charts:

  getRevenueData() {
    this.sharedData.dashboardRevenue$.subscribe({
      next: (data) => {
        this.dashboardRevenueData = data;
      },
      error: (error) => console.log(error),
    });
  }
  getHighestConsumption() {
    this.dashboardService.dashboardHighest().subscribe({
      next: (res) => {
        this.highestConsumptionStations = res.map((s: { stationName: string }) => ({
          ...s,
          stationName: s.stationName.trim(),
        }));
        this.cdr.detectChanges();
        console.log('Highest Consumption Stations:', this.highestConsumptionStations);
        setTimeout(() => {
          this.barFills.forEach((barRef) => {
            const val = +(barRef.nativeElement.dataset['val'] ?? 0);
            const pct = (val / this.maxValue) * 100;
            barRef.nativeElement.style.width = pct + '%';
          });
        }, 100);
      },
      error: (err) => console.log(err),
    });
  }
  openSeeMore() {
    this.router.navigate(['/dashboard/more-alarms']);
  }
  getAlarmsHistory() {
    this.dashboardService.dashboardAlarms().subscribe({
      next: (res) => {
        this.alarms = this.getLatest3([...res, ...this.alarms]);
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });
  }

  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      console.log('Received alarm data:', data);
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

        console.log('Map Stations Data:', this.allStations);
        this.cdr.detectChanges();
        this.initMap();
      },
      error: (err) => console.log(err),
    });
  }
  private statusColors: Map<string, string> = new Map();

  private colorPalette = [
    '#16a34a',
    '#dc2626',
    '#f59e0b',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#6b7280',
  ];

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

    console.log('Total valid stations:', validStations.length);

    if (validStations.length === 0) {
      console.error('No valid stations to display');
      return;
    }

    // حساب المركز المتوسط لجميع المحطات
    let totalLat = 0;
    let totalLng = 0;
    validStations.forEach((station) => {
      totalLat += parseFloat(station.latitude);
      totalLng += parseFloat(station.longitude);
    });

    const centerLat = totalLat / validStations.length;
    const centerLng = totalLng / validStations.length;

    // إنشاء الخريطة
    this.map = L.map('map', {
      zoomControl: true,
      center: [centerLat, centerLng],
      zoom: 8,
    });

    // إضافة طبقة الخريطة
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // تجميع الإحداثيات للـ bounds
    const bounds = L.latLngBounds([]);

    this.statusColors.clear();

    // إضافة كل المحطات للخريطة
    validStations.forEach((station) => {
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);
      const color = this.getStatusColor(station.status);

      // إضافة الإحداثيات للـ bounds
      bounds.extend([lat, lng]);

      // إنشاء أيقونة مخصصة
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
        width: 12px;
        height: 12px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(this.map);

      marker.bindPopup(`
      <div style="font-family: system-ui; min-width: 150px;">
        <strong>${station.stationName}</strong><br>
        <span style="color: ${color};">● ${station.status}</span>
      </div>
    `);
    });

    // ضبط الخريطة لتشمل كل المحطات
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      });
    }

    // إضافة scale bar
    L.control
      .scale({
        metric: true,
        imperial: false,
        position: 'bottomright',
      })
      .addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('Map invalidated, current bounds:', this.map.getBounds());
        console.log('Number of markers:', validStations.length);
      }
    }, 100);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 500);
  }
  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
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
        const bounds = L.latLngBounds(
          validStations.map((s) => [parseFloat(s.latitude), parseFloat(s.longitude)]),
        );
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
