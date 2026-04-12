import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StationDetails } from '../../../service/station-details';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ChangeDetectorRef } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexDataLabels,
  ApexTooltip,
  ApexTitleSubtitle,
  ApexGrid,
  ApexNoData,
  ApexFill,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  colors: string[];
  grid: ApexGrid;
  noData: ApexNoData;
  fill: ApexFill;
  legend: ApexLegend;
};

@Component({
  selector: 'app-dispenser-history',
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './dispenser-history.html',
  styleUrl: './dispenser-history.scss',
})
export class DispenserHistory {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  @Input() machineId: any;
  @Input() dispenserNo: any;
  @Input() paramName: any;

  date: string = new Date().toISOString().split('T')[0]; // today
  timeFrom: string = '08:00:00';
  timeTo: string = '12:00:00';
  intervalMinutes: number = 15;

  historyData: any[] = [];
  isLoading = false;
  constructor(
    private _StationDetails: StationDetails,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    // this.loadHistory();
  }

  ngOnChanges() {
    // if (this.machineId && this.dispenserNo && this.paramName) {
    //   this.loadHistory();
    // }
  }

  loadHistory() {
    console.log('Loading history for:', {
      machineId: this.machineId,
      dispenserNo: this.dispenserNo,
      paramName: this.paramName,
    });
    if (!this.machineId || !this.dispenserNo || !this.paramName) {
      console.log(' MISSING VALUES - stopping here');
      return;
    }
    this.isLoading = true;

    const timeFrom = this.timeFrom.length === 5 ? `${this.timeFrom}:00` : this.timeFrom;
    const timeTo = this.timeTo.length === 5 ? `${this.timeTo}:00` : this.timeTo;

    // Format date as full datetime if API needs it
    const formattedDate = `${this.date}T00:00:00`;

    console.log(' date:', formattedDate);
    console.log(' timeFrom:', timeFrom);
    console.log(' timeTo:', timeTo);
    console.log(' interval:', this.intervalMinutes);

    this._StationDetails
      .getHistoryDispenser(
        this.machineId,
        this.dispenserNo,
        this.paramName,
        formattedDate,
        timeFrom,
        timeTo,
        this.intervalMinutes,
      )
      .subscribe({
        next: (res: any) => {
          console.log(' Response:', res);
          this.historyData = res;
          this.cdr.detectChanges();
          this.isLoading = false;
          this.renderChart();
        },
        error: (err) => {
          console.error(' Error:', err);
          this.isLoading = false;
        },
      });
  }

  renderChart() {
    const seriesData = this.historyData.map((item: any) => ({
      x: new Date(item.time).getTime(),
      y: item.averageValue,
    }));

    console.log('Series data mapped:', seriesData);

    this.chartOptions = {};

    // setTimeout(() => {
    //   this.chartOptions = {
    //     series: [{ name: this.paramName, data: seriesData }],
    //     chart: {
    //       type: 'area',
    //       height: 350,
    //       zoom: { enabled: true },
    //       toolbar: { show: true },
    //       animations: { enabled: false },
    //     },
    //     dataLabels: { enabled: false },
    //     stroke: { curve: 'smooth', width: 2 },
    //     fill: {
    //       type: 'gradient',
    //       gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 },
    //     },
    //     title: {
    //       text: `${this.paramName} History`,
    //       align: 'left',
    //       style: { fontSize: '14px', fontWeight: 600, color: '#374151' },
    //     },
    //     xaxis: {
    //       type: 'datetime',
    //       labels: { datetimeUTC: false, format: 'HH:mm' },
    //       title: { text: 'Time' },
    //     },
    //     yaxis: {
    //       min: -10,
    //       title: { text: this.paramName },
    //       labels: { formatter: (val: number) => val.toFixed(2) },
    //     },
    //     tooltip: {
    //       x: { format: 'dd MMM yyyy HH:mm' },
    //       y: { formatter: (val: number) => `${val.toFixed(2)}` },
    //     },
    //     colors: ['#3b82f6'],
    //     grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
    //     legend: { show: true, horizontalAlign: 'left' },
    //     noData: {
    //       text: 'No data available',
    //       align: 'center',
    //       verticalAlign: 'middle',
    //       style: { color: '#9ca3af', fontSize: '14px' },
    //     },
    //   };
    // }, 0);
  }
}
