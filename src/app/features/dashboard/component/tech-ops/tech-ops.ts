import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-tech-ops',
  imports: [SelectModule, FormsModule],
  templateUrl: './tech-ops.html',
  styleUrl: './tech-ops.scss',
})
export class TechOps {
  showZoneDropdown = false;
  selectedZone = 'All Zones';
  zones = ['All Zones', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
}
