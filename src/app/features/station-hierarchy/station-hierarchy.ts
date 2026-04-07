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
  zoneId: number;
  zoneName: string;
  stations: StationNode[];
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
  
  allAreas: AreaNode[] = [];
  filteredAreas: AreaNode[] = [];
  areaOptions: any[] = [];
  selectedArea: any = null;
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
          this.allAreas = this.mapToAreaNodes(data);
          this.filteredAreas = [...this.allAreas];
          
          this.areaOptions = [
            { name: 'All Areas', value: null },
            ...this.allAreas.map((a: AreaNode) => ({ name: a.name, value: a.areaId }))
          ];
          
          console.log('Mapping completed. allAreas count:', this.allAreas.length);
        } catch (error) {
          console.error('Error in next block:', error);
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
          console.log('Loading set to false. Change detection triggered.');
        }
      },
      error: (err) => {
        console.error('API call failed:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapToAreaNodes(zones: any[]): AreaNode[] {
    const areas: AreaNode[] = [];
    
    zones.forEach((zone: any) => {
      (zone.areas || []).forEach((area: any) => {
        const stations: StationNode[] = (area.stations || []).map((s: any) => ({
          stationId: s.stationId,
          name: s.name,
          status: s.status || 'Active',
          connectivity: s.status === 'Inactive' ? 'Offline' : 'Online',
          installation: s.installation || 'Installed'
        }));

        areas.push({
          areaId: area.areaId,
          name: area.name,
          zoneId: zone.zoneId,
          zoneName: zone.name,
          stations: stations,
          activeCount: stations.filter((s: StationNode) => s.status === 'Active').length,
          totalCount: stations.length,
          isExpanded: false
        });
      });
    });
    
    return areas;
  }

  onAreaChange() {
    if (this.selectedArea === null) {
      this.filteredAreas = [...this.allAreas];
    } else {
      this.filteredAreas = this.allAreas.filter((a: AreaNode) => a.areaId === this.selectedArea);
    }
  }

  toggleExpand(area: AreaNode, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    area.isExpanded = !area.isExpanded;
  }

  editZone(area: AreaNode, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    const newName = window.prompt('Enter new Zone Name:', area.zoneName);
    if (newName !== null && newName.trim() !== '') {
      this.service.updateZone(area.zoneId, newName.trim()).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Zone updated successfully' });
          this.loadHierarchy(); // reload to reflect changes globally
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update Zone' });
        }
      });
    }
  }

  deleteZone(area: AreaNode, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete Zone "${area.zoneName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.deleteZone(area.zoneId).subscribe({
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
          this.loadHierarchy(); // reload to reflect changes globally
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create Zone' });
        }
      });
    }
  }

  addStationToArea(area: AreaNode) {
    // The user requested to navigate to /dashboard/station-config
    this.router.navigate(['/dashboard/station-config']);
  }
}
