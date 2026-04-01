import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../services/zone.service';
import { Izone } from '../../models/izone';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, FormsModule],
  templateUrl: './zones.html',
  styleUrl: './zones.scss'
})
export class ZonesComponent implements OnInit {
  zones: Izone[] = [];
  
  showAddPopup = false;
  showEditPopup = false;
  showDeletePopup = false;
  
  selectedZone!: Izone;
  
  newZoneName = '';
  editZoneName = '';

  constructor(private zoneService: ZoneService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    this.zoneService.getAllZones().subscribe({
      next: (res: Izone[]) => {
        this.zones = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err)
    });
  }

  openAdd() {
    this.newZoneName = '';
    this.showAddPopup = true;
  }

  saveAdd() {
    if (!this.newZoneName.trim()) return;
    this.zoneService.addZone(this.newZoneName).subscribe({
      next: () => {
        this.showAddPopup = false;
        this.loadZones();
      },
      error: (err: any) => console.error(err)
    });
  }

  openEdit(zone: Izone) {
    this.selectedZone = zone;
    this.editZoneName = zone.name;
    this.showEditPopup = true;
  }

  saveEdit() {
    if (!this.editZoneName.trim()) return;
    this.zoneService.updateZone(this.selectedZone.zoneId, this.editZoneName).subscribe({
      next: () => {
        this.showEditPopup = false;
        this.loadZones();
      },
      error: (err: any) => console.error(err)
    });
  }

  openDelete(zone: Izone) {
    this.selectedZone = zone;
    this.showDeletePopup = true;
  }

  confirmDelete() {
    this.zoneService.deleteZone(this.selectedZone.zoneId).subscribe({
      next: () => {
        this.showDeletePopup = false;
        this.loadZones();
      },
      error: (err: any) => console.error(err)
    });
  }
}
