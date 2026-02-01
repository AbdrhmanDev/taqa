import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { PrimeIcons } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartPrice } from '../chart-price/chart-price';
import { BrowserModule } from '@angular/platform-browser';
@Component({
  selector: 'app-tarrif',
  imports: [TabsModule, TableModule, CommonModule, FormsModule, ChartPrice],
  templateUrl: './tarrif.html',
  styleUrl: './tarrif.scss',
})
export class Tarrif {
  priceMode: 'unified' | 'station' = 'unified';
  editingStation: any = null;
  get buttonClass() {
    if (this.priceMode === 'unified') {
      return 'bg-gray-300 text-white px-3 py-1 rounded-sm p-4 flex items-center gap-2';
    } else {
      return 'bg-indigo-600 text-white px-3 py-1 rounded-sm p-4 hover:bg-indigo-700 transition flex items-center gap-2';
    }
  }
  cancelEdit(station: any) {
    this.editingStation = null;
  }
  stations = [
    {
      name: 'North city nasr',
      id: 'S-78',
      location: 'Main city, city center',
      price: 12.1,
      status: 'Active',
      lastUpdate: '2025',
    },
    {
      name: 'East coast bay',
      id: 'S-79',
      location: 'Main city, city center',
      price: 12.1,
      status: 'Active',
      lastUpdate: '2025',
    },
    {
      name: 'West valley park',
      id: 'S-80',
      location: 'Main city, city center',
      price: 12.1,
      status: 'Maintenance',
      lastUpdate: '2025',
    },
  ];
}
