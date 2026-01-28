import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent, ChartType, NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexMarkers,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexFill,
} from 'ng-apexcharts';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  colors: string[];
};
@Component({
  selector: 'app-chart-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './chart-dashboard.html',
  styleUrl: './chart-dashboard.scss',
})
export class ChartDashboard implements OnInit {
  public chart!: ApexChart;
  public series!: ApexAxisChartSeries;
  public dataLabels!: ApexDataLabels;
  public markers!: ApexMarkers;
  public title!: ApexTitleSubtitle;
  public fill!: ApexFill;
  public yaxis!: ApexYAxis;
  public xaxis!: ApexXAxis;
  public tooltip!: ApexTooltip;

  private dataSeries: any[][] = [];
  public colors!: string[];

  // @ViewChild("chart") chart: ChartComponent | undefined;

  constructor() {
    this.dataSeries = [[], []];
  }

  ngOnInit(): void {
    this.initDataSeries();
    this.initChartData();
  }

  private initDataSeries(): void {
    for (let i = 0; i < 120; i++) {
      this.dataSeries[1].push({ value: Math.floor(Math.random() * 1000) });
    }
  }

  private initChartData(): void {
    let ts2 = 1484418600000;
    let dates = [];

    for (let i = 0; i < 120; i++) {
      ts2 = ts2 + 86400000;
      dates.push([ts2, this.dataSeries[1][i].value]);
    }

    this.series = [
      {
        name: 'XYZ MOTORS',
        data: dates,
      },
    ];
    this.colors = ['#085D3A'];

    this.chart = {
      id: 'inflation-bar-chart',
      type: 'area',
      stacked: false,
      height: 350,
      width: 700,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: 'zoom',
      },
    };

    this.dataLabels = {
      enabled: false,
    };

    this.markers = {
      size: 0,
    };

    this.title = {
      text: '',
      align: 'left',
    };

    this.fill = {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    };

    this.yaxis = {
      labels: {
        formatter: function (val) {
          return (val / 1000000).toFixed(0);
        },
      },
      title: {
        text: 'Price',
      },
    };

    this.xaxis = {
      type: 'datetime',
    };

    this.tooltip = {
      shared: false,
      y: {
        formatter: function (val) {
          return (val / 1000000).toFixed(0);
        },
      },
    };
  }
  // chart Gas
  public chartOptions: ChartOptions = {
    series: [
      {
        name: 'Inflation',
        data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
      },
    ],
    colors: ['#3538CD'],

    chart: {
      height: 350,
      type: 'bar' as ChartType,
    },

    plotOptions: {
      bar: {
        dataLabels: {
          position: 'top',
        },
      },
    },

    dataLabels: {
      enabled: true,
      formatter: (val: number) => val + '%',
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#3538CD'],
      },
    },

    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      position: 'top',
      labels: {
        offsetY: -18,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.25,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [50, 0, 100, 100],
      },
    },

    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        show: false,
        formatter: (val: number) => val + '%',
      },
    },

    title: {
      text: '',
      floating: false,
      offsetY: 320,
      align: 'left',
      style: {
        color: '#3538CD',
      },
    },
  };
}
