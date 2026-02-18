import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedData } from '../../../../shared/service/shared-data';
import { ChangeDetectorRef } from '@angular/core';
import { HighchartsChartComponent, provideHighcharts } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexMarkers,
  ApexTooltip,
  ApexDataLabels,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexFill,
} from 'ng-apexcharts';

@Component({
  selector: 'app-chart-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule, HighchartsChartComponent],

  templateUrl: './chart-dashboard.html',
  styleUrl: './chart-dashboard.scss',
})
export class ChartDashboard implements OnInit {
  // ApexCharts - Revenue
  public chart!: ApexChart;
  public series!: ApexAxisChartSeries;
  public dataLabels!: ApexDataLabels;
  public markers!: ApexMarkers;
  public title!: ApexTitleSubtitle;
  public fill!: ApexFill;
  public yaxis!: ApexYAxis;
  public xaxis!: ApexXAxis;
  public tooltip!: ApexTooltip;
  public colors!: string[];

  dashboardGasData: any = [];
  dashboardRevenueData: any = [];
  updateFlag = false;
  // Highcharts - Gas

  constructor(
    private sharedData: SharedData,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getGasData();
    this.getRevenueData();
  }

  getGasData() {
    this.sharedData.dashboardGas$.subscribe({
      next: (data) => {
        this.dashboardGasData = data;
        this.updateGasChart();
      },
      error: (error) => console.log(error),
    });
  }

  getRevenueData() {
    this.sharedData.dashboardRevenue$.subscribe({
      next: (data) => {
        this.dashboardRevenueData = data;
        this.updateRevenueChart();
      },
      error: (error) => console.log(error),
    });
  }

  updateRevenueChart() {
    if (!this.dashboardRevenueData?.series?.length) return;

    this.series = [
      { name: 'Revenue', data: this.dashboardRevenueData.series.map((i: any) => i.value) },
    ];
    this.chart = { type: 'area', height: 350, toolbar: { show: false } };
    this.xaxis = {
      type: 'category',
      categories: this.dashboardRevenueData.series.map((i: any) => i.zone),
    };
    this.yaxis = { title: { text: 'Revenue' } };
    this.dataLabels = { enabled: true };
    this.colors = ['#085D3A'];
    this.fill = {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] },
    };
    this.tooltip = { y: { formatter: (val: number) => val.toString() } };
    this.markers = { size: 4 };
    this.cd.detectChanges();
  }
  gasChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Gas Statistics' },
    xAxis: { type: 'category' },
    series: [
      {
        type: 'column',
        name: 'Cities',
        data: [
          { name: 'Cairo', y: 30 },
          { name: 'Giza', y: 40 },
        ],
      },
    ],
  };
  updateGasChart() {
    if (!this.dashboardGasData?.items?.length) return;

    const seriesData = this.dashboardGasData.items.map((item: any) => ({
      name: item.name,
      y: item.value,
      drilldown: item.name,
    }));

    const drilldownSeries = this.dashboardGasData.items.map((item: any) => ({
      id: item.name,
      name: `${item.name} Zones`,
      type: 'column' as const,

      data:
        item.zones?.map((zone: any) => ({
          name: zone.name,
          y: zone.value,
        })) || [],
    }));

    this.gasChartOptions = {
      chart: { type: 'column' },
      title: { text: 'Gas Statistics' },
      subtitle: { text: 'Click a city to see its zones' },
      xAxis: { type: 'category' },
      yAxis: { title: { text: 'Gas Volume' } },
      colors: ['#3538CD'],
      series: [
        {
          type: 'column',
          name: 'Gas',
          data: seriesData,
        },
      ],
      drilldown: {
        series: drilldownSeries,
      },
    };

    this.updateFlag = true;
    this.cd.detectChanges();
  }
}
