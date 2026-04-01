import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AreaService } from '../../services/area.service';
import { ZoneService } from '../../../zone/services/zone.service';
import { Iarea } from '../../models/iarea';
import { Izone } from '../../../zone/models/izone';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './areas.html',
  styleUrl: './areas.scss',
})
export class AreasComponent implements OnInit {
  areas: Iarea[] = [];
  zones: Izone[] = [];

  showAddPopup = false;
  showEditPopup = false;
  showDeletePopup = false;

  selectedArea!: Iarea;

  newAreaName = '';
  newAreaZone: Izone | null = null;

  editAreaName = '';
  editAreaZone: Izone | null = null;

  constructor(
    private areaService: AreaService,
    private zoneService: ZoneService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAreas();
    this.loadZones();
  }

  loadAreas() {
    this.areaService.getAllAreas().subscribe({
      next: (res: Iarea[]) => {
        this.areas = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err),
    });
  }

  loadZones() {
    this.zoneService.getAllZones().subscribe({
      next: (res: Izone[]) => {
        this.zones = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err),
    });
  }

  openAdd() {
    this.newAreaName = '';
    this.newAreaZone = null;
    this.showAddPopup = true;
  }

  saveAdd() {
    if (!this.newAreaName.trim() || !this.newAreaZone) return;
    this.areaService
      .addArea({ name: this.newAreaName, zoneId: this.newAreaZone.zoneId })
      .subscribe({
        next: () => {
          this.showAddPopup = false;
          this.loadAreas();
        },
        error: (err: any) => console.error(err),
      });
  }

  openEdit(area: Iarea) {
    this.selectedArea = area;
    this.editAreaName = area.name;
    this.editAreaZone = this.zones.find((z) => z.zoneId === area.zoneId) || null;
    this.showEditPopup = true;
  }

  saveEdit() {
    if (!this.editAreaName.trim() || !this.editAreaZone) return;
    this.areaService
      .updateArea(this.selectedArea.areaId, {
        name: this.editAreaName,
        zoneId: this.editAreaZone.zoneId,
      })
      .subscribe({
        next: () => {
          this.showEditPopup = false;
          this.loadAreas();
        },
        error: (err: any) => console.error(err),
      });
  }

  openDelete(area: Iarea) {
    this.selectedArea = area;
    this.showDeletePopup = true;
  }

  confirmDelete() {
    this.areaService.deleteArea(this.selectedArea.areaId).subscribe({
      next: () => {
        this.showDeletePopup = false;
        this.loadAreas();
      },
      error: (err: any) => console.error(err),
    });
  }
}
