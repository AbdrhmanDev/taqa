import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Delete } from '../../../../shared/delete/delete';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-alarm-view',
  imports: [CommonModule, Delete, DialogModule],
  templateUrl: './alarm-view.html',
  styleUrl: './alarm-view.scss',
})
export class AlarmView {
  showdeletePopup = false;
  isActive = true;
  severity = 'Critical';
  alarmTitle = 'Dispenser High Pressure Alert';

  alarm = {
    source: 'Dispenser',
    scope: 'All Stations (Global)',
    createdBy: 'Admin User',
    createdDate: '1/15/2026',
    description: 'Alert when dispenser pressure exceeds safe limits',
    frequencyCount: 10,
    frequencyMinutes: 10,
    durationMinutes: 10,
    actions: [
      {
        type: 'ticket',
        title: 'Create Maintenance Ticket',
        description: 'Priority: Critical • Auto-Assign: Engineering Team',
      },
      {
        type: 'email',
        title: 'Email Notification',
        description: 'Recipients: engineer@company.com, manager@company.com',
      },
    ],
  };

  toggleStatus() {
    this.isActive = !this.isActive;
  }
  openDelete() {
    this.showdeletePopup = true;
  }
}
