import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-logs-user',
  imports: [TableModule],
  templateUrl: './logs-user.html',
  styleUrl: './logs-user.scss',
})
export class LogsUser {
  logs = [
    {
      Date: '09:29:30 2025-06-01',

      Module: 'Devices',
      Target: 'Dispenser D-47',
      Event: 'Created Dispenser D-47',
    },
    {
      Date: '09:29:30 2025-06-01',

      Module: 'Devices',
      Target: 'Dispenser D-47',
      Event: 'Created Dispenser D-47',
    },
    {
      Date: '09:29:30 2025-06-01',

      Module: 'Devices',
      Target: 'Dispenser D-47',
      Event: 'Created Dispenser D-47',
    },
  ];
}
