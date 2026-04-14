import { Component, Input, OnInit, OnChanges, ViewChild, SimpleChanges } from '@angular/core';
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['machineId'] || changes['dispenserNo'] || changes['paramName']) {
      if (this.machineId && this.dispenserNo && this.paramName) {
        this.loadHistory(true);
      }
    }
  }

  loadHistory(isInitial: boolean = false) {
    if (!this.machineId || !this.dispenserNo || !this.paramName) {
      return;
    }
    this.isLoading = true;

    if (isInitial) {
      this._StationDetails
        .getHistoryDispenser(this.machineId, this.dispenserNo, this.paramName)
        .subscribe({
          next: (res: any) => {
            this.historyData = res;
            this.isLoading = false;
            this.renderChart();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Initial Error:', err);
            this.isLoading = false;
          },
        });
    } else {
      const timeFrom = this.timeFrom.length === 5 ? `${this.timeFrom}:00` : this.timeFrom;
      const timeTo = this.timeTo.length === 5 ? `${this.timeTo}:00` : this.timeTo;
      const formattedDate = `${this.date}T00:00:00`;

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
            this.historyData = res;
            this.isLoading = false;
            this.renderChart();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Filtered Error:', err);
            this.isLoading = false;
          },
        });
    }
  }

  renderChart() {
    const seriesData = this.historyData.map((item: any) => ({
      x: new Date(item.time).getTime(),
      y: item.averageValue || 0,
    }));

    this.chartOptions = {
      series: [{ name: this.paramName, data: seriesData }],
      chart: {
        type: 'area',
        height: 350,
        zoom: { enabled: true },
        toolbar: { show: true },
        animations: { enabled: true },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 },
      },
      title: {
        text: `${this.paramName} History`,
        align: 'left',
        style: { fontSize: '16px', fontWeight: 600, color: '#374151' },
      },
      xaxis: {
        type: 'datetime',
        labels: { datetimeUTC: false, format: 'HH:mm' },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        title: { text: this.paramName },
        labels: { formatter: (val: number) => val.toFixed(2) },
      },
      tooltip: {
        x: { format: 'dd MMM yyyy HH:mm' },
        y: { formatter: (val: number) => `${val.toFixed(2)}` },
      },
      colors: ['#3b82f6'],
      grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
      legend: { show: false },
      noData: {
        text: 'Loading or no data available...',
        align: 'center',
        verticalAlign: 'middle',
        style: { color: '#9ca3af', fontSize: '14px' },
      },
    };
    this.cdr.detectChanges();
  }
}
