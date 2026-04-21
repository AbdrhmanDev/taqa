import { CommonModule } from '@angular/common';
import { Component, NgZone, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedData } from '../../../../shared/service/shared-data';
import { ChangeDetectorRef } from '@angular/core';

import { HighchartsChartModule } from 'highcharts-angular';
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

import * as Highcharts from 'highcharts';
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);

@Component({
  selector: 'app-chart-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, HighchartsChartModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './chart-dashboard.html',
  styleUrl: './chart-dashboard.scss',
})
export class ChartDashboard implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
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
  selectedTime: number = 0;
  dashboardGasData: any = [];
  dashboardRevenueData: any = [];
  updateFlag = false;

  constructor(
    private sharedData: SharedData,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.getGasData();
    this.getRevenueData();
  }

  getGasData() {
    this.sharedData.dashboardGas$.subscribe({
      next: (data: any) => {
        this.dashboardGasData = data;
        this.updateGasChart();
      },
      error: (error: any) => console.log(error),
    });
  }

  getRevenueData() {
    this.sharedData.dashboardRevenue$.subscribe({
      next: (data: any) => {
        this.dashboardRevenueData = data;
        this.updateRevenueChart();
      },
      error: (error: any) => console.log(error),
    });
  }

  updateRevenueChart() {
    if (!this.dashboardRevenueData?.revenueByZone?.length) return;
    this.series = [
      {
        name: 'Revenue',
        data: this.dashboardRevenueData.revenueByZone.map((i: any) => i.totalRevenue),
      },
    ];
    this.chart = { type: 'area', height: 350, toolbar: { show: false } };
    this.xaxis = {
      type: 'category',
      categories: this.dashboardRevenueData.revenueByZone.map((i: any) => i.zoneName),
    };
    this.yaxis = {
      labels: {
        formatter: (val: number) => val?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      },
      title: { text: 'Revenue' }
    };
    this.dataLabels = {
      enabled: true,
      formatter: (val: number) => val?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
    this.colors = ['#085D3A'];
    this.fill = {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] },
    };
    this.tooltip = { y: { formatter: (val: number) => val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } };
    this.markers = { size: 4 };
    setTimeout(() => this.cd.detectChanges(), 0);
  }

  gasChartOptions: any = {
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

  updateGasChart(): void {
    if (!this.dashboardGasData?.zoneProduction?.length) return;

    const { zoneProduction, compressorProduction, dispenserProduction } = this.dashboardGasData;

    const normalize = (value: string) =>
      value
        ?.replace(/\r?\n|\r/g, '')
        .trim()
        .replace(/\s+/g, '')
        .toLowerCase();

    // ZONES
    const zoneSeries = zoneProduction.map((zone: any) => ({
      name: zone.name,
      y: +zone.value || 0,
      drilldown: `zone-${normalize(zone.name)}`,
    }));

    const compressorDrilldown = compressorProduction.map((zone: any) => ({
      id: `zone-${normalize(zone.zoneName)}`,
      type: 'column',
      data: zone.data
        .filter((c: any) => c.value > 0)
        .map((comp: any) => ({
          name: comp.name.trim(),
          y: +comp.value || 0,
          drilldown: `compressor-${normalize(comp.name)}`,
        })),
    }));

    // DISPENSERS
    const dispenserDrilldown = dispenserProduction.map((comp: any) => ({
      id: `compressor-${normalize(comp.compressorName)}`,
      type: 'column',
      data: comp.data
        .filter((d: any) => d.value > 0)
        .map((disp: any) => ({
          name: disp.name.trim(),
          y: +disp.value || 0,
        })),
    }));

    console.log(
      'addSeriesAsDrilldown:',
      !!(Highcharts as any).Chart?.prototype?.addSeriesAsDrilldown,
    );

    this.gasChartOptions = {
      chart: { type: 'column' },
      title: { text: 'Gas Production Hierarchy' },
      colors: ['#3538CD'],
      subtitle: { text: 'Zone → Compressor → Dispenser' },
      xAxis: { type: 'category' },
      yAxis: {
        labels: {
          formatter: function (this: any) {
            return Highcharts.numberFormat(this.value, 2, '.', ',');
          },
        },
      },
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b><br/>',
      },
      series: [{ type: 'column', name: 'Zones', data: zoneSeries }],
      drilldown: {
        series: [...compressorDrilldown, ...dispenserDrilldown],
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            format: '{point.y:,.2f}',
          },
        },
      },
      credits: { enabled: false },
    };

    setTimeout(() => {
      this.updateFlag = true;
      this.cd.detectChanges();
    }, 0);
  }
}
