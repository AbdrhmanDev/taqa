import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-dispensers',
  imports: [TabsModule, SelectModule, DatePickerModule, CommonModule, FormsModule, TableModule],
  templateUrl: './dispensers.html',
  styleUrl: './dispensers.scss',
})
export class Dispensers {
  dispenser = [
    {
      Station: 'North city nasr',
      Zone: 'Cairo,Egypt',
      Compressors: '1',
      Dispensers: '6/8',

      Status: 'Offline',
      ChangeBy: 'Olivia Rhye',
      waiting: '0.5s',
    },
    {
      Station: 'North city nasr',
      Zone: 'Cairo,Egypt',
      Compressors: '2',

      Dispensers: '2/8',
      Status: 'Online',
      ChangeBy: 'Olivia Rhye',
      waiting: '0.5s',
    },
    {
      Station: 'North city nasr',
      Zone: 'Cairo,Egypt',
      Compressors: '4',

      Dispensers: '3/8',
      Status: 'Online',
      ChangeBy: 'Olivia Rhye',
      waiting: '0.5s',
    },
  ];
}
