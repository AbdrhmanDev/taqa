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

import { ChartOptions } from 'highcharts';

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
  ],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard implements OnInit {
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
  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      console.log('Received alarm data:', data);
      this.isLoading = false;
      this.alarms.unshift(data);
      this.cdr.detectChanges();
    });
  }
  ngOnDestroy(): void {
    this.realTime.stopConnection();
  }
}
