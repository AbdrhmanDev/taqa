import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-requests',
  imports: [SelectModule, DatePickerModule, CommonModule, FormsModule, TableModule, RouterLink],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
})
export class Requests {
  date: Date | any;
  tickets = [
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
