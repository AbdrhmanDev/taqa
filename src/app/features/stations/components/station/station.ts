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

@Component({
  selector: 'app-station',
  imports: [SelectModule, DatePickerModule, CommonModule, FormsModule, TableModule, RouterLink],
  templateUrl: './station.html',
  styleUrl: './station.scss',
})
export class Station implements OnInit {
  constructor(private router: Router) {}
  @ViewChild('dt', { static: false }) dt!: Table;
  date: Date | any;
  station = [
    {
      Station: 'North city nasr',
      Zone: 'Cairo,Egypt',
      Compressors: '1',
      Dispensers: '6/8',

      Status: 'Offline',
      ChangeBy: 'Olivia Rhye',
      lastUpdate: '09:29:30 2025-06-01',
    },
    {
      Station: 'North city nasr',
      Zone: 'Cairo,Egypt',
      Compressors: '2',

      Dispensers: '2/8',
      Status: 'Online',
      ChangeBy: 'Olivia Rhye',
      lastUpdate: '09:29:30 2025-06-01',
    },
    {
      Station: 'North city nasr',
      Zone: 'Cairo,Egypt',
      Compressors: '4',

      Dispensers: '3/8',
      Status: 'Online',
      ChangeBy: 'Olivia Rhye',
      lastUpdate: '09:29:30 2025-06-01',
    },
  ];
  ngOnInit(): void {}
  exportPDF() {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [
        ['Station', 'Zone', 'Compressors', 'Dispensers', 'Status', 'Change By', 'Last Update'],
      ],
      body: this.station.map((s: any) => [
        s.Station,
        s.Zone,
        s.Compressors,
        s.Dispensers,
        s.Status,
        s.ChangeBy,
        s.lastUpdate,
      ]),
    });

    doc.save('stations.pdf');
  }
  exportCSV() {
    if (this.dt && this.dt.value?.length) {
      this.dt.exportCSV();
    } else {
      console.warn('Table not ready or no data to export');
    }
  }
  openDetails() {
    this.router.navigate(['/dashboard/station-details']);
  }
}
