import { Component, OnInit } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Table } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AllStation } from '../../service/all-station';
import { ChangeDetectorRef } from '@angular/core';
import { IZone } from '../../model/zone';
@Component({
  selector: 'app-station',
  imports: [SelectModule, DatePickerModule, CommonModule, FormsModule, TableModule, RouterLink],
  templateUrl: './station.html',
  styleUrl: './station.scss',
})
export class Station implements OnInit {
  constructor(
    private router: Router,
    private Station: AllStation,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}
  @ViewChild('dt', { static: false }) dt!: Table;

  date: Date | any;
  stationSummary: any = {};
  allSation: any[] = [];
  allStationsCopy: any[] = [];
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  zone: IZone[] = [];
  filteredStations: any[] = [];
  selectedZoneId: number | null = null;
  status: any[] = [];
  searchTerm: string = '';
  ngOnInit(): void {
    this.onGetSummaryStation();
    this.onGetAllStation();
    this.onGetAllZone();
  }
  exportPDF() {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['Station', 'Zone', 'Dispensers', 'Status', 'Last Update']],
      body: this.allSation.map((s: any) => [
        s.Station,
        s.Zone,

        s.Dispensers,
        s.Status,

        s.lastUpdate,
      ]),
    });

    doc.save('stations.pdf');
  }
  exportCSV() {
    if (!this.allSation?.length) return;

    const headers = ['Station', 'Zone', 'Dispensers', 'Status', 'Last Update'];

    const rows = this.allSation.map((s) => [
      s.stationName,
      s.zoneName,
      s.dispensersTotal,
      s.status,
      s.lastUpdate,
    ]);

    let csvContent = headers.join(',') + '\n' + rows.map((e) => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'stations.csv';
    link.click();
  }
  openDetails(station: any) {
    this.router.navigate(['/dashboard/station-details', station.id]);
  }
  onGetSummaryStation() {
    this.Station.getStationSummary().subscribe({
      next: (res) => {
        this.stationSummary = res;
        this.changeDetectorRef.detectChanges();
        console.log(this.stationSummary);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  loadStations(event: any) {
    this.pageSize = event.rows;
    this.page = event.first / event.rows + 1;

    this.onGetAllStation();
  }
  onGetAllStation() {
    this.Station.getAllStations(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.allSation = res.items;
        this.allStationsCopy = res.items;
        this.filteredStations = res.items;
        this.totalRecords = res.totalCount;
        // use set for remove dublicate and use (...) to convert object to array
        const uniqueStatus = [...new Set(res.items.map((s: any) => s.status))];
        this.status = uniqueStatus.map((s: any) => ({
          label: s,
          value: s,
        }));

        console.log('status:', this.status);
        this.changeDetectorRef.detectChanges();
        console.log(this.allSation);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  filterStatus(status: any) {
    this.allSation = this.allStationsCopy.filter((x) => x.status === status);
  }

  onGetAllZone() {
    this.Station.getAllZones().subscribe({
      next: (res) => {
        this.zone = res;

        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  filterZone(zoneId: number | null) {
    if (!zoneId) {
      this.filteredStations = this.allSation;
      return;
    }

    this.filteredStations = this.allSation.filter((s) => s.zoneId === zoneId);
  }
  onSearch() {
    this.page = 1;
    this.onGetAllStation();
  }
}
