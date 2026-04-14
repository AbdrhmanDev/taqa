import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { StationConfigService } from '../station-config/service/station-config.service';

export interface StationNode {
  stationId: number;
  name: string;
  status: string; // Active/Warning/Inactive
  connectivity: string; // Online/Offline
  installation: string; // Installed/Not Installed
}

export interface AreaNode {
  areaId: number;
  name: string;
  stations: StationNode[];
  activeCount: number;
  totalCount: number;
  isExpanded?: boolean;
}

export interface ZoneNode {
  zoneId: number;
  name: string;
  areas: AreaNode[];
  activeCount: number;
  totalCount: number;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-station-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './station-hierarchy.html',
  styleUrl: './station-hierarchy.scss',
})
export class StationHierarchyComponent implements OnInit {
  private service = inject(StationConfigService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  
  allZones: ZoneNode[] = [];
  filteredZones: ZoneNode[] = [];
  loading: boolean = false;

  ngOnInit() {
    console.log('StationHierarchyComponent initialized.');
    this.loadHierarchy();
  }

  loadHierarchy() {
    this.loading = true;
    console.log('API call started to GetAllZonesWithStations...');
    this.service.getZonesWithStations().subscribe({
      next: (res: any) => {
        try {
          console.log('API call success. Data received:', res);
          const data = res?.items || res?.data || (Array.isArray(res) ? res : []);
          this.allZones = this.mapToZoneNodes(data);
          this.filteredZones = [...this.allZones];
          
          console.log('Mapping completed. allZones count:', this.allZones.length);
        } catch (error) {
          console.error('Error in next block:', error);
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('API call failed:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapToZoneNodes(zones: any[]): ZoneNode[] {
    return (zones || []).map((zone: any) => {
      const areas: AreaNode[] = (zone.areas || []).map((area: any) => {
        const stations: StationNode[] = (area.stations || []).map((s: any) => ({
          stationId: s.stationId,
          name: s.name,
          status: s.status || 'Active',
          connectivity: s.status === 'Inactive' ? 'Offline' : (s.status === 'Warning' ? 'Warning' : 'Online'),
          installation: s.installation || 'Installed'
        }));

        return {
          areaId: area.areaId,
          name: area.name,
          stations: stations,
          activeCount: stations.filter((s: StationNode) => s.status === 'Active').length,
          totalCount: stations.length,
          isExpanded: false
        };
      });

      return {
        zoneId: zone.zoneId,
        name: zone.name,
        areas: areas,
        activeCount: areas.reduce((acc, a) => acc + a.activeCount, 0),
        totalCount: areas.reduce((acc, a) => acc + a.totalCount, 0),
        isExpanded: true // Open by default
      };
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (!query) {
      this.filteredZones = [...this.allZones];
      return;
    }

    this.filteredZones = this.allZones.map(zone => {
      const filteredAreas = zone.areas.map(area => {
        const filteredStations = area.stations.filter(s => 
          s.name.toLowerCase().includes(query)
        );
        return { ...area, stations: filteredStations, isExpanded: filteredStations.length > 0 };
      }).filter(area => area.stations.length > 0 || area.name.toLowerCase().includes(query));

      return { 
        ...zone, 
        areas: filteredAreas, 
        isExpanded: filteredAreas.length > 0 
      };
    }).filter(zone => zone.areas.length > 0 || zone.name.toLowerCase().includes(query));
  }

  toggleZone(zone: ZoneNode) {
    zone.isExpanded = !zone.isExpanded;
  }

  toggleArea(area: AreaNode, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    area.isExpanded = !area.isExpanded;
  }

  editZone(zone: ZoneNode, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    const newName = window.prompt('Enter new Zone Name:', zone.name);
    if (newName !== null && newName.trim() !== '') {
      this.service.updateZone(zone.zoneId, newName.trim()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Zone updated successfully' });
          this.loadHierarchy();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update Zone' });
        }
      });
    }
  }

  deleteZone(zone: ZoneNode, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete Zone "${zone.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.deleteZone(zone.zoneId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Zone deleted successfully' });
            this.loadHierarchy();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete Zone' });
          }
        });
      }
    });
  }

  goToStationDetails(stationId: number) {
    this.router.navigate(['/dashboard/station-details', stationId]);
  }

  addZone() {
    const newName = window.prompt('Enter new Zone Name:');
    if (newName !== null && newName.trim() !== '') {
      this.service.createZone(newName.trim()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Zone created successfully' });
          this.loadHierarchy();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create Zone' });
        }
      });
    }
  }

  addStationToArea(area: AreaNode) {
    this.router.navigate(['/dashboard/station-config']);
  }
}
