import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-station',
  imports: [SelectModule, DatePickerModule, CommonModule, FormsModule, TableModule],
  templateUrl: './station.html',
  styleUrl: './station.scss',
})
export class Station {
  date: Date | any;
  station = [
    {
      Ticket_ID: '1000',
      Station: 'El obour',
      Date: '09:29:30 2025-06-01',

      Throughput: 'Assigned Engineer',
      status: 'Pending visit',
    },
    {
      Ticket_ID: '2000',
      Station: 'El obour',
      Date: '09:29:30 2025-06-01',

      Throughput: 'Assigned Engineer',
      status: 'Pending visit',
    },
  ];
}
