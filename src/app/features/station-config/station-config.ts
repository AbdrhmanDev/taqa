import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { StationConfigService, Station } from './service/station-config.service';
import { MapComponent } from '../../shared/map/component/map';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-station-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MapComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TabsModule,
    ToastModule,
    ConfirmDialog,
    DialogModule,
  ],
  providers: [MessageService],
  templateUrl: './station-config.html',
  styleUrl: './station-config.scss',
})
export class StationConfig implements OnInit {
  private service = inject(StationConfigService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  stations: Station[] = [];
  filteredStations: Station[] = [];
  dispensers: any[] = [];
  filteredDispensers: any[] = [];
  machines: any[] = [];
  zones: any[] = [];
  loading: boolean = false;
  viewMode: 'list' | 'form' | 'dispenserWizard' = 'list';
  isEditMode: boolean = false;
  editingId: number | null = null;
  stationForm: FormGroup;
  machineForm: FormGroup;
  dispenserForm: FormGroup;
  compressorForm: FormGroup;
  selectedLocation: { lat: number; lng: number } | null = null;
  
  // Dispenser Wizard state
  dispenserStep: number = 1;
  selectedMachine: any = null;
  isNewMachine: boolean = false;

  // Filters (Stations)
  filterZone: any = null;
  filterStatus: any = null;
  searchText: string = '';
  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  // Filters (Dispensers)
  dispenserSearchText: string = '';
  dispenserFilterStatus: any = null;
  dispenserStatusOptions = [
    { label: 'Offline', value: 'Offline' },
    { label: 'Online', value: 'Online' }
  ];

  // Compressors state
  compressors: any[] = [];
  filteredCompressors: any[] = [];
  showCompressorDialog: boolean = false;
  isEditCompressorMode: boolean = false;
  compressorSearchText: string = '';
  compressorManufacturerOptions = [
    { id: 1, name: 'Janasi' },
    { id: 2, name: 'Safe' },
    { id: 3, name: 'IMW' }
  ];

  showConfirmDelete: boolean = false;
  itemToDelete: number | null = null;
  deleteMode: 'station' | 'dispenser' | 'compressor' | 'unlinkCompressor' | 'asset' = 'station';

  // Audit Logs state
  auditLogs: any[] = [];
  filteredAuditLogs: any[] = [];
  auditAssetFilter: any = null;
  auditTypeFilter: any = null;
  auditActionFilter: any = null;
  auditUserFilter: any = null;

  assetTypeOptions = [
    { label: 'Compressor', value: 'Compressor' },
    { label: 'Dispenser', value: 'Dispenser' }
  ];

  actionOptions = [
    { label: 'Link', value: 'Link' },
    { label: 'Unlink', value: 'Unlink' },
    { label: 'Create', value: 'Create' },
    { label: 'Edit', value: 'Edit' },
    { label: 'Delete', value: 'Delete' }
  ];

  // Assets state
  assets: any[] = [];
  filteredAssets: any[] = [];
  showAssetDialog: boolean = false;
  isEditAssetMode: boolean = false;
  assetSearchText: string = '';
  assetForm!: FormGroup;

  constructor() {
    this.stationForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.email]],
      location: ['', Validators.required],
      address: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      priceconversionValue: [10.54, [Validators.required, Validators.min(0)]],
      zoneId: [null, Validators.required],
    });

    this.machineForm = this.fb.group({
      name: ['', Validators.required],
      model: [''],
      code: ['', Validators.required],
      stationId: [null, Validators.required]
    });

    this.dispenserForm = this.fb.group({
      name: ['', Validators.required],
      dispenser_No: [1, [Validators.required, Validators.min(1)]],
      serialNumper: ['', Validators.required],
      machineId: [null],
      stationId: [null]
    });

    this.compressorForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code: ['', Validators.required],
      brokerId: ['', Validators.required],
      serialNumber: ['', Validators.required],
      stationId: [null, Validators.required],
      compressorManufacturerId: [null, Validators.required]
    });

    this.assetForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      serialNumber: ['', Validators.required],
      stationId: [null, Validators.required]
    });

    // Auto-update dispenser name based on machine and number
    this.machineForm.valueChanges.subscribe(() => {
      this.updateDispenserName();
    });
    
    this.dispenserForm.get('dispenser_No')?.valueChanges.subscribe(() => {
      this.updateDispenserName();
    });
  }

  ngOnInit() {
    this.loadStations();
    this.loadZones();
    this.loadDispensers();
    this.loadMachines();
    this.loadCompressors();
    this.loadAuditLogs();
    this.loadAssets();
  }

  loadCompressors() {
    this.service.getCompressors().subscribe((res: any[]) => {
      this.compressors = res;
      this.applyCompressorFilters();
    });
  }

  loadMachines() {
    this.service.getMachines().subscribe(res => {
      this.machines = res;
    });
  }

  loadStations() {
    this.loading = true;
    this.service.getStations(1, 100, this.searchText).subscribe({
      next: (res) => {
        const allStations = res.items || res.data || res;
        this.stations = allStations;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loading = false),
    });
  }

  loadDispensers() {
    this.service.getDispensers().subscribe((res: any[]) => {
      this.dispensers = res;
      this.applyDispenserFilters();
      this.cdr.detectChanges();
    });
  }

  loadAuditLogs() {
    this.service.getAssetLinkHistory().subscribe((res: any[]) => {
      this.auditLogs = res;
      this.applyAuditFilters();
      this.cdr.detectChanges();
    });
  }

  loadAssets() {
    this.service.getAssets().subscribe((res: any[]) => {
      this.assets = res;
      this.applyAssetFilters();
      this.cdr.detectChanges();
    });
  }


  applyFilters() {
    this.filteredStations = this.stations.filter(s => {
      const matchZone = !this.filterZone || s.zoneName === this.filterZone.zoneName;
      const matchStatus = !this.filterStatus || s.status === this.filterStatus.value;
      const matchSearch = !this.searchText || 
        (s.stationName?.toLowerCase().includes(this.searchText.toLowerCase()) || 
         s.id?.toString().includes(this.searchText));
      return matchZone && matchStatus && matchSearch;
    });
    this.cdr.detectChanges();
  }

  applyDispenserFilters() {
    this.filteredDispensers = this.dispensers.filter(d => {
      const matchStatus = !this.dispenserFilterStatus || d.status === this.dispenserFilterStatus.value;
      const matchSearch = !this.dispenserSearchText || 
        (d.dispenserName?.toLowerCase().includes(this.dispenserSearchText.toLowerCase()) || 
         d.displayId?.toString().includes(this.dispenserSearchText));
      return matchStatus && matchSearch;
    });
    this.cdr.detectChanges();
  }

  applyAuditFilters() {
    this.filteredAuditLogs = this.auditLogs.filter(log => {
      const matchType = !this.auditTypeFilter || log.entityType === this.auditTypeFilter?.value;
      const matchAction = !this.auditActionFilter || log.action === this.auditActionFilter?.value;
      return matchType && matchAction;
    });
    this.cdr.detectChanges();
  }

  onAuditFilterChange() {
    this.applyAuditFilters();
  }

  applyAssetFilters() {
    this.filteredAssets = this.assets.filter(a => {
      const matchSearch = !this.assetSearchText ||
        (a.name?.toLowerCase().includes(this.assetSearchText.toLowerCase()) ||
         a.serialNumber?.toLowerCase().includes(this.assetSearchText.toLowerCase()));
      return matchSearch;
    });
    this.cdr.detectChanges();
  }

  onAssetSearch() {
    this.applyAssetFilters();
  }

  openAddAsset() {
    this.isEditAssetMode = false;
    this.assetForm.reset();
    this.showAssetDialog = true;
  }

  openEditAsset(asset: any) {
    this.isEditAssetMode = true;
    this.assetForm.patchValue({
      id: asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      stationId: asset.stationId
    });
    this.showAssetDialog = true;
  }

  saveAsset() {
    const data = this.assetForm.getRawValue();
    if (this.isEditAssetMode && data.id) {
      this.service.updateAsset(data.id, { name: data.name, serialNumber: data.serialNumber }).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Asset updated successfully' });
          this.loadAssets();
          this.showAssetDialog = false;
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update asset' })
      });
    } else {
      this.service.createAsset({ name: data.name, serialNumber: data.serialNumber, stationId: data.stationId }).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Asset created successfully' });
          this.loadAssets();
          this.showAssetDialog = false;
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create asset' })
      });
    }
  }

  hideAssetDialog() {
    this.showAssetDialog = false;
  }


  applyCompressorFilters() {
    this.filteredCompressors = this.compressors.filter(c => {
      const matchSearch = !this.compressorSearchText || 
        (c.name?.toLowerCase().includes(this.compressorSearchText.toLowerCase()) || 
         c.code?.toLowerCase().includes(this.compressorSearchText.toLowerCase()));
      return matchSearch;
    });
    this.cdr.detectChanges();
  }

  onFilterChange() {
    this.applyFilters();
  }

  onDispenserFilterChange() {
    this.applyDispenserFilters();
  }

  onSearch() {
    this.loadStations();
  }

  onDispenserSearch() {
    // Dispensers seem to be client-side only per current implementation
    this.applyDispenserFilters();
  }

  loadZones() {
    this.service.getZones().subscribe((res: any[]) => {
      this.zones = res.map(z => ({ 
        id: z.zoneId, 
        zoneName: z.name 
      }));
    });
  }

  formatSourceDestParts(str: string): { from: string, to: string } {
    if (!str) return { from: '-', to: '' };
    const parts = str.split(' → ');
    if (parts.length > 1) {
      return { from: parts[0], to: parts[1] };
    }
    return { from: str, to: '' };
  }

  startDispenserWizard() {

    this.dispenserStep = 1;
    this.isNewMachine = false;
    this.selectedMachine = null;
    this.machineForm.reset();
    this.dispenserForm.reset({ dispenser_No: 1 });
    this.viewMode = 'dispenserWizard';
  }

  toggleNewMachine(isNew: boolean) {
    this.isNewMachine = isNew;
    if (!isNew) {
      this.selectedMachine = null;
    }
  }

  onMachineSelect(machine: any) {
    this.selectedMachine = machine;
    this.dispenserForm.patchValue({ 
      machineId: machine.id,
      stationId: machine.stationId
    });
    this.updateDispenserName();
  }

  updateDispenserName() {
    const machine = this.isNewMachine ? this.machineForm.value : this.selectedMachine;
    const machineName = machine?.name;
    const num = this.dispenserForm.get('dispenser_No')?.value;
    
    if (machineName && num) {
      this.dispenserForm.get('name')?.setValue(`${machineName}_${num}`, { emitEvent: false });
    }
  }

  nextStep() {
    if (this.dispenserStep === 1) {
      if (this.isNewMachine) {
        if (this.machineForm.valid) {
          const machineData = this.machineForm.value;
          this.service.createMachine(machineData).subscribe(res => {
            // Merge response with sent data to ensure all fields are present
            this.selectedMachine = { ...machineData, ...res };
            this.dispenserForm.patchValue({ 
              machineId: this.selectedMachine.id || res.machineId,
              stationId: this.selectedMachine.stationId 
            });
            this.updateDispenserName();
            this.dispenserStep = 2;
            this.loadMachines();
          });
        }
      } else if (this.selectedMachine) {
        this.dispenserStep = 2;
        this.updateDispenserName(); // Ensure name is set when moving to step 2
      }
    }
  }

  saveDispenser() {
    const data = this.dispenserForm.getRawValue();
    
    // Fallback if patchValue failed for some reason
    if (!data.machineId && this.selectedMachine) {
      data.machineId = this.selectedMachine.id || this.selectedMachine.machineId;
      data.stationId = this.selectedMachine.stationId;
    }

    if (this.dispenserForm.valid && data.machineId) {
      this.service.createDispenser(data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Dispenser added successfully' });
          this.loadDispensers();
          const nextNo = (this.dispenserForm.get('dispenser_No')?.value || 0) + 1;
          this.dispenserForm.patchValue({ 
            dispenser_No: nextNo,
            serialNumper: '' 
          });
          this.updateDispenserName();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add dispenser' });
          console.error('Dispenser save error:', err);
        }
      });
    } else {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Incomplete Data', 
        detail: 'Please ensure all fields are filled, including Serial Number and Machine selection.' 
      });
    }
  }

  finishWizard() {
    this.viewMode = 'list';
  }

  openAdd() {
    this.isEditMode = false;
    this.editingId = null;
    this.stationForm.reset({ priceconversionValue: 10.54 });
    this.selectedLocation = null;
    this.viewMode = 'form';
  }

  openEdit(station: Station) {
    this.isEditMode = true;
    this.editingId = station.id!;
    this.stationForm.patchValue({
      id: station.id,
      name: station.stationName || station.name,
      phone: station.phone || '',
      email: station.email || '',
      location: station.location,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      priceconversionValue: station.priceconversionValue,
      zoneId: station.zoneId,
    });
    this.selectedLocation = {
      lat: parseFloat(station.latitude),
      lng: parseFloat(station.longitude),
    };
    this.viewMode = 'form';
  }

  onLocationSelected(event: { lat: number; lng: number }) {
    this.selectedLocation = event;
    this.stationForm.patchValue({
      latitude: event.lat.toString(),
      longitude: event.lng.toString(),
    });
  }

  saveStation() {
    if (this.stationForm.valid) {
      const data = this.stationForm.getRawValue();
      const obs = (this.isEditMode && this.editingId) 
        ? this.service.updateStation(this.editingId, data)
        : this.service.createStation(data);

      obs.subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: `Station ${this.isEditMode ? 'updated' : 'created'} successfully` 
          });
          this.loadStations();
          this.viewMode = 'list';
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save station' });
          console.error('Error saving station:', err);
        },
      });
    }
  }

  confirmDelete(id: number) {
    this.itemToDelete = id;
    this.deleteMode = 'station';
    this.showConfirmDelete = true;
  }

  confirmDeleteDispenser(id: number) {
    this.itemToDelete = id;
    this.deleteMode = 'dispenser';
    this.showConfirmDelete = true;
  }

  confirmDeleteCompressor(id: number) {
    this.itemToDelete = id;
    this.deleteMode = 'compressor';
    this.showConfirmDelete = true;
  }

  confirmUnlinkCompressor(id: number) {
    this.itemToDelete = id;
    this.deleteMode = 'unlinkCompressor';
    this.showConfirmDelete = true;
  }

  confirmDeleteAsset(id: number) {
    this.itemToDelete = id;
    this.deleteMode = 'asset';
    this.showConfirmDelete = true;
  }

  getStationName(stationId: number): string {
    const station = this.stations.find((s: any) => s.id === stationId);
    return station?.stationName || station?.name || `Station ${stationId}`;
  }

  onDeleteConfirmed() {
    if (this.itemToDelete) {
      let obs;
      if (this.deleteMode === 'station') obs = this.service.deleteStation(this.itemToDelete);
      else if (this.deleteMode === 'dispenser') obs = this.service.deleteDispenser(this.itemToDelete);
      else if (this.deleteMode === 'unlinkCompressor') obs = this.service.unlinkCompressor(this.itemToDelete);
      else if (this.deleteMode === 'asset') obs = this.service.updateAsset(this.itemToDelete, { isActive: false });
      else obs = this.service.deleteCompressor(this.itemToDelete);

      obs.subscribe(() => {
        const isUnlink = this.deleteMode === 'unlinkCompressor';
        const label = this.deleteMode === 'station' ? 'Station' : this.deleteMode === 'dispenser' ? 'Dispenser' : this.deleteMode === 'asset' ? 'Asset' : 'Compressor';
        this.messageService.add({ 
          severity: 'success', 
          summary: isUnlink ? 'Unlinked' : 'Deleted', 
          detail: isUnlink ? 'Compressor unlinked successfully' : `${label} removed successfully` 
        });
        if (this.deleteMode === 'station') this.loadStations();
        else if (this.deleteMode === 'dispenser') this.loadDispensers();
        else if (this.deleteMode === 'asset') this.loadAssets();
        else this.loadCompressors();
      });
    }
    this.showConfirmDelete = false;
  }

  // --- Compressor Modal Methods ---

  openAddCompressor() {
    this.isEditCompressorMode = false;
    this.editingId = null;
    this.compressorForm.reset({
      name: '',
      code: '',
      brokerId: '',
      serialNumber: '',
      stationId: null,
      compressorManufacturerId: null
    });
    this.showCompressorDialog = true;
  }

  openEditCompressor(compressor: any) {
    this.isEditCompressorMode = true;
    this.editingId = compressor.id;
    this.compressorForm.patchValue({
      id: compressor.id,
      name: compressor.name,
      code: compressor.code,
      brokerId: compressor.brokerId,
      serialNumber: compressor.serialNumber,
      stationId: compressor.stationId,
      compressorManufacturerId: compressor.compressorManufacturerId
    });
    this.showCompressorDialog = true;
  }

  hideCompressorDialog() {
    this.showCompressorDialog = false;
  }

  saveCompressor() {
    if (this.compressorForm.valid) {
      const data = this.compressorForm.value;
      const obs = (this.isEditCompressorMode && this.editingId)
        ? this.service.updateCompressor(this.editingId, data)
        : this.service.createCompressor(data);

      obs.subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Compressor ${this.isEditCompressorMode ? 'updated' : 'created'}` });
          this.loadCompressors();
          this.hideCompressorDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
        }
      });
    }
  }

  // Removed unlinkCompressor method as it is now handled by onDeleteConfirmed
  
  onCancelEdit() {
    this.viewMode = 'list';
  }
}
