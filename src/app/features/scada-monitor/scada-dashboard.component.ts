import { Component, inject, computed, signal, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScadaDataBridgeService } from './services/scada-data-bridge.service';
import { StationConfigService } from '../station-config/service/station-config.service';
import { CompressorIconComponent } from './components/icons/compressor-icon.component';
import { DispenserIconComponent } from './components/icons/dispenser-icon.component';
import { NozzleIconComponent } from './components/icons/nozzle-icon.component';
import { firstValueFrom } from 'rxjs';

// PrimeNG
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-scada-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CompressorIconComponent, 
    DispenserIconComponent, 
    NozzleIconComponent,
    ToggleButtonModule,
    DrawerModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule
  ],
  templateUrl: './scada-dashboard.component.html',
  styleUrl: './scada-dashboard.component.scss'
})
export class ScadaDashboardComponent implements OnInit {
  private bridge = inject(ScadaDataBridgeService);
  private config = inject(StationConfigService);

  // States
  stations = this.bridge.activeStations;
  eventLog = this.bridge.eventLog;
  
  isControlMode = signal(false);
  showLog = signal(false);
  gatewayIp = '10.11.140.37';

  searchQuery = signal('');
  selectedZone = signal<string | null>(null);
  zones = signal<any[]>([]);

  // Computed
  filteredStations = computed(() => {
    const search = this.searchQuery().toLowerCase();
    const zone = this.selectedZone();
    return this.stations().filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search);
      const matchesZone = !zone || s.zone === zone;
      return matchesSearch && matchesZone;
    });
  });

  lastUpdateTime = computed(() => {
    const s = this.stations();
    return s.length > 0 ? s[0].lastSignal : new Date();
  });

  newEventsCount = computed(() => this.eventLog().length);

  async ngOnInit() {
    try {
      const allZones = await firstValueFrom(this.config.getZones());
      this.zones.set(allZones.map(z => ({ label: z.name, value: z.name })));
    } catch (e) {
      console.error('Failed to load zones', e);
    }
  }

  sendCommand(stationId: number, type: string, targetId?: number) {
    console.log(`[SCADA COMMAND] Station: ${stationId} | Action: ${type} ${targetId ? '| Target: ' + targetId : ''}`);
    const actionDesc = targetId ? `${type} for Unit ${targetId}` : type;
    this.bridge.eventLog.update(logs => [{
      stationId,
      message: `COMMAND EXECUTED: ${actionDesc}`,
      timestamp: new Date()
    }, ...logs]);
  }
}
